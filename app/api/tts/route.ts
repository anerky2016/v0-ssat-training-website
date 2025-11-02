import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    const apiKey = process.env.GOOGLE_CLOUD_TTS_API_KEY

    // Debug logging
    console.log('🔑 API Key loaded:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT FOUND')
    console.log('📝 Text to synthesize:', text)

    if (!apiKey) {
      console.error('❌ GOOGLE_CLOUD_TTS_API_KEY environment variable is not set')
      throw new Error('Google Cloud TTS API key not configured')
    }

    // Call Google Cloud TTS REST API
    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode: 'en-US',
            name: 'en-US-Neural2-J', // Natural male voice with good clarity
            // Other high-quality options:
            // 'en-US-Neural2-A' - Male
            // 'en-US-Neural2-C' - Female
            // 'en-US-Neural2-D' - Male
            // 'en-US-Neural2-F' - Female
            // 'en-US-Neural2-J' - Male (recommended for vocabulary)
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: 0.9, // Slightly slower for clarity
            pitch: 0, // Normal pitch
            volumeGainDb: 0, // Normal volume
          },
        }),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error('❌ Google Cloud TTS API error:', error)
      console.error('❌ Status:', response.status)
      throw new Error(`TTS API failed: ${response.status}`)
    }

    const data = await response.json()

    if (!data.audioContent) {
      console.error('❌ No audio content in response')
      throw new Error('No audio content received')
    }

    // Decode base64 audio content
    const buffer = Buffer.from(data.audioContent, 'base64')
    console.log('✅ Audio generated successfully, size:', buffer.length, 'bytes')

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
      },
    })
  } catch (error) {
    console.error('❌ Google Cloud TTS API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate speech' },
      { status: 500 }
    )
  }
}
