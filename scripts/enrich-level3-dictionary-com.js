const fs = require('fs');
const path = require('path');

// Read the Level 3 vocabulary JSON file
const dataPath = path.join(__dirname, '../data/wordly-wise-level-3.json');
const vocabularyData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

console.log(`📚 Found ${vocabularyData.words.length} words to enrich with examples from dictionary.com\n`);

// Clean HTML text
function cleanText(html) {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&rdquo;/g, '"')
    .replace(/&ldquo;/g, '"')
    .replace(/&#[0-9]+;/g, ' ') // Remove any remaining numeric entities
    .replace(/\s+/g, ' ')
    .trim();
}

// Function to extract examples from dictionary.com HTML
function extractExamplesFromDictionaryCom(html, word) {
  const examples = [];
  
  // Dictionary.com examples are often in:
  // 1. <div class="example-sentences"> or similar
  // 2. <span class="luna-example"> or similar
  // 3. <div class="def-content"> with example sentences
  // 4. <p> tags with example classes
  
  // Try multiple patterns to find examples
  const patterns = [
    // Pattern 1: Look for example sentences in divs with example-related classes
    /<div[^>]*class="[^"]*(?:example|sentences?|usage)[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    
    // Pattern 2: Look for spans with example classes
    /<span[^>]*class="[^"]*(?:example|luna-example|ex)[^"]*"[^>]*>([\s\S]*?)<\/span>/gi,
    
    // Pattern 3: Look in definition content areas
    /<div[^>]*class="[^"]*def-content[^"]*"[^>]*>([\s\S]{0,2000})<\/div>/gi,
    
    // Pattern 4: Look for italicized example sentences (common in dictionary.com)
    /<em[^>]*>([^<]+(?:<[^>]+>[^<]*<\/[^>]+>[^<]*)*[^<]{20,200})<\/em>/gi,
    
    // Pattern 5: Look for sentences in <p> tags that contain the word
    /<p[^>]*>([^<]{20,300}(?:<[^>]+>[^<]*<\/[^>]+>[^<]*)*[^<]{0,100})<\/p>/gi,
    
    // Pattern 6: Look for example sentences after colons in definitions
    /:[\s]*([A-Z][^<]{20,200}(?:<[^>]+>[^<]*<\/[^>]+>[^<]*)*[^<]{0,100})/gi,
  ];
  
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(html)) !== null && examples.length < 5) {
      let text = cleanText(match[1]);
      
      // Filter for valid example sentences
      if (
        text.length > 20 &&
        text.length < 300 &&
        text.toLowerCase().includes(word.toLowerCase()) &&
        !text.toLowerCase().includes('example sentences') &&
        !text.toLowerCase().includes('see more') &&
        !text.toLowerCase().includes('click here') &&
        !text.toLowerCase().includes('dictionary.com') &&
        !text.match(/^[a-z]/) && // Should start with capital letter
        text.includes(' ') && // Should be a sentence, not a single word
        !examples.some(ex => ex.includes(text.substring(0, 30))) // Avoid duplicates
      ) {
        // Clean up the text further
        text = text.replace(/^[:\-–—]\s*/, ''); // Remove leading punctuation
        text = text.replace(/\s+/g, ' '); // Normalize whitespace
        
        if (text.length > 20 && text.length < 300) {
          examples.push(text);
        }
      }
    }
    if (examples.length >= 5) break;
  }
  
  // Also try to find examples in the main content area
  if (examples.length < 5) {
    const mainContentMatch = html.match(/<main[^>]*>([\s\S]{0,50000})<\/main>/i) ||
                             html.match(/<div[^>]*class="[^"]*dictionary-entry[^"]*"[^>]*>([\s\S]{0,50000})<\/div>/i) ||
                             html.match(/<div[^>]*id="[^"]*dictionary[^"]*"[^>]*>([\s\S]{0,50000})<\/div>/i);
    
    if (mainContentMatch) {
      const mainContent = mainContentMatch[1];
      
      // Look for sentences that contain the word and are in example contexts
      const exampleContextPatterns = [
        /(?:<em>|<i>|<span[^>]*class="[^"]*example[^"]*"[^>]*>)([^<]{20,250}(?:<[^>]+>[^<]*<\/[^>]+>[^<]*)*[^<]{0,50})(?:<\/em>|<\/i>|<\/span>)/gi,
        /(?:Example|Usage):\s*([A-Z][^<]{20,250}(?:<[^>]+>[^<]*<\/[^>]+>[^<]*)*[^<]{0,50})/gi,
      ];
      
      for (const pattern of exampleContextPatterns) {
        let match;
        while ((match = pattern.exec(mainContent)) !== null && examples.length < 5) {
          let text = cleanText(match[1]);
          
          if (
            text.length > 20 &&
            text.length < 300 &&
            text.toLowerCase().includes(word.toLowerCase()) &&
            !examples.some(ex => ex.includes(text.substring(0, 30)))
          ) {
            examples.push(text);
          }
        }
        if (examples.length >= 5) break;
      }
    }
  }
  
  // Remove duplicates and limit to 5
  const uniqueExamples = [];
  for (const ex of examples) {
    if (!uniqueExamples.some(u => u.includes(ex.substring(0, 30)) || ex.includes(u.substring(0, 30)))) {
      uniqueExamples.push(ex);
      if (uniqueExamples.length >= 5) break;
    }
  }
  
  return uniqueExamples;
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
    
    // Skip if already has examples
    if (word.examples && word.examples.length > 0) {
      console.log(`⏭️  [${i + 1}/${vocabularyData.words.length}] Skipping "${word.word}" (already has ${word.examples.length} examples)`);
      processed++;
      continue;
    }
    
    console.log(`🔍 [${i + 1}/${vocabularyData.words.length}] Processing "${word.word}"...`);
    
    try {
      // Fetch dictionary.com page
      const dictUrl = `https://www.dictionary.com/browse/${encodeURIComponent(wordText)}`;
      const dictResponse = await fetch(dictUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      
      if (!dictResponse.ok) {
        throw new Error(`HTTP ${dictResponse.status}`);
      }
      
      const dictHtml = await dictResponse.text();
      const examples = extractExamplesFromDictionaryCom(dictHtml, wordText);
      
      // Update word data
      if (examples.length > 0) {
        word.examples = examples;
        updated++;
        console.log(`  ✅ Found ${examples.length} examples`);
        examples.forEach((ex, idx) => {
          console.log(`     ${idx + 1}. ${ex.substring(0, 80)}${ex.length > 80 ? '...' : ''}`);
        });
      } else {
        console.log(`  ⚠️  No examples found`);
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

