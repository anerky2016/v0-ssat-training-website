/**
 * API Route: Generate Image from Description (Step 2)
 *
 * POST /api/vocabulary/generate-image-from-description
 *
 * Uses Runware.ai to generate an actual image from a picture description.
 * Requires that a description has already been generated and saved for the word.
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateImageWithRunware } from '@/lib/runware-image-generation';
import { saveImageUrl, getWordImageStatus } from '@/lib/vocabulary-image-cache';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { word, description, userId } = body;

    // Authentication check - require userId
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { error: 'Authentication required. Please log in to generate pictures.' },
        { status: 401 }
      );
    }

    // Validate input
    if (!word || typeof word !== 'string') {
      return NextResponse.json(
        { error: 'Word is required and must be a string' },
        { status: 400 }
      );
    }

    if (!description || typeof description !== 'string') {
      return NextResponse.json(
        { error: 'Description is required and must be a string' },
        { status: 400 }
      );
    }

    console.log(`Generating image for word: ${word}`);
    console.log(`Using description: ${description}`);

    // Generate image with Runware
    const { imageUrl, taskUuid } = await generateImageWithRunware({
      description,
      width: 512,
      height: 512,
    });

    console.log(`Generated image for "${word}":`, imageUrl);
    console.log(`Task UUID: ${taskUuid}`);

    // Save the image URL to Supabase
    const wordImage = await saveImageUrl(word, imageUrl, 'runware');

    return NextResponse.json({
      success: true,
      imageUrl,
      word,
      taskUuid,
      wordImage,
    });
  } catch (error) {
    console.error('Error in generate-image-from-description:', error);

    return NextResponse.json(
      {
        error: 'Failed to generate image',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/vocabulary/generate-image-from-description?word={word}
 *
 * Alternative endpoint: Generate image automatically from saved description
 * This checks if a description exists and uses it to generate the image
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const word = searchParams.get('word');

    if (!word) {
      return NextResponse.json(
        { error: 'Word parameter is required' },
        { status: 400 }
      );
    }

    // Check if description exists
    const status = await getWordImageStatus(word);

    if (!status.hasDescription) {
      return NextResponse.json(
        { error: 'No description found for this word. Generate description first.' },
        { status: 404 }
      );
    }

    if (status.hasImage) {
      return NextResponse.json(
        {
          success: true,
          imageUrl: status.imageUrl,
          word,
          message: 'Image already exists',
        },
        { status: 200 }
      );
    }

    // Generate image using the saved description
    const { imageUrl, taskUuid } = await generateImageWithRunware({
      description: status.description!,
      width: 512,
      height: 512,
    });

    console.log(`Generated image for "${word}":`, imageUrl);

    // Save the image URL
    const wordImage = await saveImageUrl(word, imageUrl, 'runware');

    return NextResponse.json({
      success: true,
      imageUrl,
      word,
      taskUuid,
      wordImage,
    });
  } catch (error) {
    console.error('Error in generate-image-from-description (GET):', error);

    return NextResponse.json(
      {
        error: 'Failed to generate image',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
