/**
 * Test script to try different FLUX model identifiers
 */

const { Runware } = require('@runware/sdk-js');

async function testModelIdentifier(runware, modelId, description = 'A simple red apple') {
  console.log(`\nTesting model: ${modelId}`);
  try {
    const images = await runware.imageInference({
      positivePrompt: description,
      width: 256,
      height: 256,
      model: modelId,
      numberResults: 1,
      steps: 4, // Use fewer steps for testing
    });

    if (images && images.length > 0) {
      console.log(`✅ SUCCESS! Model "${modelId}" works!`);
      console.log(`   Image URL: ${images[0].imageURL}`);
      return modelId;
    }
  } catch (error) {
    console.log(`❌ Failed: ${error.error?.message || error.message}`);
  }
  return null;
}

async function findWorkingModel() {
  const apiKey = process.env.RUNWARE_API_KEY;

  if (!apiKey) {
    console.error('RUNWARE_API_KEY is not set');
    process.exit(1);
  }

  try {
    const runware = new Runware({ apiKey });
    await runware.ensureConnection();

    console.log('Testing different FLUX model identifiers...\n');

    // List of possible identifiers based on the pattern name:id@version
    const possibleIds = [
      'runware:100@1',  // Original working model
      'flux:1@1',
      'flux:2@1',
      'flux2:1@1',
      'flux-2:1@1',
      'flux.2:1@1',
      'flux-klein:1@1',
      'klein:1@1',
      'flux2-klein:1@1',
      'fluxklein:1@1',
    ];

    console.log('Will test these model IDs:');
    possibleIds.forEach((id, i) => console.log(`  ${i + 1}. ${id}`));

    for (const modelId of possibleIds) {
      const workingModel = await testModelIdentifier(runware, modelId);
      if (workingModel) {
        console.log(`\n${'='.repeat(50)}`);
        console.log(`✅ WORKING MODEL FOUND: ${workingModel}`);
        console.log(`${'='.repeat(50)}\n`);
        break;
      }
      // Wait a bit between tests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    await runware.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

findWorkingModel();
