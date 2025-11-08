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

// Level configuration - only levels 4 and 7
const levels = [
  { level: 4, ageRange: '7-8', file: 'wordly-wise-level-4.json' },
  { level: 7, ageRange: '11-12', file: 'wordly-wise-level-7.json' },
];

// Function to generate synonyms and antonyms using OpenAI
async function generateSynonymsAntonyms(word, meaning, partOfSpeech, ageRange) {
  try {
    const prompt = `Generate synonyms and antonyms for the word "${word}" (${partOfSpeech}).

Meaning: ${meaning}
Age range: ${ageRange} years old

Requirements:
- Generate 5-8 synonyms that are appropriate for ${ageRange} year old children
- Generate 2-5 antonyms that are appropriate for ${ageRange} year old children
- Use vocabulary that children in this age range would understand
- Synonyms should be clear and commonly used
- Antonyms should be clear opposites
- Return ONLY a JSON object in this exact format:
{
  "synonyms": ["synonym1", "synonym2", "synonym3"],
  "antonyms": ["antonym1", "antonym2"]
}

Do not include any other text, explanations, or formatting. Only return the JSON object.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a helpful teacher who creates age-appropriate synonyms and antonyms for children learning vocabulary. You specialize in creating content for ${ageRange} year old children.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 300,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content || '';
    
    try {
      // Try to parse JSON from the response
      let jsonContent = content.trim();
      
      // Remove markdown code blocks if present
      jsonContent = jsonContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      // Find JSON object in the response
      const jsonMatch = jsonContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          synonyms: Array.isArray(parsed.synonyms) ? parsed.synonyms.slice(0, 8) : [],
          antonyms: Array.isArray(parsed.antonyms) ? parsed.antonyms.slice(0, 5) : [],
        };
      }
    } catch (parseError) {
      console.error(`  ⚠️  JSON parse error: ${parseError.message}`);
    }
    
    return { synonyms: [], antonyms: [] };
  } catch (error) {
    console.error(`  ❌ Error generating synonyms/antonyms: ${error.message}`);
    return { synonyms: [], antonyms: [] };
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

    // Check if word already has good synonyms and antonyms
    const hasGoodSynonyms = word.synonyms && word.synonyms.length >= 3;
    const hasGoodAntonyms = word.antonyms && word.antonyms.length >= 2;
    
    if (hasGoodSynonyms && hasGoodAntonyms) {
      console.log(`⏭️  [${i + 1}/${vocabularyData.words.length}] Skipping "${word.word}" (already has synonyms and antonyms)`);
      skipped++;
      processed++;
      continue;
    }

    console.log(`🔍 [${i + 1}/${vocabularyData.words.length}] Processing "${word.word}"...`);

    try {
      const meaning = word.meanings && word.meanings.length > 0 
        ? word.meanings[0] 
        : 'No definition available';
      
      const partOfSpeech = word.part_of_speech || 'Unknown';

      const result = await generateSynonymsAntonyms(
        word.word,
        meaning,
        partOfSpeech,
        levelConfig.ageRange
      );

      if (result.synonyms.length > 0 || result.antonyms.length > 0) {
        if (result.synonyms.length > 0) {
          word.synonyms = result.synonyms;
        }
        if (result.antonyms.length > 0) {
          word.antonyms = result.antonyms;
        }
        updated++;
        console.log(`  ✅ Generated ${result.synonyms.length} synonyms, ${result.antonyms.length} antonyms`);
        if (result.synonyms.length > 0) {
          console.log(`     Synonyms: ${result.synonyms.slice(0, 3).join(', ')}${result.synonyms.length > 3 ? '...' : ''}`);
        }
        if (result.antonyms.length > 0) {
          console.log(`     Antonyms: ${result.antonyms.join(', ')}`);
        }
      } else {
        skipped++;
        console.log(`  ⚠️  No synonyms/antonyms generated`);
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
  console.log(`🚀 Starting synonyms and antonyms generation for Levels 4 and 7\n`);

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

