/**
 * Script to find the correct FLUX.2 [klein] model identifier in Runware
 */

const { Runware } = require('@runware/sdk-js');

async function findKleinModel() {
  const apiKey = process.env.RUNWARE_API_KEY;

  if (!apiKey) {
    console.error('RUNWARE_API_KEY is not set');
    process.exit(1);
  }

  try {
    const runware = new Runware({ apiKey });
    await runware.ensureConnection();

    // Try different search terms
    const searchTerms = ['klein', 'flux.2', 'flux 2', 'runware'];

    for (const term of searchTerms) {
      console.log(`\n=== Searching for: "${term}" ===`);
      try {
        const search = await runware.modelSearch({
          search: term,
        });

        console.log(`Found ${search.results.length} results\n`);

        // Show first 10 results with their AIR IDs
        search.results.slice(0, 10).forEach((model, index) => {
          if (model.airId) {
            console.log(`${index + 1}. ${model.name}`);
            console.log(`   AIR ID: ${model.airId}`);
            console.log('');
          }
        });

        // Look for klein specifically
        const kleinModels = search.results.filter(model =>
          model.airId && (model.name.toLowerCase().includes('klein') || model.name.toLowerCase().includes('flux'))
        );

        if (kleinModels.length > 0) {
          console.log('✅ Found models with AIR IDs:');
          kleinModels.forEach(model => {
            console.log(`   - ${model.name}: ${model.airId}`);
          });
        }
      } catch (error) {
        console.log(`   Error searching for "${term}":`, error.message);
      }
    }

    await runware.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

findKleinModel();
