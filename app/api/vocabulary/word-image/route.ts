/**
 * API Route: Get Word Image Status
 *
 * GET /api/vocabulary/word-image?word={word}
 *
 * Returns the current status of a word's image generation:
 * - Does it exist in the database?
 * - Does it have a description?
 * - Does it have an image URL?
 * - What are the description and image URL if they exist?
 */

import { NextRequest, NextResponse } from 'next/server';
import { getWordImageStatus } from '@/lib/vocabulary-image-cache';

export const dynamic = 'force-dynamic';

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

    const status = await getWordImageStatus(word);

    return NextResponse.json(status);
  } catch (error) {
    console.error('Error in word-image status:', error);

    return NextResponse.json(
      {
        error: 'Failed to get word image status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
