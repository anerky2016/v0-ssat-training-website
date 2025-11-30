const fs = require('fs');
const path = require('path');

const INPUT_FILE = path.join(__dirname, '../data/combined-sentence-completion.json');
const OUTPUT_FILE = path.join(__dirname, '../data/combined-sentence-completion-cleaned.json');
const BACKUP_FILE = path.join(__dirname, '../data/combined-sentence-completion-backup.json');

/**
 * Remove questions with null or missing correctAnswer
 */
function cleanInvalidQuestions() {
  console.log('=== Cleaning Invalid Questions ===\n');

  // Read the combined data
  const data = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));

  console.log('Original data:');
  console.log(`  - Chapter questions: ${data.chapterQuestions.length}`);
  console.log(`  - Sentence completion questions: ${data.sentenceCompletionQuestions.length}`);
  console.log(`  - Total: ${data.chapterQuestions.length + data.sentenceCompletionQuestions.length}`);

  // Create backup
  fs.writeFileSync(BACKUP_FILE, JSON.stringify(data, null, 2));
  console.log(`\nBackup created: ${BACKUP_FILE}`);

  // Filter out invalid chapter questions
  const validChapterQuestions = [];
  const invalidChapterQuestions = [];
  const invalidByChapter = {};

  data.chapterQuestions.forEach(q => {
    if (q.correctAnswer && q.correctAnswer !== null) {
      validChapterQuestions.push(q);
    } else {
      invalidChapterQuestions.push(q);
      invalidByChapter[q.chapter] = (invalidByChapter[q.chapter] || 0) + 1;
    }
  });

  console.log('\n=== Filtering Results ===');
  console.log(`Valid chapter questions: ${validChapterQuestions.length}`);
  console.log(`Invalid chapter questions: ${invalidChapterQuestions.length}`);

  if (invalidChapterQuestions.length > 0) {
    console.log('\nInvalid questions by chapter:');
    Object.keys(invalidByChapter).sort((a,b) => Number(a) - Number(b)).forEach(ch => {
      console.log(`  Chapter ${ch}: ${invalidByChapter[ch]} removed`);
    });
  }

  // All sentence completion questions should be valid, but check anyway
  const validSentenceCompletion = data.sentenceCompletionQuestions.filter(q => {
    return q.answer && q.answer !== null && q.answer !== '';
  });

  const removedSentenceCompletion = data.sentenceCompletionQuestions.length - validSentenceCompletion.length;
  if (removedSentenceCompletion > 0) {
    console.log(`\nRemoved ${removedSentenceCompletion} invalid sentence completion questions`);
  }

  // Create cleaned data
  const cleanedData = {
    metadata: {
      totalQuestions: validChapterQuestions.length + validSentenceCompletion.length,
      chapterQuestions: validChapterQuestions.length,
      existingSentenceCompletions: validSentenceCompletion.length,
      chapters: data.metadata.chapters,
      generatedAt: new Date().toISOString(),
      cleanedAt: new Date().toISOString(),
      originalCounts: {
        chapterQuestions: data.chapterQuestions.length,
        sentenceCompletionQuestions: data.sentenceCompletionQuestions.length,
        removed: invalidChapterQuestions.length + removedSentenceCompletion
      }
    },
    chapterQuestions: validChapterQuestions,
    sentenceCompletionQuestions: validSentenceCompletion
  };

  // Write cleaned data
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(cleanedData, null, 2));
  console.log(`\n=== Cleaned Data Written ===`);
  console.log(`Output file: ${OUTPUT_FILE}`);
  console.log(`Total valid questions: ${cleanedData.metadata.totalQuestions}`);
  console.log(`  - Chapter questions: ${cleanedData.metadata.chapterQuestions}`);
  console.log(`  - Sentence completion questions: ${cleanedData.metadata.existingSentenceCompletions}`);

  // Show chapter distribution of cleaned data
  console.log('\n=== Chapter Distribution (Cleaned) ===');
  const chapterCounts = {};
  validChapterQuestions.forEach(q => {
    chapterCounts[q.chapter] = (chapterCounts[q.chapter] || 0) + 1;
  });

  Object.keys(chapterCounts).sort((a,b) => Number(a) - Number(b)).forEach(ch => {
    console.log(`  Chapter ${ch}: ${chapterCounts[ch]} questions`);
  });

  return cleanedData;
}

// Run the cleanup
try {
  const result = cleanInvalidQuestions();
  console.log('\n✅ Cleanup completed successfully!');
  console.log(`\nBackup: ${BACKUP_FILE}`);
  console.log(`Cleaned: ${OUTPUT_FILE}`);
  console.log(`\nNext step: Use the cleaned file for transformation`);
} catch (error) {
  console.error('❌ Error during cleanup:', error);
  process.exit(1);
}
