const fs = require('fs');
const path = require('path');

// Read the Level 4 vocabulary JSON file
const dataPath = path.join(__dirname, '../data/wordly-wise-level-4.json');
let vocabularyData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

console.log(`📚 Starting to enrich ${vocabularyData.words.length} Level 4 words from Merriam-Webster...\n`);

// Simple function to clean HTML text
function cleanText(html) {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

// Function to extract data from HTML using regex
function extractDataFromHTML(html, word) {
  const data = {
    examples: [],
    synonyms: [],
    antonyms: [],
    furtherInfo: []
  };
  
  // Extract examples from examples section
  const examplesSection = html.match(/<section[^>]*id=["']examples["'][^>]*>([\s\S]{0,5000})<\/section>/i);
  if (examplesSection) {
    const sectionContent = examplesSection[1];
    // Look for example sentences - they often contain the word
    const examplePatterns = [
      /<p[^>]*class="[^"]*ex[^"]*"[^>]*>([^<]+(?:<[^>]+>[^<]*<\/[^>]+>[^<]*)*[^<]+)<\/p>/gi,
      /<div[^>]*class="[^"]*ex[^"]*"[^>]*>([^<]+(?:<[^>]+>[^<]*<\/[^>]+>[^<]*)*[^<]+)<\/div>/gi,
      /<li[^>]*>([^<]+(?:<[^>]+>[^<]*<\/[^>]+>[^<]*)*[^<]+)<\/li>/gi
    ];
    
    for (const pattern of examplePatterns) {
      let match;
      while ((match = pattern.exec(sectionContent)) !== null && data.examples.length < 5) {
        let text = cleanText(match[1]);
        if (text.length > 15 && 
            !text.toLowerCase().includes('example sentences') &&
            !text.toLowerCase().includes('see more') &&
            text.toLowerCase().includes(word.toLowerCase())) {
          data.examples.push(text);
        }
      }
      if (data.examples.length >= 5) break;
    }
  }
  
  // Also extract examples from main dictionary content (examples are often embedded in definitions)
  const mainContentMatch = html.match(/<main[^>]*>([\s\S]{0,30000})<\/main>/i) || 
                           html.match(/<div[^>]*class="[^"]*dictionary-entry[^"]*"[^>]*>([\s\S]{0,30000})<\/div>/i);
  if (mainContentMatch && data.examples.length < 5) {
    const mainContent = mainContentMatch[1];
    // Look for example sentences in the main content - they're often in italic or specific divs
    const mainExamplePatterns = [
      // Examples in definition sections
      /<div[^>]*class="[^"]*ex[^"]*"[^>]*>([^<]+(?:<[^>]+>[^<]*<\/[^>]+>[^<]*)*[^<]+)<\/div>/gi,
      // Examples after colons in definitions
      /:[\s]*([A-Z][^<]{20,150}(?:<[^>]+>[^<]*<\/[^>]+>[^<]*)*[^<]{0,50})/gi,
      // Sentences that contain the word and are in example contexts
      /(?:<em>|<i>|<span[^>]*class="[^"]*ex[^"]*"[^>]*>)([^<]{20,200}(?:<[^>]+>[^<]*<\/[^>]+>[^<]*)*[^<]{0,50})(?:<\/em>|<\/i>|<\/span>)/gi
    ];
    
    for (const pattern of mainExamplePatterns) {
      let match;
      while ((match = pattern.exec(mainContent)) !== null && data.examples.length < 5) {
        let text = cleanText(match[1]);
        // Filter out definitions and keep only example sentences
        if (text.length > 15 && 
            text.length < 250 &&
            !text.toLowerCase().includes('definition') &&
            !text.toLowerCase().includes('example sentences') &&
            !text.toLowerCase().includes('see more') &&
            text.toLowerCase().includes(word.toLowerCase()) &&
            !data.examples.some(ex => ex.includes(text.substring(0, 30)))) {
          data.examples.push(text);
        }
      }
      if (data.examples.length >= 5) break;
    }
  }
  
  // Extract synonyms - look for thesaurus links (most reliable method)
  // Thesaurus pages have links with /thesaurus/ in href
  const thesaurusLinkPattern = /<a[^>]*href=["']([^"']*\/thesaurus\/[^"']*)["'][^>]*>([^<]+)<\/a>/gi;
  let match;
  while ((match = thesaurusLinkPattern.exec(html)) !== null && data.synonyms.length < 15) {
    const href = match[1];
    const text = cleanText(match[2]);
    
    // Only process actual thesaurus word links (not navigation)
    if (href.includes('/thesaurus/') && 
        !href.includes('#') &&
        text && 
        text.length > 0 &&
        text.length < 25 &&
        !text.includes('(') &&
        !text.includes(')') &&
        !text.toLowerCase().includes('see') &&
        !text.toLowerCase().includes('more') &&
        !text.toLowerCase().includes('synonyms') &&
        !text.toLowerCase().includes('thesaurus') &&
        text.split(' ').length <= 2 &&
        !data.synonyms.includes(text)) {
      data.synonyms.push(text);
    }
  }
  
  // Also try the thes-list__item pattern (backup)
  if (data.synonyms.length < 5) {
    const listItemPattern = /<a[^>]*class="[^"]*thes-list__item[^"]*"[^>]*>([^<]+)<\/a>/gi;
    while ((match = listItemPattern.exec(html)) !== null && data.synonyms.length < 10) {
      const text = cleanText(match[1]);
      if (text && text.length > 0 && 
          text.length < 25 &&
          !text.includes('(') &&
          !text.includes(')') &&
          text.split(' ').length <= 2 &&
          !data.synonyms.includes(text)) {
        data.synonyms.push(text);
      }
    }
  }
  
  // Remove duplicates and limit
  data.synonyms = [...new Set(data.synonyms)].slice(0, 10);
  
  // Extract antonyms
  const antonymSection = html.match(/<h[23][^>]*>Antonyms?<\/h[23]>[\s\S]{0,2000}/i);
  if (antonymSection) {
    const antonymPattern = /<a[^>]*class="[^"]*thes-list__item[^"]*"[^>]*>([^<]+)<\/a>/gi;
    let match;
    while ((match = antonymPattern.exec(antonymSection[0])) !== null && data.antonyms.length < 10) {
      const text = cleanText(match[1]);
      if (text) {
        data.antonyms.push(text);
      }
    }
  }
  
  // Extract further information (etymology)
  const etymologySection = html.match(/<section[^>]*id=["']word-history["'][^>]*>([\s\S]{0,3000})<\/section>/i);
  if (etymologySection) {
    let text = cleanText(etymologySection[1]);
    // Remove common prefixes
    text = text.replace(/^Word History\s*/i, '');
    text = text.replace(/^Etymology\s*/i, '');
    if (text.length > 20) {
      data.furtherInfo.push(text.substring(0, 500));
    }
  }
  
  return data;
}

// Main enrichment function
async function enrichWords() {
  if (typeof fetch === 'undefined') {
    console.error('❌ Fetch API not available. Please use Node.js 18+ or install node-fetch.');
    process.exit(1);
  }
  
  let processed = 0;
  let updated = 0;
  const errors = [];
  
  for (let i = 0; i < vocabularyData.words.length; i++) {
    const word = vocabularyData.words[i];
    const wordText = word.word.toLowerCase();
    
    // Skip if already has comprehensive data (examples AND good synonyms)
    // Check if synonyms are phrases (poor quality) - if so, reprocess
    const hasPoorSynonyms = word.synonyms && word.synonyms.some(s => s.includes('(') || s.split(' ').length > 2);
    const hasGoodData = word.examples && word.examples.length > 0 && 
                        word.synonyms && word.synonyms.length > 0 && !hasPoorSynonyms;
    
    if (hasGoodData) {
      console.log(`⏭️  [${i + 1}/${vocabularyData.words.length}] Skipping "${word.word}" (already has good data)`);
      processed++;
      continue;
    }
    
    // If we have poor synonyms, clear them to get better ones
    if (hasPoorSynonyms) {
      console.log(`🔄 [${i + 1}/${vocabularyData.words.length}] Reprocessing "${word.word}" (has poor quality synonyms)`);
      word.synonyms = [];
    }
    
    console.log(`🔍 [${i + 1}/${vocabularyData.words.length}] Processing "${word.word}"...`);
    
    try {
      // Fetch dictionary page
      const dictUrl = `https://www.merriam-webster.com/dictionary/${encodeURIComponent(wordText)}`;
      const dictResponse = await fetch(dictUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
      });
      
      if (!dictResponse.ok) {
        throw new Error(`HTTP ${dictResponse.status}`);
      }
      
      const dictHtml = await dictResponse.text();
      const dictData = extractDataFromHTML(dictHtml, wordText);
      
      // Always try to get synonyms and antonyms from thesaurus page (more reliable)
      try {
        const thesaurusUrl = `https://www.merriam-webster.com/thesaurus/${encodeURIComponent(wordText)}`;
        const thesaurusResponse = await fetch(thesaurusUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
          }
        });
        
        if (thesaurusResponse.ok) {
          const thesaurusHtml = await thesaurusResponse.text();
          const thesaurusData = extractDataFromHTML(thesaurusHtml, wordText);
          
          // Prioritize thesaurus synonyms (they're more accurate)
          if (thesaurusData.synonyms.length > 0) {
            dictData.synonyms = thesaurusData.synonyms;
          }
          if (thesaurusData.antonyms.length > 0) {
            dictData.antonyms = thesaurusData.antonyms;
          }
        }
      } catch (e) {
        // Thesaurus fetch failed, continue with dictionary data
        console.log(`    ⚠️  Could not fetch thesaurus page: ${e.message}`);
      }
      
      // Update word data
      let wordUpdated = false;
      if (dictData.examples.length > 0) {
        word.examples = dictData.examples;
        wordUpdated = true;
      }
      if (dictData.synonyms.length > 0) {
        word.synonyms = dictData.synonyms;
        wordUpdated = true;
      }
      if (dictData.antonyms.length > 0) {
        word.antonyms = dictData.antonyms;
        wordUpdated = true;
      }
      if (dictData.furtherInfo.length > 0) {
        word.further_information = dictData.furtherInfo;
        wordUpdated = true;
      }
      
      if (wordUpdated) {
        updated++;
        console.log(`  ✅ Examples: ${dictData.examples.length}, Synonyms: ${dictData.synonyms.length}, Antonyms: ${dictData.antonyms.length}, Info: ${dictData.furtherInfo.length}`);
      } else {
        console.log(`  ⚠️  No data found`);
      }
      
    } catch (error) {
      errors.push({ word: word.word, error: error.message });
      console.log(`  ❌ Error: ${error.message}`);
    }
    
    processed++;
    
    // Save progress every 5 words
    if (processed % 5 === 0) {
      fs.writeFileSync(dataPath, JSON.stringify(vocabularyData, null, 2));
      console.log(`\n💾 Progress saved (${processed}/${vocabularyData.words.length} words processed)\n`);
    }
    
    // Rate limiting - wait 1.5 seconds between requests to be respectful
    if (i < vocabularyData.words.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
  }
  
  // Final save
  fs.writeFileSync(dataPath, JSON.stringify(vocabularyData, null, 2));
  
  console.log(`\n✅ Completed!`);
  console.log(`   Processed: ${processed} words`);
  console.log(`   Updated: ${updated} words`);
  console.log(`   Errors: ${errors.length} words`);
  if (errors.length > 0) {
    console.log(`\n❌ Errors:`);
    errors.forEach(e => console.log(`   - ${e.word}: ${e.error}`));
  }
  console.log(`\n📁 Saved to: ${dataPath}`);
}

// Run the enrichment
enrichWords().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

