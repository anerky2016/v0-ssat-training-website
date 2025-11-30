const fs = require('fs');
const path = require('path');

const AUTO_WEB_DATA_DIR = '/Users/diz/git/auto-web/data';
const OUTPUT_FILE = path.join(__dirname, '../data/combined-sentence-completion.json');

// Read all chapter files from 3 to 40
function getAllChapterData() {
  const allQuestions = [];
  let totalQuestions = 0;

  for (let chapter = 3; chapter <= 40; chapter++) {
    // Find the chapter file (they have timestamps in the filename)
    // Use the LATEST file if multiple exist
    const files = fs.readdirSync(AUTO_WEB_DATA_DIR);
    const chapterFiles = files.filter(f =>
      f.startsWith(`chapter${chapter}-all-questions-`) && f.endsWith('.json')
    ).sort().reverse(); // Sort descending to get latest timestamp first

    const chapterFile = chapterFiles[0];

    if (!chapterFile) {
      console.log(`Warning: No file found for chapter ${chapter}`);
      continue;
    }

    const filePath = path.join(AUTO_WEB_DATA_DIR, chapterFile);
    console.log(`Reading: ${chapterFile}`);

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const chapterData = JSON.parse(content);

      if (Array.isArray(chapterData)) {
        // Add chapter information to each question
        const questionsWithChapter = chapterData.map(q => ({
          ...q,
          chapter: chapter,
          source: 'Wordly Wise 3000'
        }));

        allQuestions.push(...questionsWithChapter);
        totalQuestions += chapterData.length;
        console.log(`  Added ${chapterData.length} questions from chapter ${chapter}`);
      } else {
        console.log(`  Warning: Chapter ${chapter} data is not an array`);
      }
    } catch (error) {
      console.error(`Error reading chapter ${chapter}:`, error.message);
    }
  }

  console.log(`\nTotal questions collected: ${totalQuestions}`);
  return allQuestions;
}

// Load existing sentence completion questions if they exist
function loadExistingQuestions() {
  const vocabQuestionsPath = path.join(__dirname, '../data/vocab_questions.json');

  if (fs.existsSync(vocabQuestionsPath)) {
    try {
      const content = fs.readFileSync(vocabQuestionsPath, 'utf8');
      const data = JSON.parse(content);

      // Extract sentence completion questions from the vocab_questions.json structure
      if (data.questions && Array.isArray(data.questions)) {
        const sentenceCompletions = [];

        data.questions.forEach(wordEntry => {
          if (wordEntry.questionSet && wordEntry.questionSet.sentenceCompletionQuestions) {
            wordEntry.questionSet.sentenceCompletionQuestions.forEach(scq => {
              sentenceCompletions.push({
                word: wordEntry.word,
                source: wordEntry.source || 'SSAT',
                id: scq.id,
                question: scq.question,
                options: scq.options,
                answer: scq.answer
              });
            });
          }
        });

        console.log(`Found ${sentenceCompletions.length} existing sentence completion questions from vocab_questions.json`);
        return sentenceCompletions;
      }
    } catch (error) {
      console.error('Error loading existing questions:', error.message);
    }
  }

  return [];
}

// Main function
function combineAllData() {
  console.log('Starting data combination process...\n');

  // Get all chapter data
  const chapterQuestions = getAllChapterData();

  // Get existing sentence completion questions
  const existingQuestions = loadExistingQuestions();

  // Combine all data
  const combined = {
    metadata: {
      totalQuestions: chapterQuestions.length + existingQuestions.length,
      chapterQuestions: chapterQuestions.length,
      existingSentenceCompletions: existingQuestions.length,
      chapters: '3-40',
      generatedAt: new Date().toISOString()
    },
    chapterQuestions: chapterQuestions,
    sentenceCompletionQuestions: existingQuestions
  };

  // Write to output file
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(combined, null, 2));
  console.log(`\nCombined data written to: ${OUTPUT_FILE}`);
  console.log(`Total questions: ${combined.metadata.totalQuestions}`);
  console.log(`  - Chapter questions (3-40): ${combined.metadata.chapterQuestions}`);
  console.log(`  - Existing sentence completions: ${combined.metadata.existingSentenceCompletions}`);

  return combined;
}

// Run the script
combineAllData();
