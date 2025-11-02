# Google Cloud Text-to-Speech Setup

This guide walks you through setting up Google Cloud TTS for natural-sounding vocabulary pronunciation using the REST API with an API key.

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name your project (e.g., "ssat-training-tts")
4. Click "Create"

## Step 2: Enable Text-to-Speech API

1. In the Google Cloud Console, go to [APIs & Services > Library](https://console.cloud.google.com/apis/library)
2. Search for "Cloud Text-to-Speech API"
3. Click on it and press "Enable"

## Step 3: Create API Key

1. Go to [APIs & Services > Credentials](https://console.cloud.google.com/apis/credentials)
2. Click "Create Credentials" → "API key"
3. Your API key will be created and displayed
4. **Optional but recommended**: Click "Restrict Key" to limit usage:
   - Under "API restrictions", select "Restrict key"
   - Choose "Cloud Text-to-Speech API" from the dropdown
   - Click "Save"

## Step 4: Configure Environment Variables

### For Local Development

Add to your `.env.local`:

```bash
GOOGLE_CLOUD_TTS_API_KEY=your-api-key-here
```

### For Production (Vercel)

1. Go to your Vercel project dashboard
2. Settings → Environment Variables
3. Add: `GOOGLE_CLOUD_TTS_API_KEY` with your API key value
4. Deploy or redeploy your application

## Step 5: Enable Billing (Free Tier Available)

1. Go to [Billing](https://console.cloud.google.com/billing)
2. Link a billing account (required even for free tier)
3. **Free tier includes**:
   - First 1 million characters per month are FREE for WaveNet voices
   - First 4 million characters per month are FREE for Neural2 voices (what we're using!)

## Step 6: Test the Setup

1. Restart your dev server: `npm run dev`
2. Go to vocabulary words page
3. Click any speaker icon
4. You should hear high-quality Google Cloud TTS pronunciation

## Pricing (After Free Tier)

- **Neural2 voices**: $16 per 1 million characters
- **WaveNet voices**: $16 per 1 million characters
- **Standard voices**: $4 per 1 million characters

**Estimate**:
- Average vocabulary word: ~10 characters
- 513 vocabulary words ≈ 5,130 characters
- Full practice session: ~100 pronunciations ≈ 1,000 characters
- Free tier allows: ~4,000 full practice sessions per month

## Voice Options

Edit `/app/api/tts/route.ts` to change the voice:

```typescript
voice: {
  languageCode: 'en-US',
  name: 'en-US-Neural2-J', // Change this line
}
```

**Available Neural2 voices:**
- `en-US-Neural2-A` - Male, conversational
- `en-US-Neural2-C` - Female, clear
- `en-US-Neural2-D` - Male, authoritative
- `en-US-Neural2-F` - Female, warm
- `en-US-Neural2-J` - Male, excellent clarity (current default)

See all voices: [Google Cloud TTS Voices](https://cloud.google.com/text-to-speech/docs/voices)

## Troubleshooting

### Error: "Google Cloud credentials not configured"
- Check that environment variable is set correctly
- Restart dev server after adding credentials

### Error: "API not enabled"
- Make sure you enabled the Text-to-Speech API in step 2

### Error: "Permission denied"
- Check that service account has "Cloud Text-to-Speech User" role

### Fallback to browser TTS
- If Google Cloud TTS fails, the app automatically falls back to browser speech synthesis
- Check browser console for error messages

## Security Notes

- **Never commit credentials to git**
- Add `*.json` to `.gitignore` (already done)
- Use environment variables for production
- Rotate keys periodically for security
