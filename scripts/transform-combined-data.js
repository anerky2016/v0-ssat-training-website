const fs = require('fs');
const path = require('path');

const INPUT_FILE = path.join(__dirname, '../data/combined-sentence-completion.json');
const OUTPUT_FILE = path.join(__dirname, '../data/wordly-wise-questions.json');

/**
 * Transform combined data format to quiz-compatible format
 *
 * From:
 * {
 *   questionNumber: 1,
 *   options: [{letter: "A", text: "agent"}, ...],
 *   correctAnswer: "B",
 *   solution: "...",
 *   chapter: 3,
 *   source: "Wordly Wise 3000"
 * }
 *
 * To:
 * {
 *   id: "chapter3-q1",
 *   question: "...",
 *   options: ["agent", "banker", "analyst", "chief"],
 *   answer: "banker",
 *   explanation: "...",
 *   chapter: 3,
 *   source: "Wordly Wise 3000"
 * }
 */
function transformQuestion(question, chapter) {
  // 1. Generate unique ID from chapter and question number
  const id = `chapter${chapter}-q${question.questionNumber}`;

  // 2. Extract option text from option objects
  const options = question.options.map(opt => opt.text);

  // 3. Map letter answer to actual word
  // Handle null or missing correctAnswer
  if (!question.correctAnswer) {
    console.warn(`Warning: Question ${id} has no correctAnswer, skipping`);
    return null;
  }

  const answerOption = question.options.find(
    opt => opt.letter === question.correctAnswer
  );

  if (!answerOption) {
    console.error(`Error: Could not find answer for question ${id}`, {
      correctAnswer: question.correctAnswer,
      options: question.options
    });
    return null;
  }

  const answer = answerOption.text;

  // 4. Map solution to explanation
  const explanation = question.solution || '';

  return {
    id,
    question: question.question,
    options,
    answer,
    explanation,
    // Preserve metadata
    chapter: chapter,
    source: question.source || 'Wordly Wise 3000',
    questionNumber: question.questionNumber
  };
}

/**
 * Transform sentence completion questions from vocab_questions.json format
 * These already have the correct structure, just need unique IDs
 */
function transformSentenceCompletionQuestion(question, index) {
  // Generate a unique ID using word and original id to avoid duplicates
  let id;
  if (question.word && question.id) {
    id = `ssat-${question.word}-${question.id}`;
  } else if (question.word) {
    id = `ssat-${question.word}-q${index + 1}`;
  } else if (question.id) {
    id = `ssat-${question.id}-${index + 1}`;
  } else {
    id = `ssat-q${index + 1}`;
  }

  return {
    id,
    question: question.question,
    options: question.options,
    answer: question.answer,
    explanation: question.explanation || '',
    source: question.source || 'SSAT',
    word: question.word
  };
}

function transformData() {
  console.log('Starting data transformation...\n');

  // Read the combined data
  const combinedData = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));

  console.log(`Loaded combined data:`);
  console.log(`  - Chapter questions: ${combinedData.chapterQuestions.length}`);
  console.log(`  - Sentence completion questions: ${combinedData.sentenceCompletionQuestions.length}`);
  console.log();

  // Transform chapter questions
  const transformedChapterQuestions = [];
  let errorCount = 0;

  combinedData.chapterQuestions.forEach((question) => {
    const transformed = transformQuestion(question, question.chapter);
    if (transformed) {
      transformedChapterQuestions.push(transformed);
    } else {
      errorCount++;
    }
  });

  console.log(`Transformed chapter questions: ${transformedChapterQuestions.length}`);
  if (errorCount > 0) {
    console.log(`  - Errors: ${errorCount}`);
  }

  // Transform sentence completion questions
  const transformedSentenceCompletions = combinedData.sentenceCompletionQuestions.map(
    (q, i) => transformSentenceCompletionQuestion(q, i)
  );

  console.log(`Transformed sentence completion questions: ${transformedSentenceCompletions.length}`);

  // Combine all questions
  const allQuestions = [
    ...transformedChapterQuestions,
    ...transformedSentenceCompletions
  ];

  console.log(`\nTotal questions: ${allQuestions.length}`);

  // Create output structure matching the current quiz data format
  const output = {
    title: "Wordly Wise 3000 Vocabulary Questions",
    description: "Fill-in-the-blank vocabulary questions from Wordly Wise 3000 (Chapters 3-40) and SSAT vocabulary",
    totalQuestions: allQuestions.length,
    questions: allQuestions,
    metadata: {
      chapters: "3-40",
      sources: ["Wordly Wise 3000", "SSAT"],
      generatedAt: new Date().toISOString(),
      originalData: {
        chapterQuestions: combinedData.chapterQuestions.length,
        sentenceCompletionQuestions: combinedData.sentenceCompletionQuestions.length
      }
    }
  };

  // Write to output file
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
  console.log(`\nTransformed data written to: ${OUTPUT_FILE}`);

  // Validation
  console.log('\n=== Validation ===');

  // Check for duplicate IDs
  const ids = new Set();
  const duplicates = [];
  allQuestions.forEach(q => {
    if (ids.has(q.id)) {
      duplicates.push(q.id);
    }
    ids.add(q.id);
  });

  if (duplicates.length > 0) {
    console.log(`⚠️  Found ${duplicates.length} duplicate IDs:`, duplicates.slice(0, 5));
  } else {
    console.log('✅ No duplicate IDs found');
  }

  // Check for missing fields
  let missingFields = 0;
  allQuestions.forEach((q, i) => {
    if (!q.id || !q.question || !q.options || !q.answer) {
      console.log(`⚠️  Question ${i + 1} missing required fields:`, {
        hasId: !!q.id,
        hasQuestion: !!q.question,
        hasOptions: !!q.options,
        hasAnswer: !!q.answer
      });
      missingFields++;
    }
  });

  if (missingFields === 0) {
    console.log('✅ All questions have required fields');
  } else {
    console.log(`⚠️  ${missingFields} questions missing required fields`);
  }

  // Sample validation - show first transformed question
  console.log('\n=== Sample Transformed Question ===');
  console.log(JSON.stringify(allQuestions[0], null, 2));

  // Chapter distribution
  console.log('\n=== Chapter Distribution ===');
  const chapterCounts = {};
  allQuestions.forEach(q => {
    if (q.chapter) {
      chapterCounts[q.chapter] = (chapterCounts[q.chapter] || 0) + 1;
    }
  });

  const sortedChapters = Object.keys(chapterCounts)
    .map(Number)
    .sort((a, b) => a - b);

  console.log(`Chapters ${sortedChapters[0]} - ${sortedChapters[sortedChapters.length - 1]}`);
  console.log(`Questions with chapter info: ${Object.values(chapterCounts).reduce((a, b) => a + b, 0)}`);
  console.log(`Questions without chapter: ${allQuestions.length - Object.values(chapterCounts).reduce((a, b) => a + b, 0)}`);

  return output;
}

// Run the transformation
try {
  const result = transformData();
  console.log('\n✅ Transformation completed successfully!');
  console.log(`\nOutput file: ${OUTPUT_FILE}`);
  console.log(`Total questions: ${result.totalQuestions}`);
} catch (error) {
  console.error('❌ Error during transformation:', error);
  process.exit(1);
}
