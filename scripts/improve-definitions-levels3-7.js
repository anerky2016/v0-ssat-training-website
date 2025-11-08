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

// Level configuration
const levels = [
  { level: 3, ageRange: '6-7', file: 'wordly-wise-level-3.json' },
  { level: 4, ageRange: '7-8', file: 'wordly-wise-level-4.json' },
  { level: 5, ageRange: '8-9', file: 'wordly-wise-level-5.json' },
  { level: 6, ageRange: '10-11', file: 'wordly-wise-level-6.json' },
  { level: 7, ageRange: '11-12', file: 'wordly-wise-level-7.json' },
];

// Function to generate improved definition using OpenAI
async function generateImprovedDefinition(word, currentMeaning, partOfSpeech, ageRange) {
  try {
    const prompt = `Improve the definition for the word "${word}" (${partOfSpeech}).

Current definition: ${currentMeaning}
Age range: ${ageRange} years old

Requirements:
- Create a clear, age-appropriate definition that ${ageRange} year old children can understand
- Use simple vocabulary appropriate for this age group
- Make it concise but complete (1-2 sentences maximum)
- Explain what the word means in a way that children can relate to
- If the word has multiple meanings, focus on the most common one for children
- Return ONLY the improved definition text, no explanations or extra formatting

Example for ages 6-7: "To do something or behave in a certain way."
Example for ages 11-12: "To decrease in force or intensity; to become less strong or severe."`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a helpful teacher who creates age-appropriate definitions for children learning vocabulary. You specialize in creating definitions for ${ageRange} year old children.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    const content = response.choices[0]?.message?.content || '';
    
    // Clean up the definition
    let definition = content.trim();
    
    // Remove quotes if present
    definition = definition.replace(/^["']|["']$/g, '');
    
    // Remove numbering or bullets
    definition = definition.replace(/^[\d\-•\*\.\)]\s*/, '').trim();
    
    // Ensure it's not too long (max 200 characters for younger kids, 300 for older)
    const maxLength = parseInt(ageRange.split('-')[0]) < 10 ? 200 : 300;
    if (definition.length > maxLength) {
      definition = definition.substring(0, maxLength).trim() + '...';
    }
    
    return definition;
  } catch (error) {
    console.error(`  ❌ Error generating definition: ${error.message}`);
    return null;
  }
}

// Process a single level
async function processLevel(levelConfig) {
  const dataPath = path.join(__dirname, '../data', levelConfig.file);
  const vocabularyData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  console.log(`\n${'='.repeat(60)}`);
  console.log(`📚 Processing Level ${levelConfig.level} (ages ${levelConfig.ageRange})`);
  console.log(`   Total words: ${vocabularyData.words.length}`);
  console.log(`${'='.repeat(60)}\n`);

  let processed = 0;
  let updated = 0;
  let skipped = 0;
  const errors = [];

  for (let i = 0; i < vocabularyData.words.length; i++) {
    const word = vocabularyData.words[i];
    const wordText = word.word.toLowerCase();

    // Get current definition
    const currentMeaning = word.meanings && word.meanings.length > 0 
      ? word.meanings[0] 
      : '';

    if (!currentMeaning) {
      console.log(`⚠️  [${i + 1}/${vocabularyData.words.length}] Skipping "${word.word}" (no current definition)`);
      skipped++;
      processed++;
      continue;
    }

    console.log(`🔍 [${i + 1}/${vocabularyData.words.length}] Improving definition for "${word.word}"...`);
    console.log(`   Current: ${currentMeaning.substring(0, 80)}${currentMeaning.length > 80 ? '...' : ''}`);

    try {
      const partOfSpeech = word.part_of_speech || 'Unknown';

      const improvedDefinition = await generateImprovedDefinition(
        word.word,
        currentMeaning,
        partOfSpeech,
        levelConfig.ageRange
      );

      if (improvedDefinition && improvedDefinition.length > 10) {
        // Replace the first meaning with the improved one
        word.meanings[0] = improvedDefinition;
        updated++;
        console.log(`  ✅ Improved definition:`);
        console.log(`     ${improvedDefinition}`);
      } else {
        skipped++;
        console.log(`  ⚠️  Could not generate improved definition`);
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

    // Rate limiting - wait 1 second between requests
    if (i < vocabularyData.words.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Final save
  fs.writeFileSync(dataPath, JSON.stringify(vocabularyData, null, 2));

  console.log(`\n✅ Level ${levelConfig.level} Completed!`);
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

// Main function to process all levels
async function processAllLevels() {
  console.log(`🚀 Starting definition improvement for Levels 3-7\n`);

  for (const levelConfig of levels) {
    await processLevel(levelConfig);
    
    // Wait a bit between levels
    if (levelConfig !== levels[levels.length - 1]) {
      console.log(`\n⏸️  Pausing 2 seconds before next level...\n`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`🎉 All levels completed!`);
  console.log(`${'='.repeat(60)}\n`);
}

// Run the enrichment
processAllLevels().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

