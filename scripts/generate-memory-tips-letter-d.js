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

// Filter words starting with 'D' that don't have tips
const dWords = vocabularyData.words.filter(w => 
  w.word.toLowerCase().startsWith('d') && !w.tip
);

console.log(`📚 Found ${dWords.length} words starting with 'D' that need memory tips\n`);

// Function to generate memory tip using OpenAI
async function generateMemoryTip(word, meaning, partOfSpeech, examples) {
  try {
    const prompt = `Create a fun, memorable memory tip for the word "${word}" (${partOfSpeech}) for 10-12 year old children.

Meaning: ${meaning}
Examples: ${examples.slice(0, 2).join('; ')}

Requirements:
- Create a memory tip that uses wordplay, sound-alikes, visual imagery, or word breakdowns
- Make it fun and engaging for 10-12 year olds
- Keep it short (1-2 sentences maximum)
- Use simple language that kids can understand
- Make it memorable and easy to recall
- Can use techniques like:
  * Sound-alike mnemonics (e.g., "Think 'SEED' - when you plant a seed...")
  * Word breakdowns (e.g., "Break it down: CO + LUDE...")
  * Visual imagery (e.g., "Imagine someone chasing you...")
  * Associations with familiar words or concepts

Return ONLY the memory tip text, no explanations or extra formatting.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a creative teacher who creates fun, memorable memory tips for children learning vocabulary. You specialize in creating engaging mnemonics for 10-12 year old students.'
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

    console.log(`🔍 [${i + 1}/${dWords.length}] Processing "${word.word}"...`);

    try {
      const meaning = word.meanings && word.meanings.length > 0 
        ? word.meanings[0] 
        : 'No definition available';
      
      const partOfSpeech = word.part_of_speech || 'Unknown';
      const examples = word.examples || [];

      const tip = await generateMemoryTip(
        word.word,
        meaning,
        partOfSpeech,
        examples
      );

      if (tip && tip.length > 10) {
        vocabularyData.words[wordIndex].tip = tip;
        updated++;
        console.log(`  ✅ Generated memory tip:`);
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

