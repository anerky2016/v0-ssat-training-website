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

// Initialize OpenAI
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY environment variable is not set');
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Load vocabulary data
const dataPath = path.join(__dirname, '../data/vocabulary-words.json');
const vocabularyData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Filter words starting with 'D'
const dWords = vocabularyData.words.filter(w => w.word.toLowerCase().startsWith('d'));

console.log(`📚 Found ${dWords.length} words starting with 'D' to regenerate memory tips\n`);

// Function to generate memory tip based on meaning using OpenAI
async function generateMemoryTipFromMeaning(word, meanings, partOfSpeech, examples, synonyms) {
  try {
    const allMeanings = Array.isArray(meanings) ? meanings.join('; ') : meanings;
    const exampleText = examples && examples.length > 0 ? examples.slice(0, 2).join('; ') : 'No examples available';
    const synonymText = synonyms && synonyms.length > 0 ? synonyms.slice(0, 3).join(', ') : 'No synonyms available';

    const prompt = `Create a fun, memorable memory tip for the word "${word}" (${partOfSpeech}) for 10-12 year old children.

MEANING (this is the most important part - base the tip on this):
${allMeanings}

Examples: ${exampleText}
Synonyms: ${synonymText}

Requirements:
- The memory tip MUST be based on the MEANING of the word, not just the word itself
- Create a memory tip that helps children remember what the word MEANS
- Use wordplay, sound-alikes, visual imagery, or word breakdowns that connect to the meaning
- Make it fun and engaging for 10-12 year olds
- Keep it short (1-2 sentences maximum)
- Use simple language that kids can understand
- Make it memorable and easy to recall
- The tip should help them understand and remember the definition, not just the spelling

Techniques you can use:
  * Connect the meaning to familiar concepts (e.g., "Think of 'decorum' as the rules of a fancy party - everyone behaves politely")
  * Use visual imagery that represents the meaning (e.g., "Imagine a shield deflecting arrows - that's what 'deflect' means, to turn something away")
  * Create associations with the meaning (e.g., "When you're 'delirious', your brain is like a spinning top - everything feels wild and confusing")
  * Use word breakdowns that relate to meaning (e.g., "DE-MOTE means to move DOWN - like going down stairs to a lower level")

Return ONLY the memory tip text, no explanations or extra formatting.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a creative teacher who creates fun, memorable memory tips for children learning vocabulary. You specialize in creating engaging mnemonics for 10-12 year old students. Your tips always focus on helping children remember the MEANING of words.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 150,
    });

    const content = response.choices[0]?.message?.content || '';
    
    // Clean up the tip
    let tip = content.trim();
    
    // Remove quotes if present
    tip = tip.replace(/^["']|["']$/g, '');
    
    // Remove numbering or bullets
    tip = tip.replace(/^[\d\-•\*\.\)]\s*/, '').trim();
    
    // Ensure it's not too long (max 200 characters)
    if (tip.length > 200) {
      tip = tip.substring(0, 200).trim() + '...';
    }
    
    return tip;
  } catch (error) {
    console.error(`  ❌ Error generating memory tip: ${error.message}`);
    return null;
  }
}

// Process all D words
async function processWords() {
  let processed = 0;
  let updated = 0;
  let skipped = 0;
  const errors = [];

  for (let i = 0; i < dWords.length; i++) {
    const word = dWords[i];
    const wordIndex = vocabularyData.words.findIndex(w => w.word === word.word);

    if (wordIndex === -1) {
      console.log(`⚠️  [${i + 1}/${dWords.length}] Word "${word.word}" not found in vocabulary data`);
      skipped++;
      continue;
    }

    console.log(`🔍 [${i + 1}/${dWords.length}] Regenerating memory tip for "${word.word}"...`);
    console.log(`   Meaning: ${word.meanings && word.meanings[0] ? word.meanings[0].substring(0, 80) + '...' : 'No meaning'}`);

    try {
      const meanings = word.meanings || [];
      const partOfSpeech = word.part_of_speech || 'Unknown';
      const examples = word.examples || [];
      const synonyms = word.synonyms || [];

      if (meanings.length === 0) {
        console.log(`  ⚠️  Skipping - no meaning available`);
        skipped++;
        processed++;
        continue;
      }

      const tip = await generateMemoryTipFromMeaning(
        word.word,
        meanings,
        partOfSpeech,
        examples,
        synonyms
      );

      if (tip && tip.length > 10) {
        vocabularyData.words[wordIndex].tip = tip;
        updated++;
        console.log(`  ✅ Generated new memory tip (based on meaning):`);
        console.log(`     ${tip}`);
      } else {
        skipped++;
        console.log(`  ⚠️  Could not generate memory tip`);
      }

    } catch (error) {
      errors.push({ word: word.word, error: error.message });
      console.log(`  ❌ Error: ${error.message}`);
    }

    processed++;

    // Save progress every 5 words
    if (processed % 5 === 0) {
      fs.writeFileSync(dataPath, JSON.stringify(vocabularyData, null, 2));
      console.log(`\n💾 Progress saved (${processed}/${dWords.length} words processed)\n`);
    }

    // Rate limiting - wait 1 second between requests
    if (i < dWords.length - 1) {
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

// Run the script
processWords().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

