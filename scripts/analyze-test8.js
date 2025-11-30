const fs = require('fs');
const path = require('path');

const data = require('/Users/diz/git/auto-web/data/test8-complete-master-2025-11-30T19-04-46-966Z.json');

console.log('=== Test 8 File Overview ===\n');
console.log('Chapter:', data.chapter);
console.log('Chapter Name:', data.chapterName);
console.log('Total Questions:', data.totalQuestions);
console.log('Total Sections:', data.totalSections);
console.log('Crawl Date:', data.crawlDate);

console.log('\n=== Sections ===');
data.sections.forEach(section => {
  console.log(`\n${section.sectionName}:`);
  console.log(`  Type: ${section.sectionType}`);
  console.log(`  Total Questions: ${section.totalQuestions}`);
  console.log(`  Ranges: ${section.ranges.length}`);

  // Check for null answers
  const nullAnswers = section.questions.filter(q => q.correctAnswer === null || !q.correctAnswer);
  const validAnswers = section.questions.filter(q => q.correctAnswer !== null && q.correctAnswer);

  console.log(`  Null answers: ${nullAnswers.length}`);
  console.log(`  Valid answers: ${validAnswers.length}`);

  if (validAnswers.length > 0) {
    console.log(`  First valid question number: ${validAnswers[0].questionNumber}`);
  }
});

console.log('\n=== Sample Questions ===');

// Sample SYNONYM question
const syn = data.sections.find(s => s.sectionType === 'SYNONYMS');
console.log('\nSYNONYM Question #3:');
console.log(JSON.stringify(syn.questions[2], null, 2));

// Sample ANALOGY question
const ana = data.sections.find(s => s.sectionType === 'ANALOGIES');
if (ana) {
  console.log('\nANALOGY Question #1:');
  console.log(JSON.stringify(ana.questions[0], null, 2));

  console.log('\nANALOGY Question #10:');
  console.log(JSON.stringify(ana.questions[9], null, 2));
}

console.log('\n=== Data Quality Summary ===');
let totalNull = 0;
let totalValid = 0;
data.sections.forEach(section => {
  const nullCount = section.questions.filter(q => q.correctAnswer === null || !q.correctAnswer).length;
  const validCount = section.questions.filter(q => q.correctAnswer !== null && q.correctAnswer).length;
  totalNull += nullCount;
  totalValid += validCount;
});

console.log(`Total questions: ${data.totalQuestions}`);
console.log(`Questions with null answers: ${totalNull} (${((totalNull / data.totalQuestions) * 100).toFixed(1)}%)`);
console.log(`Questions with valid answers: ${totalValid} (${((totalValid / data.totalQuestions) * 100).toFixed(1)}%)`);
