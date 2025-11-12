import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { getCacheKey, getCacheUrl, isCached, saveToCache, readFromCache } from '@/lib/audio-cache'

// Volcengine TTS API configuration
const VOLCENGINE_API_HOST = 'openspeech.bytedance.com'
const VOLCENGINE_API_PATH = '/api/v1/tts'

interface VolcengineRequest {
  app: {
    appid: string
    token: string
    cluster: string
  }
  user: {
    uid: string
  }
  audio: {
    voice_type: string
    encoding: string
    speed_ratio: number
    volume_ratio: number
    pitch_ratio: number
  }
  request: {
    reqid: string
    text: string
    text_type: string
    operation: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    const voiceType = 'en_female_lauren_moon_bigtts'

    // Check if audio is already cached
    if (isCached(text, voiceType)) {
      console.log('✅ [Volcengine TTS] Serving from cache:', text.substring(0, 50))
      const cacheKey = getCacheKey(text, voiceType)
      const cachedAudio = readFromCache(cacheKey)

      if (cachedAudio) {
        return new NextResponse(cachedAudio, {
          headers: {
            'Content-Type': 'audio/mpeg',
            'Content-Length': cachedAudio.length.toString(),
            'Cache-Control': 'public, max-age=31536000, immutable',
            'X-Cache-Status': 'HIT'
          }
        })
      }
    }

    const appId = process.env.VOLCENGINE_TTS_APP_ID
    const accessToken = process.env.VOLCENGINE_TTS_ACCESS_TOKEN
    const cluster = process.env.VOLCENGINE_TTS_CLUSTER || 'volcano_tts'

    console.log('🔑 Volcengine credentials loaded:', {
      appId: appId ? `${appId.substring(0, 10)}...` : 'NOT FOUND',
      token: accessToken ? 'FOUND' : 'NOT FOUND',
      cluster
    })
    console.log('📝 Text to synthesize:', text)

    if (!appId || !accessToken) {
      console.error('❌ Volcengine TTS credentials not configured')
      return NextResponse.json(
        { error: 'Volcengine TTS credentials not configured. Please set VOLCENGINE_TTS_APP_ID and VOLCENGINE_TTS_ACCESS_TOKEN environment variables.' },
        { status: 500 }
      )
    }

    // Generate a unique request ID
    const reqId = crypto.randomUUID()

    // Prepare the request payload
    const payload: VolcengineRequest = {
      app: {
        appid: appId,
        token: accessToken,
        cluster: cluster
      },
      user: {
        uid: 'test-user-' + Date.now()
      },
      audio: {
        voice_type: 'en_female_lauren_moon_bigtts', // English female voice - Lauren (high quality BigTTS model)
        // Other voice options:
        // 'BV001_streaming' - Chinese female
        // 'BV002_streaming' - Chinese male
        // 'BV700_V2_streaming' - English female
        // 'BV701_V2_streaming' - English male
        // 'en_female_lauren_moon_bigtts' - English female Lauren (BigTTS)
        // 'en_male_adam_moon_bigtts' - English male Adam (BigTTS)
        encoding: 'mp3',
        speed_ratio: 1.0,
        volume_ratio: 1.0,
        pitch_ratio: 1.0
      },
      request: {
        reqid: reqId,
        text: text,
        text_type: 'plain',
        operation: 'query'
      }
    }

    console.log('🚀 Sending request to Volcengine TTS API...')

    // Call Volcengine TTS API
    const response = await fetch(`https://${VOLCENGINE_API_HOST}${VOLCENGINE_API_PATH}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer; ${accessToken}`
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Volcengine TTS API error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      })
      return NextResponse.json(
        { error: `Volcengine TTS API failed: ${response.status} ${response.statusText}` },
        { status: response.status }
      )
    }

    const contentType = response.headers.get('content-type')

    // Check if response is JSON (error) or audio
    if (contentType?.includes('application/json')) {
      const data = await response.json()
      console.log('📦 Volcengine response:', data)

      if (data.code !== 0 && data.code !== 3000) {
        console.error('❌ Volcengine API returned error:', data)
        return NextResponse.json(
          { error: data.message || 'TTS generation failed' },
          { status: 400 }
        )
      }

      // If we get JSON but it's successful, there might be audio data encoded
      if (data.data) {
        const audioBuffer = Buffer.from(data.data, 'base64')
        console.log('✅ Audio generated successfully, size:', audioBuffer.length, 'bytes')

        // Save to cache
        await saveToCache(text, audioBuffer, voiceType)

        return new NextResponse(audioBuffer, {
          headers: {
            'Content-Type': 'audio/mpeg',
            'Content-Length': audioBuffer.length.toString(),
            'Cache-Control': 'public, max-age=31536000, immutable',
            'X-Cache-Status': 'MISS'
          }
        })
      }
    }

    // If response is audio stream directly
    const audioArrayBuffer = await response.arrayBuffer()
    const audioBuffer = Buffer.from(audioArrayBuffer)
    console.log('✅ Audio generated successfully, size:', audioBuffer.length, 'bytes')

    // Save to cache
    await saveToCache(text, audioBuffer, voiceType)

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Cache-Status': 'MISS'
      }
    })

  } catch (error) {
    console.error('❌ Volcengine TTS error:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate speech',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
