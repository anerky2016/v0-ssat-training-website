import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(request: NextRequest) {
  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { word, definition, partOfSpeech } = body

    // Validate required fields
    if (!word || !definition) {
      return NextResponse.json(
        { error: 'Word and definition are required' },
        { status: 400 }
      )
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    // Generate a simple, memorable illustration for the vocabulary word
    const prompt = `Create a simple, clean, educational illustration representing the word "${word}" (${partOfSpeech}).
The image should be memorable and help students understand the meaning: ${definition}.
Style: Simple, clear, educational, suitable for middle school students learning vocabulary.
Use bright colors and clear shapes. No text in the image.`

    console.log('Generating image for word:', word)

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      style: "vivid"
    })

    const imageUrl = response.data[0]?.url

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Failed to generate image' },
        { status: 500 }
      )
    }

    console.log('Image generated successfully for:', word)

    return NextResponse.json(
      {
        success: true,
        imageUrl: imageUrl,
        word: word
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Image generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate image. Please try again later.' },
      { status: 500 }
    )
  }
}
