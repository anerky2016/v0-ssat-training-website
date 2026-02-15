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

    const prompt = `TASK:
Create a clear, intuitive picture description to help children memorize a vocabulary word.

INPUT:
Word: ${word}
Definition:
${definitionsList}

REQUIREMENTS:

- The picture must be intuitive and realistic.
- Use familiar real-world scenes only.
- Do NOT include aliens, fantasy creatures, magical elements, or weird objects.
- The scene should be easy for kids ages 8–12 to understand immediately.
- The visual must clearly represent the meaning without needing explanation.
- Focus on one strong central scene (avoid multiple unrelated ideas).

OUTPUT FORMAT:

1. Main Scene (short description)
2. Key Visual Elements (bullet points)
3. How the image shows the meaning (explain mapping to definition)
4. Style Guidelines (visual tone and clarity)
5. Memory Anchor (short optional caption kids can remember)

Keep the answer structured and concise.
Avoid extra commentary.`;

    console.log(`Generating picture description for word: ${word}`);

    // Call OpenAI to generate the description
    const completion = await openai.chat.completions.create({
      model: 'gpt-5-mini', // Using GPT-5 mini model
      messages: [
        {
          role: 'system',
          content:
            'You are an educational visual designer specializing in children\'s vocabulary learning. Create clear, structured picture descriptions that help children ages 8-12 memorize vocabulary words through intuitive visual associations.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_completion_tokens: 2000,
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
