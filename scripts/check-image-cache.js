/**
 * Script to check the word_images table and diagnose issues
 */

const { createClient } = require('@supabase/supabase-js');

async function checkImageCache() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('Fetching all word images from database...\n');

  // Get all records with images
  const { data, error } = await supabase
    .from('word_images')
    .select('*')
    .not('image_url', 'is', null)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching data:', error);
    process.exit(1);
  }

  if (!data || data.length === 0) {
    console.log('No images found in database');
    return;
  }

  console.log(`Found ${data.length} word(s) with images:\n`);

  // Check for duplicates
  const wordCounts = {};
  const imageUrlCounts = {};

  data.forEach((record, index) => {
    console.log(`${index + 1}. Word: "${record.word}"`);
    console.log(`   Image URL: ${record.image_url}`);
    console.log(`   Description: ${record.picture_description?.substring(0, 80)}...`);
    console.log(`   Created: ${record.created_at}`);
    console.log('');

    // Count occurrences
    wordCounts[record.word] = (wordCounts[record.word] || 0) + 1;
    imageUrlCounts[record.image_url] = (imageUrlCounts[record.image_url] || 0) + 1;
  });

  // Check for issues
  console.log('\n=== DIAGNOSTIC RESULTS ===\n');

  // Check for duplicate words
  const duplicateWords = Object.keys(wordCounts).filter(word => wordCounts[word] > 1);
  if (duplicateWords.length > 0) {
    console.log('⚠️  FOUND DUPLICATE WORDS (should be unique!):');
    duplicateWords.forEach(word => {
      console.log(`   - "${word}" appears ${wordCounts[word]} times`);
    });
    console.log('');
  } else {
    console.log('✅ No duplicate words found');
  }

  // Check for duplicate image URLs
  const duplicateImageUrls = Object.keys(imageUrlCounts).filter(url => imageUrlCounts[url] > 1);
  if (duplicateImageUrls.length > 0) {
    console.log('⚠️  FOUND SAME IMAGE URL FOR MULTIPLE WORDS (this is the problem!):');
    duplicateImageUrls.forEach(url => {
      const wordsWithThisImage = data
        .filter(record => record.image_url === url)
        .map(record => record.word);
      console.log(`   Image: ${url.substring(0, 60)}...`);
      console.log(`   Used by words: ${wordsWithThisImage.join(', ')}`);
      console.log('');
    });
  } else {
    console.log('✅ Each word has a unique image');
  }

  console.log('\n=== SUMMARY ===');
  console.log(`Total words with images: ${data.length}`);
  console.log(`Unique words: ${Object.keys(wordCounts).length}`);
  console.log(`Unique images: ${Object.keys(imageUrlCounts).length}`);
}

checkImageCache().catch(console.error);
