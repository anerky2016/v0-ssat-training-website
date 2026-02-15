/**
 * Runware Image Generation Service
 *
 * This service wraps the Runware.ai API for generating images from text descriptions.
 * It's used in the two-step picture generation process:
 * 1. OpenAI generates a picture description
 * 2. Runware generates the actual image from that description
 */

interface RunwareImageRequest {
  taskType: 'imageInference';
  positivePrompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  model?: string;
  steps?: number;
  outputFormat?: 'PNG' | 'JPEG' | 'WEBP';
  outputType?: 'URL' | 'base64';
  numberResults?: number;
  CFGScale?: number;
  scheduler?: string;
  seed?: number;
}

interface RunwareImageResponse {
  taskType: 'imageInference';
  taskUUID: string;
  imageURL?: string;
  imageBase64?: string;
  NSFWContent: boolean;
  error?: {
    code: string;
    message: string;
  };
}

interface GenerateImageOptions {
  description: string;
  width?: number;
  height?: number;
  model?: string;
  negativePrompt?: string;
}

/**
 * Generate an image using Runware.ai API
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
    model = 'runware:100@1',
    negativePrompt = 'blurry, low quality, distorted, weird, scary, alien, inappropriate for children, violent, dark, creepy'
  } = options;

  // Build the request payload
  const requestPayload: RunwareImageRequest = {
    taskType: 'imageInference',
    positivePrompt: description,
    negativePrompt,
    width,
    height,
    model,
    steps: 25,
    outputFormat: 'WEBP',
    outputType: 'URL',
    numberResults: 1,
    CFGScale: 7.5,
  };

  try {
    // Call Runware API
    const response = await fetch('https://api.runware.ai/v1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify([requestPayload]),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Runware API error: ${response.status} - ${errorText}`);
    }

    const data: RunwareImageResponse[] = await response.json();

    if (!data || data.length === 0) {
      throw new Error('No response data from Runware API');
    }

    const result = data[0];

    if (result.error) {
      throw new Error(`Runware API error: ${result.error.message}`);
    }

    if (!result.imageURL) {
      throw new Error('No image URL returned from Runware API');
    }

    // Check for NSFW content (safety check)
    if (result.NSFWContent) {
      console.warn(`NSFW content detected for prompt: ${description}`);
      throw new Error('Generated image was flagged as inappropriate');
    }

    return {
      imageUrl: result.imageURL,
      taskUuid: result.taskUUID,
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
  try {
    await generateImageWithRunware({
      description: 'A simple red apple on a white background',
      width: 256,
      height: 256,
    });
    return true;
  } catch (error) {
    console.error('Runware connection test failed:', error);
    return false;
  }
}
