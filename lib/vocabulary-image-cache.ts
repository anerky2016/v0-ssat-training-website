/**
 * Vocabulary Image Cache - Supabase Operations
 *
 * This module handles all database operations for the word_images table.
 * It provides functions to:
 * - Check if a word has a description or image
 * - Save picture descriptions from OpenAI
 * - Save image URLs from Runware
 * - Retrieve cached images
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export interface WordImage {
  id: string;
  word: string;
  definitions: string[];
  part_of_speech?: string;
  picture_description?: string;
  description_generated_at?: string;
  image_url?: string;
  image_generated_at?: string;
  image_provider?: string;
  user_id?: string;
  created_at: string;
  updated_at: string;
}

export interface WordImageStatus {
  exists: boolean;
  hasDescription: boolean;
  hasImage: boolean;
  description?: string;
  imageUrl?: string;
  wordImage?: WordImage;
}

/**
 * Get the status of a word's image generation
 *
 * @param word - The vocabulary word to check
 * @returns Promise with the word's image status
 */
export async function getWordImageStatus(
  word: string
): Promise<WordImageStatus> {
  const { data, error } = await supabase
    .from('word_images')
    .select('*')
    .eq('word', word.toLowerCase())
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 is "no rows returned" - that's fine, means it doesn't exist
    console.error('Error fetching word image status:', error);
    throw error;
  }

  if (!data) {
    return {
      exists: false,
      hasDescription: false,
      hasImage: false,
    };
  }

  return {
    exists: true,
    hasDescription: !!data.picture_description,
    hasImage: !!data.image_url,
    description: data.picture_description,
    imageUrl: data.image_url,
    wordImage: data as WordImage,
  };
}

/**
 * Save a picture description for a word (Step 1 of generation)
 *
 * @param word - The vocabulary word
 * @param definitions - Array of word definitions
 * @param description - The AI-generated picture description
 * @param userId - The user who requested the generation
 * @param partOfSpeech - Optional part of speech
 * @returns Promise with the saved word image record
 */
export async function savePictureDescription(
  word: string,
  definitions: string[],
  description: string,
  userId?: string,
  partOfSpeech?: string
): Promise<WordImage> {
  const now = new Date().toISOString();

  // Try to update existing record first
  const { data: existingData } = await supabase
    .from('word_images')
    .select('*')
    .eq('word', word.toLowerCase())
    .single();

  if (existingData) {
    // Update existing record
    const { data, error } = await supabase
      .from('word_images')
      .update({
        picture_description: description,
        description_generated_at: now,
        updated_at: now,
      })
      .eq('word', word.toLowerCase())
      .select()
      .single();

    if (error) {
      console.error('Error updating picture description:', error);
      throw error;
    }

    return data as WordImage;
  }

  // Insert new record
  const { data, error } = await supabase
    .from('word_images')
    .insert({
      word: word.toLowerCase(),
      definitions,
      part_of_speech: partOfSpeech,
      picture_description: description,
      description_generated_at: now,
      user_id: userId,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving picture description:', error);
    throw error;
  }

  return data as WordImage;
}

/**
 * Save an image URL for a word (Step 2 of generation)
 *
 * @param word - The vocabulary word
 * @param imageUrl - The generated image URL from Runware
 * @param provider - The image provider (default: 'runware')
 * @returns Promise with the updated word image record
 */
export async function saveImageUrl(
  word: string,
  imageUrl: string,
  provider: string = 'runware'
): Promise<WordImage> {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('word_images')
    .update({
      image_url: imageUrl,
      image_generated_at: now,
      image_provider: provider,
      updated_at: now,
    })
    .eq('word', word.toLowerCase())
    .select()
    .single();

  if (error) {
    console.error('Error saving image URL:', error);
    throw error;
  }

  return data as WordImage;
}

/**
 * Get all words that have images generated
 *
 * @returns Promise with array of words with images
 */
export async function getWordsWithImages(): Promise<WordImage[]> {
  const { data, error } = await supabase
    .from('word_images')
    .select('*')
    .not('image_url', 'is', null)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching words with images:', error);
    throw error;
  }

  return data as WordImage[];
}

/**
 * Get all words that have descriptions but no images yet
 *
 * @returns Promise with array of words with descriptions only
 */
export async function getWordsWithDescriptionsOnly(): Promise<WordImage[]> {
  const { data, error } = await supabase
    .from('word_images')
    .select('*')
    .not('picture_description', 'is', null)
    .is('image_url', null)
    .order('description_generated_at', { ascending: false });

  if (error) {
    console.error('Error fetching words with descriptions only:', error);
    throw error;
  }

  return data as WordImage[];
}

/**
 * Delete a word's image data (for regeneration)
 *
 * @param word - The vocabulary word
 * @returns Promise indicating success
 */
export async function deleteWordImage(word: string): Promise<void> {
  const { error } = await supabase
    .from('word_images')
    .delete()
    .eq('word', word.toLowerCase());

  if (error) {
    console.error('Error deleting word image:', error);
    throw error;
  }
}
