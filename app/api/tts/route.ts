import { NextRequest, NextResponse } from 'next/server'
import textToSpeech from '@google-cloud/text-to-speech'

// Initialize Google Cloud TTS client
let client: textToSpeech.TextToSpeechClient | null = null

function getClient() {
  if (!client) {
    // Check if credentials are provided via service account key file path
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      client = new textToSpeech.TextToSpeechClient()
    }
    // Or via inline JSON credentials
    else if (process.env.GOOGLE_CLOUD_CREDENTIALS_JSON) {
      const credentials = JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS_JSON)
      client = new textToSpeech.TextToSpeechClient({
        credentials
      })
    }
    else {
      throw new Error('Google Cloud credentials not configured')
    }
  }
  return client
}

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    const ttsClient = getClient()

    // Configure the TTS request with Neural2 voice (most natural)
    const [response] = await ttsClient.synthesizeSpeech({
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
        audioEncoding: 'MP3' as const,
        speakingRate: 0.9, // Slightly slower for clarity
        pitch: 0, // Normal pitch
        volumeGainDb: 0, // Normal volume
      },
    })

    if (!response.audioContent) {
      throw new Error('No audio content received')
    }

    const buffer = Buffer.from(response.audioContent)

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
      },
    })
  } catch (error) {
    console.error('Google Cloud TTS API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate speech' },
      { status: 500 }
    )
  }
}
