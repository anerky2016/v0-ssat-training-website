/**
 * Runware Image Generation Service
 *
 * This service wraps the Runware.ai SDK for generating images from text descriptions.
 * It's used in the two-step picture generation process:
 * 1. OpenAI generates a picture description
 * 2. Runware generates the actual image from that description
 */

import { Runware } from '@runware/sdk-js';

interface GenerateImageOptions {
  description: string;
  width?: number;
  height?: number;
  model?: string;
  negativePrompt?: string;
}

/**
 * Generate an image using Runware SDK
 *
 * @param options - Image generation options including the description
 * @returns Promise with the generated image URL
 */
export async function generateImageWithRunware(
  options: GenerateImageOptions
): Promise<{ imageUrl: string; taskUuid: string }> {
  const apiKey = process.env.RUNWARE_API_KEY;

  if (!apiKey) {
    throw new Error('RUNWARE_API_KEY is not set in environment variables');
  }

  const {
    description,
    width = 512,
    height = 512,
    model = 'runware:400@1', // Reverted to previous model
    negativePrompt = 'blurry, low quality, distorted, weird, scary, alien, inappropriate for children, violent, dark, creepy'
  } = options;

  try {
    // Initialize the Runware SDK
    const runware = new Runware({ apiKey });

    // Ensure connection is established
    await runware.ensureConnection();

    console.log('Generating image with Runware SDK...');
    console.log(`Model: ${model}`);
    console.log(`Description from OpenAI: ${description}`);

    // Generate the image using the SDK
    const images = await runware.imageInference({
      positivePrompt: description, // This is the description from OpenAI
      negativePrompt,
      width,
      height,
      model,
      steps: 25,
      outputFormat: 'WEBP',
      outputType: 'URL',
      numberResults: 1,
      CFGScale: 7.5,
      checkNSFW: true, // Enable NSFW checking
    });

    if (!images || images.length === 0) {
      throw new Error('No images returned from Runware API');
    }

    const image = images[0];

    // Check for NSFW content (safety check)
    if (image.NSFWContent) {
      console.warn(`NSFW content detected for prompt: ${description}`);
      throw new Error('Generated image was flagged as inappropriate');
    }

    if (!image.imageURL) {
      throw new Error('No image URL returned from Runware API');
    }

    console.log(`Image generated successfully: ${image.imageURL}`);

    // Disconnect after use to clean up WebSocket connection
    await runware.disconnect();

    return {
      imageUrl: image.imageURL,
      taskUuid: image.taskUUID,
    };
  } catch (error) {
    console.error('Error generating image with Runware:', error);
    throw error;
  }
}

/**
 * Test connection to Runware API
 *
 * @returns Promise indicating if the connection is successful
 */
export async function testRunwareConnection(): Promise<boolean> {
  const apiKey = process.env.RUNWARE_API_KEY;

  if (!apiKey) {
    console.error('RUNWARE_API_KEY is not set');
    return false;
  }

  try {
    const runware = new Runware({ apiKey });
    await runware.ensureConnection();
    console.log('Successfully connected to Runware API');
    await runware.disconnect();
    return true;
  } catch (error) {
    console.error('Runware connection test failed:', error);
    return false;
  }
}
