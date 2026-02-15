/**
 * API Route: Generate Picture Description (Step 1)
 *
 * POST /api/vocabulary/generate-picture-description
 *
 * Uses OpenAI to generate a kid-friendly picture description for a vocabulary word.
 * The description is then saved to Supabase and can be used to generate an actual image.
 */

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { savePictureDescription } from '@/lib/vocabulary-image-cache';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { word, definitions, partOfSpeech, userId } = body;

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

    if (!definitions || !Array.isArray(definitions) || definitions.length === 0) {
      return NextResponse.json(
        { error: 'Definitions array is required and must not be empty' },
        { status: 400 }
      );
    }

    // Build the prompt according to user's specifications
    const definitionsList = definitions
      .map((def, index) => `${index + 1}. ${def}`)
      .join('\n');

    const prompt = `Create a picture for the word "${word}" for kids to memorize the word.

The definition is:
${definitionsList}

Can you please describe a picture? The picture should be intuitive and no alien or any weird items or objects.`;

    console.log(`Generating picture description for word: ${word}`);

    // Call OpenAI to generate the description
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Using a fast, cost-effective model for descriptions
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful assistant that creates picture descriptions for educational vocabulary illustrations. Your descriptions should be clear, kid-friendly, and visually intuitive. Avoid scary, weird, alien, or inappropriate content. Keep descriptions concise but vivid.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    const description = completion.choices[0]?.message?.content?.trim();

    if (!description) {
      return NextResponse.json(
        { error: 'Failed to generate description from OpenAI' },
        { status: 500 }
      );
    }

    console.log(`Generated description for "${word}":`, description);

    // Save the description to Supabase
    const wordImage = await savePictureDescription(
      word,
      definitions,
      description,
      userId,
      partOfSpeech
    );

    return NextResponse.json({
      success: true,
      description,
      word,
      wordImage,
    });
  } catch (error) {
    console.error('Error in generate-picture-description:', error);

    return NextResponse.json(
      {
        error: 'Failed to generate picture description',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
