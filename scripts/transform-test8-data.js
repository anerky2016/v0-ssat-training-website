const fs = require('fs');
const path = require('path');

const INPUT_FILE = '/Users/diz/git/auto-web/data/test8-complete-master-2025-11-30T19-04-46-966Z.json';
const OUTPUT_FILE = path.join(__dirname, '../data/ssat-test8-questions.json');

/**
 * Transform SYNONYM question to quiz format
 *
 * From:
 * {
 *   questionNumber: 3,
 *   question: "GLORIOUS",
 *   questionType: "SYNONYM",
 *   options: [{letter: "A", text: "Arrogant"}, ...],
 *   correctAnswer: "C",
 *   solution: "..."
 * }
 *
 * To:
 * {
 *   id: "test8-syn-q3",
 *   question: "A synonym for GLORIOUS is ___.",
 *   questionType: "SYNONYM",
 *   options: ["Arrogant", "Dependable", "Wonderful", "Depressing"],
 *   answer: "Wonderful",
 *   explanation: "..."
 * }
 */
function transformSynonymQuestion(question, sectionName) {
  // Skip if no correct answer
  if (!question.correctAnswer || question.correctAnswer === null) {
    return null;
  }

  // Generate unique ID
  const id = `test8-syn-q${question.questionNumber}`;

  // Extract option texts
  const options = question.options.map(opt => opt.text);

  // Find the correct answer text
  const answerOption = question.options.find(
    opt => opt.letter === question.correctAnswer
  );

  if (!answerOption) {
    console.warn(`Warning: Could not find answer for synonym question ${id}`);
    return null;
  }

  // Format question as fill-in-blank
  const formattedQuestion = `A synonym for ${question.question} is ___.`;

  return {
    id,
    question: formattedQuestion,
    originalWord: question.question,
    questionType: "SYNONYM",
    testNumber: 8,
    sectionName,
    rangeText: question.rangeText,
    options,
    answer: answerOption.text,
    explanation: question.solution || '',
    questionNumber: question.questionNumber
  };
}

/**
 * Transform ANALOGY question to quiz format
 *
 * From:
 * {
 *   questionNumber: 1,
 *   question: "Lupine is to wolf as ursine is to ___.",
 *   questionType: "UNKNOWN",
 *   options: [{letter: "A", text: "calf"}, ...],
 *   correctAnswer: "B",
 *   solution: "..."
 * }
 *
 * To:
 * {
 *   id: "test8-ana-q1",
 *   question: "Lupine is to wolf as ursine is to ___.",
 *   questionType: "ANALOGY",
 *   options: ["calf", "bear", "cow", "bovine"],
 *   answer: "bear",
 *   explanation: "..."
 * }
 */
function transformAnalogyQuestion(question, sectionName) {
  // Skip if no correct answer
  if (!question.correctAnswer || question.correctAnswer === null) {
    return null;
  }

  // Generate unique ID
  const id = `test8-ana-q${question.questionNumber}`;

  // Extract option texts
  const options = question.options.map(opt => opt.text);

  // Find the correct answer text
  const answerOption = question.options.find(
    opt => opt.letter === question.correctAnswer
  );

  if (!answerOption) {
    console.warn(`Warning: Could not find answer for analogy question ${id}`);
    return null;
  }

  return {
    id,
    question: question.question,
    questionType: "ANALOGY",
    testNumber: 8,
    sectionName,
    rangeText: question.rangeText,
    options,
    answer: answerOption.text,
    explanation: question.solution || '',
    questionNumber: question.questionNumber
  };
}

function transformTest8Data() {
  console.log('=== Transforming Test 8 Data for SSAT Quizzes ===\n');

  // Read the source data
  const sourceData = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));

  console.log(`Source: ${INPUT_FILE}`);
  console.log(`Chapter: ${sourceData.chapter} - ${sourceData.chapterName}`);
  console.log(`Total Questions: ${sourceData.totalQuestions}`);
  console.log(`Crawl Date: ${sourceData.crawlDate}`);

  const transformedQuestions = [];
  let synonymCount = 0;
  let analogyCount = 0;
  let skippedCount = 0;

  // Process each section
  sourceData.sections.forEach(section => {
    console.log(`\nProcessing section: ${section.sectionName}`);
    console.log(`  Total questions: ${section.totalQuestions}`);

    if (section.sectionType === 'SYNONYMS') {
      section.questions.forEach(q => {
        const transformed = transformSynonymQuestion(q, section.sectionName);
        if (transformed) {
          transformedQuestions.push(transformed);
          synonymCount++;
        } else {
          skippedCount++;
        }
      });
    } else if (section.sectionType === 'ANALOGIES') {
      section.questions.forEach(q => {
        const transformed = transformAnalogyQuestion(q, section.sectionName);
        if (transformed) {
          transformedQuestions.push(transformed);
          analogyCount++;
        } else {
          skippedCount++;
        }
      });
    }
  });

  console.log('\n=== Transformation Results ===');
  console.log(`Synonym questions: ${synonymCount}`);
  console.log(`Analogy questions: ${analogyCount}`);
  console.log(`Total transformed: ${transformedQuestions.length}`);
  console.log(`Skipped (null answers): ${skippedCount}`);

  // Create output structure
  const output = {
    title: "SSAT Test 8 - Synonyms and Analogies",
    description: "Practice questions from SSAT Middle Level Test 8",
    testNumber: 8,
    testName: sourceData.chapterName,
    totalQuestions: transformedQuestions.length,
    metadata: {
      crawlDate: sourceData.crawlDate,
      transformedAt: new Date().toISOString(),
      sections: {
        synonyms: synonymCount,
        analogies: analogyCount
      },
      original: {
        totalQuestions: sourceData.totalQuestions,
        skipped: skippedCount
      }
    },
    questions: transformedQuestions
  };

  // Write to output file
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
  console.log(`\n✅ Transformed data written to: ${OUTPUT_FILE}`);

  // Validation
  console.log('\n=== Validation ===');

  // Check for duplicate IDs
  const ids = new Set();
  const duplicates = [];
  transformedQuestions.forEach(q => {
    if (ids.has(q.id)) {
      duplicates.push(q.id);
    }
    ids.add(q.id);
  });

  if (duplicates.length > 0) {
    console.log(`⚠️  Found ${duplicates.length} duplicate IDs`);
  } else {
    console.log('✅ No duplicate IDs found');
  }

  // Check for missing fields
  let missingFields = 0;
  transformedQuestions.forEach((q, i) => {
    if (!q.id || !q.question || !q.options || !q.answer || !q.questionType) {
      missingFields++;
    }
  });

  if (missingFields === 0) {
    console.log('✅ All questions have required fields');
  } else {
    console.log(`⚠️  ${missingFields} questions missing required fields`);
  }

  // Show samples
  console.log('\n=== Sample Transformed Questions ===');

  const synSample = transformedQuestions.find(q => q.questionType === 'SYNONYM');
  console.log('\nSynonym Sample:');
  console.log(JSON.stringify(synSample, null, 2));

  const anaSample = transformedQuestions.find(q => q.questionType === 'ANALOGY');
  console.log('\nAnalogy Sample:');
  console.log(JSON.stringify(anaSample, null, 2));

  // Summary by type
  console.log('\n=== Question Type Distribution ===');
  const byType = {};
  transformedQuestions.forEach(q => {
    byType[q.questionType] = (byType[q.questionType] || 0) + 1;
  });
  Object.keys(byType).forEach(type => {
    console.log(`${type}: ${byType[type]} questions`);
  });

  return output;
}

// Run the transformation
try {
  const result = transformTest8Data();
  console.log('\n✅ Transformation completed successfully!');
  console.log(`\nOutput: ${OUTPUT_FILE}`);
  console.log(`Total questions: ${result.totalQuestions}`);
  console.log(`  - Synonyms: ${result.metadata.sections.synonyms}`);
  console.log(`  - Analogies: ${result.metadata.sections.analogies}`);
} catch (error) {
  console.error('❌ Error during transformation:', error);
  process.exit(1);
}
