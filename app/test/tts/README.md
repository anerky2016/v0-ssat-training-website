# Volcengine Text-to-Speech Test Page

This is a test page for the Volcengine TTS (Text-to-Speech) API integration.

## Setup

### 1. Get Volcengine Credentials

1. Go to [Volcengine Console](https://console.volcengine.com/speech/app)
2. Create a new TTS application or use an existing one
3. Get your credentials:
   - App ID
   - Access Token
   - Cluster (usually `volcano_tts`)

### 2. Configure Environment Variables

Add the following to your `.env.local` file:

```env
VOLCENGINE_TTS_APP_ID=your-volcengine-app-id-here
VOLCENGINE_TTS_ACCESS_TOKEN=your-volcengine-access-token-here
VOLCENGINE_TTS_CLUSTER=volcano_tts
```

### 3. Run the Development Server

```bash
npm run dev
```

### 4. Access the Test Page

Navigate to: http://localhost:3001/test/tts

## Features

- Enter any text to convert to speech
- Generate audio using Volcengine TTS API
- Play the generated audio in the browser
- Download the audio file as MP3

## API Endpoint

The test page uses the following API endpoint:
- `POST /api/tts/volcengine`

## Voice Options

The API currently uses `en_female_lauren_moon_bigtts` (English female voice - Lauren, high quality BigTTS model).

Other available voice types:

**BigTTS Models (High Quality):**
- `en_female_lauren_moon_bigtts` - English female Lauren (currently selected)
- `en_male_adam_moon_bigtts` - English male Adam

**Standard Streaming Models:**
- `BV001_streaming` - Chinese female
- `BV002_streaming` - Chinese male
- `BV700_V2_streaming` - English female
- `BV701_V2_streaming` - English male

To change the voice, edit the `voice_type` parameter in `/app/api/tts/volcengine/route.ts`.

## Audio Configuration

Current settings:
- **Encoding**: MP3
- **Speed**: 1.0 (normal)
- **Volume**: 1.0 (normal)
- **Pitch**: 1.0 (normal)

These can be adjusted in the API route file.

## Troubleshooting

### "Volcengine TTS credentials not configured" Error

Make sure you have set the environment variables correctly in your `.env.local` file and restarted the development server.

### API Error Responses

Check the server console for detailed error logs. Common issues:
- Invalid credentials
- Rate limiting
- Network connectivity issues
- Invalid text input

## References

- [Volcengine TTS Documentation](https://www.volcengine.com/docs/6561/79824)
- [Volcengine Console](https://console.volcengine.com/speech/app)
