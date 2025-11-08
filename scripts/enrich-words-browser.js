const fs = require('fs');
const path = require('path');

// Read the vocabulary JSON file
const dataPath = path.join(__dirname, '../data/wordly-wise-level-3.json');
const vocabularyData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

console.log(`📚 Found ${vocabularyData.words.length} words to enrich\n`);

// This script will be run with browser automation
// For now, let's create a helper script that processes words
// The actual browser automation will be done separately

// Function to extract data from a word's page
function extractWordData(html, word) {
  const data = {
    examples: [],
    synonyms: [],
    antonyms: [],
    furtherInfo: []
  };
  
  // Extract examples - look for example sentences
  // Examples are usually in sections with id="examples" or class containing "ex"
  const exampleRegex = /<section[^>]*id=["']examples["'][^>]*>([\s\S]*?)<\/section>/i;
  const exampleMatch = html.match(exampleRegex);
  if (exampleMatch) {
    const exampleSection = exampleMatch[1];
    // Find sentences in <p> tags or divs with example classes
    const sentenceRegex = /<p[^>]*>([^<]+(?:<[^>]+>[^<]*<\/[^>]+>[^<]*)*[^<]+)<\/p>/gi;
    let match;
    while ((match = sentenceRegex.exec(exampleSection)) !== null && data.examples.length < 5) {
      let text = match[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      // Filter out navigation and metadata
      if (text.length > 15 && 
          !text.toLowerCase().includes('example sentences') &&
          !text.toLowerCase().includes('see more') &&
          text.toLowerCase().includes(word.toLowerCase())) {
        data.examples.push(text);
      }
    }
  }
  
  // Extract synonyms - check for thesaurus link or synonym section
  const synonymRegex = /<a[^>]*href=["']\/thesaurus\/[^"']*["'][^>]*>([^<]+)<\/a>/gi;
  let match;
  while ((match = synonymRegex.exec(html)) !== null && data.synonyms.length < 10) {
    const text = match[1].trim();
    if (text && text.length > 0 && !text.toLowerCase().includes('see') && !text.toLowerCase().includes('more')) {
      data.synonyms.push(text);
    }
  }
  
  // Extract antonyms - usually in a separate section
  const antonymRegex = /<h[23][^>]*>Antonyms?<\/h[23]>[\s\S]*?<ul[^>]*>([\s\S]*?)<\/ul>/i;
  const antonymMatch = html.match(antonymRegex);
  if (antonymMatch) {
    const antonymList = antonymMatch[1];
    const antonymLinkRegex = /<a[^>]*>([^<]+)<\/a>/gi;
    while ((match = antonymLinkRegex.exec(antonymList)) !== null && data.antonyms.length < 10) {
      const text = match[1].trim();
      if (text) {
        data.antonyms.push(text);
      }
    }
  }
  
  // Extract further information (etymology, word history)
  const etymologyRegex = /<section[^>]*id=["']word-history["'][^>]*>([\s\S]*?)<\/section>/i;
  const etymologyMatch = html.match(etymologyRegex);
  if (etymologyMatch) {
    let text = etymologyMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (text.length > 20) {
      data.furtherInfo.push(text.substring(0, 500));
    }
  }
  
  return data;
}

// Export functions for use
module.exports = {
  vocabularyData,
  dataPath,
  extractWordData
};

// If run directly, show instructions
if (require.main === module) {
  console.log(`
📝 Instructions for enriching words with Merriam-Webster data:

This script provides helper functions. To actually enrich the words, you'll need to:

1. Use browser automation to visit each word's Merriam-Webster page
2. Extract the HTML content
3. Use extractWordData() to parse the HTML
4. Update the vocabularyData object
5. Save the updated data

For now, let's create a simpler approach using fetch API (Node.js 18+).
`);
  
  // Try to use fetch if available (Node.js 18+)
  if (typeof fetch !== 'undefined') {
    console.log('✅ Fetch API is available. Creating enrichment script...\n');
  } else {
    console.log('⚠️  Fetch API not available. Please use Node.js 18+ or install node-fetch.\n');
  }
}

