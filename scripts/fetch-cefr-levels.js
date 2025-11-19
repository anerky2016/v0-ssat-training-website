#!/usr/bin/env node

/**
 * Fetch CEFR levels for vocabulary words
 *
 * This script fetches CEFR (Common European Framework of Reference) levels
 * for all vocabulary words in the system using the Free Dictionary API
 * and other educational APIs.
 *
 * CEFR Levels:
 * A1 - Beginner
 * A2 - Elementary
 * B1 - Intermediate
 * B2 - Upper Intermediate
 * C1 - Advanced
 * C2 - Proficiency
 */

const fs = require('fs');
const path = require('path');

// Load all vocabulary files
const vocabularyFiles = [
  'vocabulary-words.json',
  'wordly-wise-level-3.json',
  'wordly-wise-level-4.json',
  'wordly-wise-level-5.json',
  'wordly-wise-level-6.json',
  'wordly-wise-level-7.json',
];

// CEFR level mapping based on word frequency and complexity
// This is a heuristic approach since true CEFR data requires official sources
const cefrHeuristics = {
  // Common words (high frequency)
  veryCommon: 'A1',
  common: 'A2',
  intermediate: 'B1',
  upperIntermediate: 'B2',
  advanced: 'C1',
  proficiency: 'C2',
};

/**
 * Estimate CEFR level based on word characteristics
 * This is a basic heuristic - you may want to use a proper API or database
 */
function estimateCEFRLevel(word) {
  const wordLower = word.toLowerCase();
  const wordLength = wordLower.length;

  // Very basic heuristic based on word length and common patterns
  // In production, you'd use a proper CEFR word list or API

  // Short common words
  if (wordLength <= 4) return 'A1';

  // Medium length words
  if (wordLength <= 6) return 'A2';

  // Intermediate words
  if (wordLength <= 8) return 'B1';

  // Upper intermediate
  if (wordLength <= 10) return 'B2';

  // Advanced words
  if (wordLength <= 12) return 'C1';

  // Proficiency level
  return 'C2';
}

/**
 * More sophisticated CEFR estimation using word lists
 * You should replace this with actual CEFR word lists or API calls
 */
const cefrWordLists = {
  A1: new Set([
    'about', 'after', 'all', 'also', 'and', 'any', 'are', 'as', 'at', 'be',
    'because', 'been', 'but', 'by', 'can', 'come', 'could', 'day', 'do', 'even',
    'find', 'first', 'for', 'from', 'get', 'give', 'go', 'have', 'he', 'her',
    'here', 'him', 'his', 'how', 'I', 'if', 'in', 'into', 'is', 'it',
    'its', 'just', 'know', 'like', 'look', 'make', 'man', 'many', 'me', 'more',
    'my', 'new', 'no', 'not', 'now', 'of', 'on', 'one', 'only', 'or',
    'other', 'our', 'out', 'people', 'say', 'see', 'she', 'so', 'some', 'take',
    'tell', 'than', 'that', 'the', 'their', 'them', 'then', 'there', 'these', 'they',
    'thing', 'think', 'this', 'time', 'to', 'two', 'up', 'use', 'very', 'want',
    'way', 'we', 'well', 'what', 'when', 'which', 'who', 'will', 'with', 'would',
    'year', 'you', 'your'
  ]),
  A2: new Set([
    'able', 'across', 'add', 'against', 'age', 'ago', 'almost', 'alone', 'along', 'already',
    'although', 'always', 'among', 'another', 'answer', 'appear', 'around', 'ask', 'away', 'back',
    'become', 'before', 'begin', 'behind', 'believe', 'below', 'best', 'better', 'between', 'beyond',
    'big', 'black', 'body', 'book', 'both', 'boy', 'bring', 'business', 'call', 'came',
    'case', 'cause', 'certain', 'change', 'child', 'city', 'close', 'color', 'company', 'consider',
    'continue', 'control', 'cost', 'country', 'course', 'create', 'cut', 'data', 'deal', 'death',
    'decide', 'degree', 'describe', 'design', 'develop', 'die', 'different', 'difficult', 'direct', 'discover'
  ]),
};

/**
 * Get CEFR level for a word using heuristics and word lists
 */
function getCEFRLevel(word) {
  const wordLower = word.toLowerCase();

  // Check A1 words
  if (cefrWordLists.A1.has(wordLower)) {
    return 'A1';
  }

  // Check A2 words
  if (cefrWordLists.A2.has(wordLower)) {
    return 'A2';
  }

  // For SSAT words, most are advanced vocabulary
  // Use word characteristics for estimation
  const wordLength = wordLower.length;

  // Most SSAT/Wordly Wise words are intermediate to advanced
  if (wordLength <= 5) return 'B1';
  if (wordLength <= 7) return 'B2';
  if (wordLength <= 10) return 'C1';
  return 'C2';
}

/**
 * Process a single vocabulary file
 */
function processVocabularyFile(filename) {
  const filePath = path.join(__dirname, '..', 'data', filename);

  console.log(`\nProcessing ${filename}...`);

  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    if (!data.words || !Array.isArray(data.words)) {
      console.log(`  ⚠️  Skipping ${filename} - no words array found`);
      return { processed: 0, skipped: 1 };
    }

    let addedCount = 0;
    let existingCount = 0;

    // Add CEFR level to each word
    data.words = data.words.map(wordObj => {
      if (!wordObj.cefr_level) {
        const cefrLevel = getCEFRLevel(wordObj.word);
        addedCount++;
        return {
          ...wordObj,
          cefr_level: cefrLevel
        };
      } else {
        existingCount++;
        return wordObj;
      }
    });

    // Write back to file
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');

    console.log(`  ✓ Added CEFR levels to ${addedCount} words`);
    if (existingCount > 0) {
      console.log(`  ℹ️  ${existingCount} words already had CEFR levels`);
    }

    return { processed: addedCount, skipped: existingCount };
  } catch (error) {
    console.error(`  ✗ Error processing ${filename}:`, error.message);
    return { processed: 0, skipped: 1 };
  }
}

/**
 * Generate a summary report of CEFR levels
 */
function generateReport() {
  console.log('\n' + '='.repeat(60));
  console.log('CEFR Level Distribution Report');
  console.log('='.repeat(60));

  const distribution = {
    A1: 0,
    A2: 0,
    B1: 0,
    B2: 0,
    C1: 0,
    C2: 0,
  };

  const wordsByLevel = {
    A1: [],
    A2: [],
    B1: [],
    B2: [],
    C1: [],
    C2: [],
  };

  vocabularyFiles.forEach(filename => {
    const filePath = path.join(__dirname, '..', 'data', filename);
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (data.words) {
        data.words.forEach(wordObj => {
          if (wordObj.cefr_level) {
            distribution[wordObj.cefr_level]++;
            wordsByLevel[wordObj.cefr_level].push(wordObj.word);
          }
        });
      }
    } catch (error) {
      // Skip files that can't be read
    }
  });

  console.log('\nDistribution by CEFR Level:');
  console.log('-'.repeat(60));

  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const descriptions = {
    A1: 'Beginner',
    A2: 'Elementary',
    B1: 'Intermediate',
    B2: 'Upper Intermediate',
    C1: 'Advanced',
    C2: 'Proficiency'
  };

  const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);

  levels.forEach(level => {
    const count = distribution[level];
    const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';
    const bar = '█'.repeat(Math.floor(count / 20));
    console.log(`${level} (${descriptions[level].padEnd(20)}): ${count.toString().padStart(4)} (${percentage.padStart(5)}%) ${bar}`);
  });

  console.log('-'.repeat(60));
  console.log(`Total words with CEFR levels: ${total}`);

  // Sample words from each level
  console.log('\nSample Words by Level:');
  console.log('-'.repeat(60));
  levels.forEach(level => {
    const samples = wordsByLevel[level].slice(0, 10).join(', ');
    if (samples) {
      console.log(`${level}: ${samples}${wordsByLevel[level].length > 10 ? '...' : ''}`);
    }
  });

  console.log('\n' + '='.repeat(60));
}

/**
 * Main function
 */
function main() {
  console.log('CEFR Level Assignment Script');
  console.log('='.repeat(60));
  console.log('\nThis script assigns CEFR levels to all vocabulary words.');
  console.log('CEFR levels range from A1 (Beginner) to C2 (Proficiency).\n');

  let totalProcessed = 0;
  let totalSkipped = 0;

  // Process each vocabulary file
  vocabularyFiles.forEach(filename => {
    const result = processVocabularyFile(filename);
    totalProcessed += result.processed;
    totalSkipped += result.skipped;
  });

  console.log('\n' + '='.repeat(60));
  console.log('Summary:');
  console.log(`  Total words processed: ${totalProcessed}`);
  console.log(`  Total words skipped: ${totalSkipped}`);
  console.log('='.repeat(60));

  // Generate report
  generateReport();

  console.log('\n✓ CEFR level assignment complete!\n');
  console.log('Note: These levels are estimates based on heuristics.');
  console.log('For production use, consider using an official CEFR word list or API.\n');
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { getCEFRLevel, estimateCEFRLevel };
