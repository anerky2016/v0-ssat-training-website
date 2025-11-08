const fs = require('fs');
const path = require('path');

// Read the vocabulary JSON file
const dataPath = path.join(__dirname, '../data/wordly-wise-level-3.json');
const vocabularyData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Function to extract data from Merriam-Webster HTML
async function fetchWordData(word) {
  try {
    const url = `https://www.merriam-webster.com/dictionary/${encodeURIComponent(word.toLowerCase())}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.log(`⚠️  Failed to fetch ${word}: ${response.status}`);
      return null;
    }
    
    const html = await response.text();
    
    // Extract examples
    const examples = [];
    const exampleMatch = html.match(/<section[^>]*id="examples"[^>]*>([\s\S]*?)<\/section>/i);
    if (exampleMatch) {
      const exampleText = exampleMatch[1];
      // Find example sentences (usually in <p> tags or specific divs)
      const exampleRegex = /<p[^>]*class="[^"]*ex[^"]*"[^>]*>([^<]+)<\/p>/gi;
      let match;
      while ((match = exampleRegex.exec(exampleText)) !== null && examples.length < 5) {
        const text = match[1].trim().replace(/<[^>]+>/g, '');
        if (text.length > 10) {
          examples.push(text);
        }
      }
    }
    
    // Extract synonyms from thesaurus link
    const synonyms = [];
    try {
      const thesaurusUrl = `https://www.merriam-webster.com/thesaurus/${encodeURIComponent(word.toLowerCase())}`;
      const thesaurusResponse = await fetch(thesaurusUrl);
      if (thesaurusResponse.ok) {
        const thesaurusHtml = await thesaurusResponse.text();
        // Find synonym links
        const synonymRegex = /<a[^>]*class="[^"]*thes-list__item[^"]*"[^>]*>([^<]+)<\/a>/gi;
        let match;
        while ((match = synonymRegex.exec(thesaurusHtml)) !== null && synonyms.length < 10) {
          const text = match[1].trim();
          if (text && !text.includes('See') && !text.includes('More')) {
            synonyms.push(text);
          }
        }
      }
    } catch (e) {
      // If thesaurus fails, try to get synonyms from dictionary page
      const synonymMatch = html.match(/<a[^>]*href="\/thesaurus\/[^"]*"[^>]*>([^<]+)<\/a>/gi);
      if (synonymMatch) {
        synonymMatch.slice(0, 10).forEach(m => {
          const text = m.replace(/<[^>]+>/g, '').trim();
          if (text && text.length > 0) {
            synonyms.push(text);
          }
        });
      }
    }
    
    // Extract antonyms
    const antonyms = [];
    try {
      const thesaurusUrl = `https://www.merriam-webster.com/thesaurus/${encodeURIComponent(word.toLowerCase())}`;
      const thesaurusResponse = await fetch(thesaurusUrl);
      if (thesaurusResponse.ok) {
        const thesaurusHtml = await thesaurusResponse.text();
        // Look for antonyms section
        const antonymSection = thesaurusHtml.match(/<h3[^>]*>Antonyms<\/h3>[\s\S]*?<ul[^>]*>([\s\S]*?)<\/ul>/i);
        if (antonymSection) {
          const antonymRegex = /<a[^>]*class="[^"]*thes-list__item[^"]*"[^>]*>([^<]+)<\/a>/gi;
          let match;
          while ((match = antonymRegex.exec(antonymSection[1])) !== null && antonyms.length < 10) {
            const text = match[1].trim();
            if (text) {
              antonyms.push(text);
            }
          }
        }
      }
    } catch (e) {
      // Antonyms might not be available
    }
    
    // Extract further information (etymology, word history)
    const furtherInfo = [];
    const etymologyMatch = html.match(/<section[^>]*id="word-history"[^>]*>([\s\S]*?)<\/section>/i);
    if (etymologyMatch) {
      const etymologyText = etymologyMatch[1]
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      if (etymologyText.length > 20) {
        furtherInfo.push(etymologyText.substring(0, 500)); // Limit length
      }
    }
    
    return {
      examples: examples.slice(0, 5),
      synonyms: synonyms.slice(0, 10),
      antonyms: antonyms.slice(0, 10),
      furtherInfo: furtherInfo
    };
  } catch (error) {
    console.error(`❌ Error fetching ${word}:`, error.message);
    return null;
  }
}

// Process all words
async function enrichWords() {
  console.log(`📚 Starting to enrich ${vocabularyData.words.length} words...\n`);
  
  let processed = 0;
  let updated = 0;
  
  for (let i = 0; i < vocabularyData.words.length; i++) {
    const word = vocabularyData.words[i];
    const wordText = word.word;
    
    // Skip if already has data
    if (word.examples && word.examples.length > 0 && 
        word.synonyms && word.synonyms.length > 0) {
      console.log(`⏭️  Skipping ${wordText} (already has data)`);
      processed++;
      continue;
    }
    
    console.log(`🔍 Processing ${i + 1}/${vocabularyData.words.length}: ${wordText}...`);
    
    const data = await fetchWordData(wordText);
    
    if (data) {
      // Update word data
      if (data.examples.length > 0) {
        word.examples = data.examples;
        updated++;
      }
      if (data.synonyms.length > 0) {
        word.synonyms = data.synonyms;
        updated++;
      }
      if (data.antonyms.length > 0) {
        word.antonyms = data.antonyms;
        updated++;
      }
      if (data.furtherInfo.length > 0) {
        word.further_information = data.furtherInfo;
        updated++;
      }
      
      console.log(`  ✅ Examples: ${data.examples.length}, Synonyms: ${data.synonyms.length}, Antonyms: ${data.antonyms.length}, Further Info: ${data.furtherInfo.length}`);
    } else {
      console.log(`  ⚠️  No data found for ${wordText}`);
    }
    
    processed++;
    
    // Save progress every 10 words
    if (processed % 10 === 0) {
      fs.writeFileSync(dataPath, JSON.stringify(vocabularyData, null, 2));
      console.log(`\n💾 Progress saved (${processed}/${vocabularyData.words.length} words processed)\n`);
    }
    
    // Rate limiting - wait 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Final save
  fs.writeFileSync(dataPath, JSON.stringify(vocabularyData, null, 2));
  
  console.log(`\n✅ Completed! Processed ${processed} words, updated ${updated} entries.`);
  console.log(`📁 Saved to: ${dataPath}`);
}

// Run the enrichment
enrichWords().catch(console.error);

