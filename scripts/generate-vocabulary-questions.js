const fs = require('fs');
const path = require('path');

// Helper function to shuffle array
function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// Helper function to get random items from array
function getRandomItems(array, count, exclude = []) {
  const filtered = array.filter(item => !exclude.includes(item));
  const shuffled = shuffleArray(filtered);
  return shuffled.slice(0, count);
}

// Helper function to capitalize first letter
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Generate synonym questions
function generateSynonymQuestions(word, wordData, allWords) {
  const questions = [];

  if (!wordData.synonyms || wordData.synonyms.length === 0) {
    return questions;
  }

  // Generate 2-3 synonym questions
  const numQuestions = Math.min(3, wordData.synonyms.length);

  for (let i = 0; i < numQuestions; i++) {
    const correctAnswer = wordData.synonyms[i];

    // Get distractors from other words' synonyms and antonyms
    const distractors = [];
    const usedWords = new Set([correctAnswer]);

    // Try to get words from other entries
    for (const otherWord of allWords) {
      if (otherWord.word === word) continue;

      // Add from synonyms
      if (otherWord.synonyms) {
        for (const syn of otherWord.synonyms) {
          if (!usedWords.has(syn) && distractors.length < 30) {
            distractors.push(syn);
            usedWords.add(syn);
          }
        }
      }

      // Add from antonyms (good distractors!)
      if (otherWord.antonyms && distractors.length < 30) {
        for (const ant of otherWord.antonyms) {
          if (!usedWords.has(ant) && distractors.length < 30) {
            distractors.push(ant);
            usedWords.add(ant);
          }
        }
      }

      if (distractors.length >= 30) break;
    }

    // Pick 3 random distractors
    const selectedDistractors = getRandomItems(distractors, 3, [correctAnswer]);

    // Create options and shuffle
    const options = shuffleArray([correctAnswer, ...selectedDistractors]);

    questions.push({
      question: `Which word is a synonym for "${word}"?`,
      options: options,
      correctAnswer: correctAnswer,
      explanation: `"${capitalize(word)}" and "${correctAnswer}" both have similar meanings.`
    });
  }

  return questions;
}

// Generate antonym questions
function generateAntonymQuestions(word, wordData, allWords) {
  const questions = [];

  if (!wordData.antonyms || wordData.antonyms.length === 0) {
    return questions;
  }

  // Generate 2-3 antonym questions
  const numQuestions = Math.min(3, wordData.antonyms.length);

  for (let i = 0; i < numQuestions; i++) {
    const correctAnswer = wordData.antonyms[i];

    // Get distractors - use synonyms as they're opposite of antonyms!
    const distractors = [...(wordData.synonyms || [])];

    // Add more distractors from other words
    for (const otherWord of allWords) {
      if (otherWord.word === word) continue;
      if (distractors.length >= 20) break;

      if (otherWord.antonyms) {
        distractors.push(...otherWord.antonyms.filter(a => a !== correctAnswer));
      }
    }

    // Pick 3 random distractors
    const selectedDistractors = getRandomItems(distractors, 3, [correctAnswer]);

    // Create options and shuffle
    const options = shuffleArray([correctAnswer, ...selectedDistractors]);

    questions.push({
      question: `Which word is an antonym for "${word}"?`,
      options: options,
      correctAnswer: correctAnswer,
      explanation: `"${capitalize(word)}" and "${correctAnswer}" have opposite meanings.`
    });
  }

  return questions;
}

// Generate analogy questions
function generateAnalogyQuestions(word, wordData, allWords) {
  const questions = [];

  // Different analogy patterns for variety
  const analogyTemplates = [
    // Pattern 1: Word relationship based on synonyms
    {
      generate: () => {
        if (!wordData.synonyms || wordData.synonyms.length === 0) return null;

        const synonym = wordData.synonyms[0];
        // Find another word pair with similar relationship
        const otherPairs = [];
        for (const otherWord of allWords) {
          if (otherWord.synonyms && otherWord.synonyms.length > 0 && otherWord.word !== word) {
            otherPairs.push({
              word: otherWord.word,
              synonym: otherWord.synonyms[0]
            });
          }
        }

        if (otherPairs.length === 0) return null;

        const correctPair = getRandomItems(otherPairs, 1)[0];
        const distractorWords = getRandomItems(
          allWords.map(w => w.word).filter(w => w !== word && w !== correctPair.word),
          3
        );

        const options = shuffleArray([correctPair.word, ...distractorWords]);

        return {
          question: `${word} : ${synonym} :: _______ : ${correctPair.synonym}`,
          options: options,
          correctAnswer: correctPair.word,
          explanation: `"${capitalize(word)}" relates to "${synonym}" the same way "${correctPair.word}" relates to "${correctPair.synonym}" - they are synonyms.`
        };
      }
    },

    // Pattern 2: Antonym relationship
    {
      generate: () => {
        if (!wordData.antonyms || wordData.antonyms.length === 0) return null;

        const antonym = wordData.antonyms[0];
        // Find another word pair with antonym relationship
        const otherPairs = [];
        for (const otherWord of allWords) {
          if (otherWord.antonyms && otherWord.antonyms.length > 0 && otherWord.word !== word) {
            otherPairs.push({
              word: otherWord.word,
              antonym: otherWord.antonyms[0]
            });
          }
        }

        if (otherPairs.length === 0) return null;

        const correctPair = getRandomItems(otherPairs, 1)[0];
        const distractorWords = getRandomItems(
          allWords.map(w => w.word).filter(w => w !== word && w !== correctPair.word),
          3
        );

        const options = shuffleArray([correctPair.word, ...distractorWords]);

        return {
          question: `${word} : ${antonym} :: _______ : ${correctPair.antonym}`,
          options: options,
          correctAnswer: correctPair.word,
          explanation: `"${capitalize(word)}" is the opposite of "${antonym}" the same way "${correctPair.word}" is the opposite of "${correctPair.antonym}".`
        };
      }
    },

    // Pattern 3: Degree or intensity
    {
      generate: () => {
        if (!wordData.synonyms || wordData.synonyms.length < 2) return null;

        const relatedWord = wordData.synonyms[0];

        // Find words that could show degree relationship
        const candidates = [];
        for (const otherWord of allWords) {
          if (otherWord.synonyms && otherWord.synonyms.length >= 2 && otherWord.word !== word) {
            candidates.push({
              word: otherWord.word,
              related: otherWord.synonyms[0]
            });
          }
        }

        if (candidates.length === 0) return null;

        const correctPair = getRandomItems(candidates, 1)[0];
        const distractorWords = getRandomItems(
          allWords.map(w => w.word).filter(w => w !== word && w !== correctPair.word),
          3
        );

        const options = shuffleArray([correctPair.word, ...distractorWords]);

        return {
          question: `${word} : ${relatedWord} :: _______ : ${correctPair.related}`,
          options: options,
          correctAnswer: correctPair.word,
          explanation: `These word pairs have similar relationships in meaning.`
        };
      }
    }
  ];

  // Try to generate 2-3 analogy questions using different templates
  for (let i = 0; i < 3 && questions.length < 3; i++) {
    const template = analogyTemplates[i % analogyTemplates.length];
    const question = template.generate();
    if (question) {
      questions.push(question);
    }
  }

  return questions;
}

// Main function
function generateQuestionsForAllWords() {
  console.log('Reading vocabulary data...');
  const dataPath = path.join(__dirname, '../data/vocabulary-words.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  console.log(`Found ${data.words.length} words`);
  console.log('Generating questions...');

  let totalQuestions = 0;

  // Generate questions for each word
  data.words.forEach((wordData, index) => {
    const word = wordData.word;

    // Generate all question types
    const synonymQuestions = generateSynonymQuestions(word, wordData, data.words);
    const antonymQuestions = generateAntonymQuestions(word, wordData, data.words);
    const analogyQuestions = generateAnalogyQuestions(word, wordData, data.words);

    // Add questions to word data
    wordData.questions = {
      synonyms: synonymQuestions,
      antonyms: antonymQuestions,
      analogies: analogyQuestions
    };

    const questionCount = synonymQuestions.length + antonymQuestions.length + analogyQuestions.length;
    totalQuestions += questionCount;

    if ((index + 1) % 50 === 0) {
      console.log(`Processed ${index + 1} words...`);
    }
  });

  console.log(`\nGenerated ${totalQuestions} total questions`);
  console.log('Writing updated data...');

  // Write back to file
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');

  console.log('Done! Questions have been added to vocabulary-words.json');

  // Print statistics
  console.log('\n--- Statistics ---');
  console.log(`Total words: ${data.words.length}`);
  console.log(`Total questions: ${totalQuestions}`);
  console.log(`Average questions per word: ${(totalQuestions / data.words.length).toFixed(2)}`);
}

// Run the script
try {
  generateQuestionsForAllWords();
} catch (error) {
  console.error('Error:', error);
  process.exit(1);
}
