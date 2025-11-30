const fs = require('fs');
const path = require('path');

const combined = require('../data/combined-sentence-completion.json');
const transformed = require('../data/wordly-wise-questions.json');

console.log('=== Source Data Analysis ===\n');
console.log('Combined file chapterQuestions:', combined.chapterQuestions.length);
console.log('Combined file metadata says:', combined.metadata.chapterQuestions);

console.log('\n=== Chapter Breakdown (from source) ===');
const chapterCounts = {};
combined.chapterQuestions.forEach(q => {
  chapterCounts[q.chapter] = (chapterCounts[q.chapter] || 0) + 1;
});

let totalExpected = 0;
Object.keys(chapterCounts).sort((a,b) => Number(a) - Number(b)).forEach(ch => {
  console.log(`Chapter ${ch}: ${chapterCounts[ch]} questions`);
  totalExpected += chapterCounts[ch];
});

console.log(`\nTotal from source: ${totalExpected}`);

console.log('\n=== Transformation Results ===');
const wordlyWise = transformed.questions.filter(q => q.source === 'Wordly Wise 3000');
console.log('Transformed Wordly Wise questions:', wordlyWise.length);

console.log('\n=== Questions with null correctAnswer ===');
let nullCount = 0;
const nullByChapter = {};
combined.chapterQuestions.forEach(q => {
  if (!q.correctAnswer || q.correctAnswer === null) {
    nullCount++;
    nullByChapter[q.chapter] = (nullByChapter[q.chapter] || 0) + 1;
  }
});
console.log('Questions with null correctAnswer:', nullCount);
console.log('\nNull answers by chapter:');
Object.keys(nullByChapter).sort((a,b) => Number(a) - Number(b)).forEach(ch => {
  const nullInChapter = nullByChapter[ch];
  const totalInChapter = chapterCounts[ch];
  const validInChapter = totalInChapter - nullInChapter;
  console.log(`  Chapter ${ch}: ${nullInChapter} null (${validInChapter} valid out of ${totalInChapter} total)`);
});

console.log('\n=== Calculation ===');
console.log(`${totalExpected} (total source) - ${nullCount} (null answers) = ${totalExpected - nullCount} (expected output)`);
console.log(`Actual output: ${wordlyWise.length}`);
console.log(`Match: ${totalExpected - nullCount === wordlyWise.length ? '✓' : '✗'}`);

console.log('\n=== Summary ===');
console.log(`Starting with ${combined.metadata.chapterQuestions} questions from chapters 3-40`);
console.log(`Skipped ${nullCount} questions with missing answers`);
console.log(`Result: ${wordlyWise.length} usable Wordly Wise 3000 questions`);
