const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

// Load environment variables from .env.local
try {
  const envPath = path.join(__dirname, '../.env.local');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
      const match = line.match(/^([^=:#]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, '');
        if (key && value && !process.env[key]) {
          process.env[key] = value;
        }
      }
    });
  }
} catch (error) {
  console.warn('⚠️  Could not load .env.local, using system environment variables');
}

// Read the Level 5 vocabulary JSON file
const dataPath = path.join(__dirname, '../data/wordly-wise-level-5.json');
const vocabularyData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

console.log(`📚 Found ${vocabularyData.words.length} words to generate kid-friendly examples for (ages 8-9)\n`);

// Initialize OpenAI
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY environment variable is not set');
  console.error('   Please add OPENAI_API_KEY to .env.local or export it as an environment variable');
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function to generate kid-friendly examples using OpenAI
async function generateKidFriendlyExamples(word, meaning, partOfSpeech) {
  try {
    const prompt = `Generate 3-5 simple example sentences for the word "${word}" (${partOfSpeech}).

Meaning: ${meaning}

Requirements:
- Sentences must be appropriate for 8-9 year old children (more advanced than 7-8 year olds)
- Use vocabulary that a third or fourth grader would understand
- Keep sentences medium length (15-30 words maximum)
- Use contexts children can relate to: school, home, friends, hobbies, sports, nature, science, history, books, games, etc.
- Make the examples clear and educational
- Each sentence should naturally use the word "${word}"
- Can include more complex ideas and slightly longer sentences than for younger children
- Return ONLY the sentences, one per line, no numbering or bullets

Example format:
The cat likes to play with the ball in the backyard after school.
My friend shared her toy with me at recess, and we had fun together.
We had a great time at the park today with our families and friends.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Using mini for cost efficiency
      messages: [
        {
          role: 'system',
          content: 'You are a helpful teacher who creates age-appropriate examples for children learning vocabulary. You specialize in creating examples for 8-9 year old children.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    const content = response.choices[0]?.message?.content || '';
    
    // Parse the examples (split by newlines and clean up)
    const examples = content
      .split('\n')
      .map(line => line.trim())
      .filter(line => {
        // Remove numbering, bullets, and empty lines
        const cleaned = line.replace(/^[\d\-•\*\.\)]\s*/, '').trim();
        return cleaned.length > 15 && cleaned.length < 250;
      })
      .map(line => line.replace(/^[\d\-•\*\.\)]\s*/, '').trim())
      .filter(line => line.length > 0)
      .slice(0, 5); // Limit to 5 examples
    
    return examples;
  } catch (error) {
    console.error(`  ❌ Error generating examples: ${error.message}`);
    return [];
  }
}

// Main enrichment function
async function enrichWords() {
  let processed = 0;
  let updated = 0;
  let skipped = 0;
  const errors = [];
  
  for (let i = 0; i < vocabularyData.words.length; i++) {
    const word = vocabularyData.words[i];
    const wordText = word.word.toLowerCase();
    
    // Check if word already has kid-friendly examples
    // We'll replace existing examples with kid-friendly ones
    const hasExamples = word.examples && word.examples.length > 0;
    
    if (hasExamples) {
      console.log(`🔄 [${i + 1}/${vocabularyData.words.length}] Replacing examples for "${word.word}"...`);
    } else {
      console.log(`🔍 [${i + 1}/${vocabularyData.words.length}] Generating examples for "${word.word}"...`);
    }
    
    try {
      // Get the first meaning for context
      const meaning = word.meanings && word.meanings.length > 0 
        ? word.meanings[0] 
        : 'No definition available';
      
      const partOfSpeech = word.part_of_speech || 'Unknown';
      
      // Generate kid-friendly examples
      const examples = await generateKidFriendlyExamples(
        word.word,
        meaning,
        partOfSpeech
      );
      
      if (examples.length > 0) {
        word.examples = examples;
        updated++;
        console.log(`  ✅ Generated ${examples.length} kid-friendly examples:`);
        examples.forEach((ex, idx) => {
          console.log(`     ${idx + 1}. ${ex}`);
        });
      } else {
        skipped++;
        console.log(`  ⚠️  No examples generated`);
      }
      
    } catch (error) {
      errors.push({ word: word.word, error: error.message });
      console.log(`  ❌ Error: ${error.message}`);
    }
    
    processed++;
    
    // Save progress every 5 words
    if (processed % 5 === 0) {
      fs.writeFileSync(dataPath, JSON.stringify(vocabularyData, null, 2));
      console.log(`\n💾 Progress saved (${processed}/${vocabularyData.words.length} words processed)\n`);
    }
    
    // Rate limiting - wait 1 second between requests to avoid rate limits
    if (i < vocabularyData.words.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // Final save
  fs.writeFileSync(dataPath, JSON.stringify(vocabularyData, null, 2));
  
  console.log(`\n✅ Completed!`);
  console.log(`   Processed: ${processed} words`);
  console.log(`   Updated: ${updated} words`);
  console.log(`   Skipped: ${skipped} words`);
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

