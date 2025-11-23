/**
 * Script to add Lexile levels to vocabulary words based on word frequency
 *
 * Methodology:
 * - Uses Google's 10,000 most common English words (ranked by frequency)
 * - Maps word frequency rank to Lexile levels based on grade-level bands
 * - Lower rank (1-1000) = more common = lower Lexile
 * - Higher rank (5000+) or not in top 10k = rare = higher Lexile
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// Lexile Level Mapping Based on Word Frequency
// ============================================================================

/**
 * Map word frequency rank to Lexile level
 * Based on research:
 * - Grades 3-4: 500L-700L (most common words, rank 1-2000)
 * - Grades 4-6: 700L-900L (common words, rank 2000-4000)
 * - Grades 6-7: 800L-1000L (moderate vocabulary, rank 3000-5000)
 * - Grades 7-8: 900L-1100L (academic words, rank 4000-6500)
 * - Grades 8-10: 1000L-1200L (advanced words, rank 6000-8000)
 * - Grades 9-12: 1100L-1300L (college-prep, rank 8000+ or not in top 10k)
 */
function rankToLexileLevel(rank) {
  if (rank === null || rank === undefined) {
    // Word not found in top 10k = rare/advanced word
    return "1100L-1300L";
  }

  if (rank <= 2000) {
    return "500L-700L";
  } else if (rank <= 4000) {
    return "700L-900L";
  } else if (rank <= 5000) {
    return "800L-1000L";
  } else if (rank <= 6500) {
    return "900L-1100L";
  } else if (rank <= 8000) {
    return "1000L-1200L";
  } else {
    return "1100L-1300L";
  }
}

// ============================================================================
// Load Word Frequency Data
// ============================================================================

function loadWordFrequencyData() {
  const frequencyFile = path.join(__dirname, '../data/google-word-frequency.txt');
  const content = fs.readFileSync(frequencyFile, 'utf-8');
  const words = content.trim().split('\n');

  // Create a map: word -> rank (1-based index)
  const wordRankMap = new Map();
  words.forEach((word, index) => {
    wordRankMap.set(word.toLowerCase().trim(), index + 1);
  });

  console.log(`Loaded ${wordRankMap.size} words from frequency database`);
  return wordRankMap;
}

// ============================================================================
// Process Vocabulary Files
// ============================================================================

function addLexileLevelsToFile(filePath, wordRankMap) {
  console.log(`\nProcessing: ${path.basename(filePath)}`);

  // Read the vocabulary file
  const content = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(content);

  if (!data.words || !Array.isArray(data.words)) {
    console.log(`⚠️  Skipping ${filePath} - no 'words' array found`);
    return;
  }

  let updated = 0;
  let notFound = 0;
  const lexileDistribution = {};

  // Add lexile_level to each word
  data.words.forEach(wordObj => {
    const word = wordObj.word.toLowerCase().trim();
    const rank = wordRankMap.get(word);
    const lexileLevel = rankToLexileLevel(rank);

    wordObj.lexile_level = lexileLevel;

    // Track statistics
    lexileDistribution[lexileLevel] = (lexileDistribution[lexileLevel] || 0) + 1;

    if (rank) {
      updated++;
    } else {
      notFound++;
    }
  });

  // Write updated data back to file
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');

  console.log(`✅ Updated ${data.words.length} words`);
  console.log(`   - Found in frequency db: ${updated}`);
  console.log(`   - Not found (assigned advanced level): ${notFound}`);
  console.log(`   - Lexile distribution:`);
  Object.entries(lexileDistribution)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .forEach(([level, count]) => {
      console.log(`     ${level}: ${count} words`);
    });
}

// ============================================================================
// Main Script
// ============================================================================

function main() {
  console.log('='.repeat(70));
  console.log('Adding Lexile Levels to SSAT Vocabulary Words');
  console.log('='.repeat(70));

  // Load word frequency data
  const wordRankMap = loadWordFrequencyData();

  // List of vocabulary files to process
  const vocabFiles = [
    '../data/vocabulary-words.json',
    '../data/wordly-wise-level-3.json',
    '../data/wordly-wise-level-4.json',
    '../data/wordly-wise-level-5.json',
    '../data/wordly-wise-level-6.json',
    '../data/wordly-wise-level-7.json',
  ];

  // Process each file
  vocabFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      addLexileLevelsToFile(filePath, wordRankMap);
    } else {
      console.log(`⚠️  File not found: ${filePath}`);
    }
  });

  console.log('\n' + '='.repeat(70));
  console.log('✅ Lexile levels added successfully!');
  console.log('='.repeat(70));
}

// Run the script
main();
