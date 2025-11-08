// This script uses browser automation to extract data from Merriam-Webster
// It should be run with browser automation tools (like Puppeteer or the MCP browser extension)

const fs = require('fs');
const path = require('path');

// Read the vocabulary JSON file
const dataPath = path.join(__dirname, '../data/wordly-wise-level-3.json');
let vocabularyData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

console.log(`📚 Found ${vocabularyData.words.length} words to enrich\n`);

// Function to extract data from a word's Merriam-Webster page using browser automation
// This function should be called from a browser automation context
function extractWordDataFromBrowser(word) {
  const data = {
    examples: [],
    synonyms: [],
    antonyms: [],
    furtherInfo: []
  };
  
  // This code runs in the browser context
  const browserCode = `
    (function() {
      const word = "${word.toLowerCase()}";
      const results = {
        examples: [],
        synonyms: [],
        antonyms: [],
        furtherInfo: []
      };
      
      // Extract examples
      const exampleSelectors = [
        '#examples p',
        '#examples div[class*="ex"]',
        '#examples li',
        'section[id="examples"] p',
        'section[id="examples"] div',
        '.ex-sent',
        '[data-example]'
      ];
      
      for (const selector of exampleSelectors) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          const text = el.textContent.trim();
          if (text && text.length > 15 && 
              !text.toLowerCase().includes('example sentences') &&
              !text.toLowerCase().includes('see more') &&
              text.toLowerCase().includes(word) &&
              !results.examples.some(ex => ex.includes(text.substring(0, 20)))) {
            results.examples.push(text);
          }
        });
        if (results.examples.length >= 5) break;
      }
      
      // Also look in main content for embedded examples
      const mainContent = document.querySelector('main, .dictionary-entry, [role="main"]');
      if (mainContent && results.examples.length < 5) {
        const allText = mainContent.textContent;
        const sentences = allText.split(/[.!?]+/).filter(s => {
          const trimmed = s.trim();
          return trimmed.toLowerCase().includes(word) && 
                 trimmed.length > 20 && 
                 trimmed.length < 200;
        });
        sentences.slice(0, 5).forEach(s => {
          const trimmed = s.trim();
          if (!results.examples.some(ex => ex.includes(trimmed.substring(0, 20)))) {
            results.examples.push(trimmed);
          }
        });
      }
      
      // Extract synonyms from thesaurus link
      const synonymLink = document.querySelector('a[href*="/thesaurus/"]');
      if (synonymLink) {
        // Navigate to thesaurus page would be done separately
        // For now, extract from dictionary page
        const synonymElements = document.querySelectorAll('a[href*="/thesaurus/"]');
        synonymElements.forEach(el => {
          const text = el.textContent.trim();
          if (text && text.length > 0 && 
              !text.toLowerCase().includes('see') && 
              !text.toLowerCase().includes('more') &&
              !text.toLowerCase().includes('thesaurus')) {
            results.synonyms.push(text);
          }
        });
      }
      
      // Extract further information (etymology)
      const etymologySection = document.getElementById('word-history');
      if (etymologySection) {
        const text = etymologySection.textContent.trim();
        if (text.length > 20) {
          results.furtherInfo.push(text.substring(0, 500));
        }
      }
      
      return results;
    })();
  `;
  
  return browserCode;
}

// This is a template for browser automation
// The actual implementation would use Puppeteer or similar
console.log(`
📝 Browser Automation Script Template

To use this script with browser automation:

1. For each word:
   a. Navigate to: https://www.merriam-webster.com/dictionary/{word}
   b. Wait for page to load
   c. Execute the extraction code (see extractWordDataFromBrowser function)
   d. Navigate to: https://www.merriam-webster.com/thesaurus/{word}
   e. Extract synonyms and antonyms
   f. Update vocabularyData
   g. Save progress

2. The extraction code should be run in the browser context to access the DOM.

Since we have browser automation tools available, let's create a simpler approach:
- Process words in batches
- Use the browser tools to navigate and extract
- Save progress frequently
`);

// Export for use with browser automation
module.exports = {
  vocabularyData,
  dataPath,
  extractWordDataFromBrowser
};

