const fs = require('fs');
const path = require('path');

// Read the Level 3 vocabulary JSON file
const dataPath = path.join(__dirname, '../data/wordly-wise-level-3.json');
const vocabularyData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

console.log(`📚 Found ${vocabularyData.words.length} words to generate kid-friendly examples for\n`);

// Kid-friendly contexts for generating examples
const kidContexts = {
  school: ['at school', 'in class', 'during recess', 'in the library', 'at the playground'],
  home: ['at home', 'in my room', 'in the kitchen', 'in the backyard', 'with my family'],
  friends: ['with my friends', 'at the park', 'playing together', 'at a party', 'on the playground'],
  toys: ['with my toys', 'playing with blocks', 'with my dolls', 'with my cars', 'with my ball'],
  pets: ['with my dog', 'with my cat', 'with my pet', 'feeding my pet', 'playing with my pet'],
  food: ['eating lunch', 'at dinner', 'having a snack', 'eating breakfast', 'at the table'],
  activities: ['playing games', 'reading a book', 'drawing pictures', 'singing songs', 'dancing'],
  family: ['with my mom', 'with my dad', 'with my sister', 'with my brother', 'with my family']
};

// Simple sentence templates for different parts of speech
function generateKidFriendlyExamples(word, meaning, partOfSpeech) {
  const examples = [];
  const wordLower = word.toLowerCase();
  const wordCapitalized = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  
  // Skip inappropriate words for children (we'll handle these with custom examples)
  const inappropriateWords = ['arouse', 'sex', 'riot'];
  if (inappropriateWords.includes(wordLower)) {
    return []; // Return empty, will need manual examples
  }
  
  // Generate examples based on part of speech
  if (partOfSpeech.toLowerCase().includes('verb')) {
    // Verb examples - simple action sentences with proper grammar
    const verbTemplates = [
      `I like to ${wordLower} ${kidContexts.activities[Math.floor(Math.random() * kidContexts.activities.length)]}.`,
      `My friend and I ${wordLower} ${kidContexts.friends[Math.floor(Math.random() * kidContexts.friends.length)]}.`,
      `We ${wordLower} ${kidContexts.school[Math.floor(Math.random() * kidContexts.school.length)]}.`,
      `I ${wordLower} ${kidContexts.home[Math.floor(Math.random() * kidContexts.home.length)]}.`,
      `Let's ${wordLower} together!`,
      `I can ${wordLower} very well.`,
      `My teacher showed us how to ${wordLower}.`,
      `I ${wordLower} ${kidContexts.family[Math.floor(Math.random() * kidContexts.family.length)]}.`,
      `I want to ${wordLower} more.`,
      `It's fun to ${wordLower} with friends.`
    ];
    
    // Select 3-5 unique examples
    const selected = new Set();
    while (selected.size < Math.min(5, verbTemplates.length)) {
      const idx = Math.floor(Math.random() * verbTemplates.length);
      selected.add(verbTemplates[idx]);
    }
    examples.push(...Array.from(selected));
    
  } else if (partOfSpeech.toLowerCase().includes('noun')) {
    // Noun examples - simple descriptive sentences with proper articles
    const nounTemplates = [
      `I have a ${wordLower} ${kidContexts.home[Math.floor(Math.random() * kidContexts.home.length)]}.`,
      `My ${wordLower} is very nice.`,
      `I like my ${wordLower} a lot.`,
      `I saw a ${wordLower} ${kidContexts.friends[Math.floor(Math.random() * kidContexts.friends.length)]}.`,
      `My friend has a ${wordLower} too.`,
      `The ${wordLower} makes me happy.`,
      `I play with the ${wordLower} ${kidContexts.toys[Math.floor(Math.random() * kidContexts.toys.length)]}.`,
      `The ${wordLower} is my favorite.`,
      `I take care of my ${wordLower}.`
    ];
    
    const selected = new Set();
    while (selected.size < Math.min(5, nounTemplates.length)) {
      const idx = Math.floor(Math.random() * nounTemplates.length);
      selected.add(nounTemplates[idx]);
    }
    examples.push(...Array.from(selected));
    
  } else if (partOfSpeech.toLowerCase().includes('adjective')) {
    // Adjective examples - simple descriptive sentences
    const adjTemplates = [
      `My friend is very ${wordLower}.`,
      `I feel ${wordLower} today.`,
      `That was a ${wordLower} day!`,
      `I like ${wordLower} things.`,
      `The game is ${wordLower}.`,
      `My toy is ${wordLower}.`,
      `The book is ${wordLower}.`,
      `I am ${wordLower} when I play.`
    ];
    
    const selected = new Set();
    while (selected.size < Math.min(5, adjTemplates.length)) {
      const idx = Math.floor(Math.random() * adjTemplates.length);
      selected.add(adjTemplates[idx]);
    }
    examples.push(...Array.from(selected));
    
  } else {
    // Generic examples for other parts of speech
    const genericTemplates = [
      `I learned about ${wordLower} ${kidContexts.school[Math.floor(Math.random() * kidContexts.school.length)]}.`,
      `My teacher told us about ${wordLower}.`,
      `I know what ${wordLower} means.`,
      `The word ${wordLower} is interesting.`,
      `I use ${wordLower} in my sentences.`
    ];
    
    const selected = new Set();
    while (selected.size < Math.min(5, genericTemplates.length)) {
      const idx = Math.floor(Math.random() * genericTemplates.length);
      selected.add(genericTemplates[idx]);
    }
    examples.push(...Array.from(selected));
  }
  
  // Clean up and ensure examples are appropriate
  return examples
    .map(ex => ex.trim())
    .filter(ex => {
      // Filter out grammatically incorrect or inappropriate examples
      const lower = ex.toLowerCase();
      return ex.length > 10 && 
             ex.length < 100 &&
             !lower.includes(' a a ') && // No double articles
             !lower.includes(' a an ') &&
             !lower.includes(' an a ') &&
             !lower.match(/^i have a attitude/i) && // Fix common grammar errors
             !lower.match(/^i have a auction/i);
    })
    .slice(0, 5);
}

// Custom examples for common words that need better context
const customExamples = {
  'act': [
    'I like to act in school plays.',
    'We act out stories in class.',
    'My friend can act like a cat.',
    'Let\'s act out a story together!'
  ],
  'additional': [
    'I want one additional cookie please.',
    'My teacher gave me additional homework.',
    'I need additional crayons for my drawing.',
    'Can I have additional time to play?'
  ],
  'adopt': [
    'My family wants to adopt a puppy.',
    'We can adopt a pet from the shelter.',
    'I hope we can adopt a cat.',
    'Adopting a pet is a big responsibility.'
  ],
  'advice': [
    'My mom gave me good advice.',
    'I asked my teacher for advice.',
    'My friend gave me advice about school.',
    'Good advice helps me learn.'
  ],
  'amaze': [
    'The magic trick will amaze you!',
    'The fireworks amaze me every time.',
    'My friend can amaze everyone with tricks.',
    'The show will amaze all the kids.'
  ],
  'ambition': [
    'My ambition is to be a teacher.',
    'I have a big ambition to help others.',
    'My friend has an ambition to be a doctor.',
    'Having an ambition is important.'
  ],
  'arctic': [
    'Polar bears live in the arctic.',
    'The arctic is very cold.',
    'We learned about arctic animals in school.',
    'The arctic has lots of ice and snow.'
  ],
  'arouse': [
    'The loud noise will arouse the sleeping dog.',
    'The bell will arouse everyone from their nap.',
    'The alarm clock will arouse me in the morning.'
  ],
  'arrange': [
    'I will arrange my toys on the shelf.',
    'My mom helps me arrange my books.',
    'We arrange the chairs in a circle.',
    'I like to arrange my crayons by color.'
  ],
  'attitude': [
    'I have a good attitude at school.',
    'My teacher likes my positive attitude.',
    'A happy attitude makes everything better.',
    'I try to have a good attitude every day.'
  ],
  'attract': [
    'The bright colors attract butterflies.',
    'The magnet will attract metal objects.',
    'The flowers attract bees to the garden.',
    'I attract friends with my kindness.'
  ],
  'auction': [
    'We had an auction at the school fair.',
    'People bid on items at the auction.',
    'The auction raised money for our school.',
    'I watched the auction with my family.'
  ]
};

// Main enrichment function
async function enrichWords() {
  let processed = 0;
  let updated = 0;
  const errors = [];
  
  for (let i = 0; i < vocabularyData.words.length; i++) {
    const word = vocabularyData.words[i];
    const wordText = word.word.toLowerCase();
    
    console.log(`🔍 [${i + 1}/${vocabularyData.words.length}] Processing "${word.word}"...`);
    
    try {
      // Check if we have custom examples for this word
      let examples = customExamples[wordText];
      
      if (!examples) {
        // Generate examples using templates
        const meaning = word.meanings && word.meanings.length > 0 
          ? word.meanings[0] 
          : 'No definition available';
        const partOfSpeech = word.part_of_speech || 'Unknown';
        
        examples = generateKidFriendlyExamples(word.word, meaning, partOfSpeech);
      }
      
      if (examples.length > 0) {
        word.examples = examples;
        updated++;
        console.log(`  ✅ Generated ${examples.length} kid-friendly examples:`);
        examples.forEach((ex, idx) => {
          console.log(`     ${idx + 1}. ${ex}`);
        });
      } else {
        console.log(`  ⚠️  No examples generated`);
      }
      
    } catch (error) {
      errors.push({ word: word.word, error: error.message });
      console.log(`  ❌ Error: ${error.message}`);
    }
    
    processed++;
    
    // Save progress every 10 words
    if (processed % 10 === 0) {
      fs.writeFileSync(dataPath, JSON.stringify(vocabularyData, null, 2));
      console.log(`\n💾 Progress saved (${processed}/${vocabularyData.words.length} words processed)\n`);
    }
  }
  
  // Final save
  fs.writeFileSync(dataPath, JSON.stringify(vocabularyData, null, 2));
  
  console.log(`\n✅ Completed!`);
  console.log(`   Processed: ${processed} words`);
  console.log(`   Updated: ${updated} words`);
  console.log(`   Errors: ${errors.length} words`);
  if (errors.length > 0) {
    console.log(`\n❌ Errors:`);
    errors.forEach(e => console.log(`   - ${e.word}: ${e.error}`));
  }
  console.log(`\n📁 Saved to: ${dataPath}`);
}

// Run the enrichment
enrichWords().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

