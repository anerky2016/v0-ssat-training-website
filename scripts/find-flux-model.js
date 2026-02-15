/**
 * Script to find the correct FLUX.2 [dev] model identifier in Runware
 */

const { Runware } = require('@runware/sdk-js');

async function findFluxModel() {
  const apiKey = process.env.RUNWARE_API_KEY;

  if (!apiKey) {
    console.error('RUNWARE_API_KEY is not set');
    process.exit(1);
  }

  try {
    const runware = new Runware({ apiKey });
    await runware.ensureConnection();

    console.log('Searching for FLUX models...\n');

    // Search for FLUX.1 dev
    console.log('=== Searching for FLUX.1 dev ===');
    const flux1DevSearch = await runware.modelSearch({
      search: 'flux.1-dev',
    });

    console.log(`Found ${flux1DevSearch.results.length} results for "flux.1-dev":\n`);
    flux1DevSearch.results.slice(0, 5).forEach((model, index) => {
      console.log(`${index + 1}. Name: ${model.name}`);
      console.log(`   AIR ID: ${model.airId}`);
      console.log('');
    });

    // Search for FLUX dev
    console.log('\n=== Searching for "flux dev" ===');
    const fluxDevSearch = await runware.modelSearch({
      search: 'flux dev',
    });

    console.log(`Found ${fluxDevSearch.results.length} results for "flux dev":\n`);
    fluxDevSearch.results.slice(0, 5).forEach((model, index) => {
      console.log(`${index + 1}. Name: ${model.name}`);
      console.log(`   AIR ID: ${model.airId}`);
      console.log('');
    });

    // Search for stable diffusion alternatives
    console.log('\n=== Searching for "stable-diffusion" ===');
    const fluxSearch = await runware.modelSearch({
      search: 'stable-diffusion',
    });

    console.log(`Found ${fluxSearch.results.length} FLUX models:\n`);

    // Display all FLUX models
    fluxSearch.results.forEach((model, index) => {
      console.log(`${index + 1}. Name: ${model.name}`);
      console.log(`   AIR ID: ${model.airId}`);
      console.log(`   Description: ${model.description || 'N/A'}`);
      console.log('');
    });

    // Look specifically for FLUX.2 dev
    const flux2Dev = fluxSearch.results.find(model =>
      model.name.toLowerCase().includes('flux') &&
      (model.name.toLowerCase().includes('2') || model.name.toLowerCase().includes('dev'))
    );

    if (flux2Dev) {
      console.log('=================================');
      console.log('✅ RECOMMENDED MODEL:');
      console.log(`   Name: ${flux2Dev.name}`);
      console.log(`   AIR ID: ${flux2Dev.airId}`);
      console.log('=================================\n');
    }

    await runware.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

findFluxModel();
