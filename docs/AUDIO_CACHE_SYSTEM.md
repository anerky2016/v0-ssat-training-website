# Audio Cache System

This document describes the server-side audio caching system for TTS (Text-to-Speech) generated audio files.

## Overview

The audio caching system generates voice audio on-demand using Volcengine TTS and stores the generated files on the server to avoid regenerating them. This provides:

- **Cost Savings**: Avoid repeated API calls for the same text
- **Performance**: Instant audio playback from cached files
- **Reliability**: Reduced dependency on external TTS APIs

## Architecture

### Components

1. **Audio Cache Utilities** (`lib/audio-cache.ts`)
   - Server-side file caching functions
   - Client-side memory caching for browser
   - Cache management utilities

2. **Volcengine TTS API** (`app/api/tts/volcengine/route.ts`)
   - Checks cache before generating audio
   - Generates audio using Volcengine BigTTS model
   - Saves generated audio to cache

3. **Cache Management APIs**
   - `GET /api/tts/cache/stats` - View cache statistics
   - `POST /api/tts/cache/clear` - Clear cache files

4. **Static File Serving**
   - Cached files stored in `public/audio/tts/`
   - Automatically served by Next.js at `/audio/tts/{filename}.mp3`

## How It Works

### 1. Audio Generation Flow

```
User requests audio
  ↓
Check if cached (MD5 hash of text)
  ↓
├─ CACHE HIT → Serve file from public/audio/tts/
└─ CACHE MISS → Call Volcengine API
                  ↓
                Save to public/audio/tts/
                  ↓
                Return audio to client
```

### 2. Cache Key Generation

- Text is normalized (lowercase, trimmed)
- MD5 hash generated for consistent filenames
- Voice type included in hash (if specified)
- Format: `{md5hash}.mp3`

Example:
- Text: "Hello World"
- Voice: "en_female_lauren_moon_bigtts"
- Cache Key: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6.mp3`

### 3. Response Headers

**Cache HIT** (served from cache):
```
Content-Type: audio/mpeg
Cache-Control: public, max-age=31536000, immutable
X-Cache-Status: HIT
```

**Cache MISS** (newly generated):
```
Content-Type: audio/mpeg
Cache-Control: public, max-age=31536000, immutable
X-Cache-Status: MISS
```

## Configuration

### Environment Variables

```env
# Volcengine TTS Configuration
VOLCENGINE_TTS_APP_ID=your_app_id_here
VOLCENGINE_TTS_ACCESS_TOKEN=your_access_token_here
VOLCENGINE_TTS_CLUSTER=volcano_tts
```

### Voice Model

Current voice: **en_female_lauren_moon_bigtts** (Lauren - English female, high quality BigTTS model)

To change the voice, edit `app/api/tts/volcengine/route.ts`:
```typescript
const voiceType = 'en_female_lauren_moon_bigtts' // Change this
```

Available voices:
- `en_female_lauren_moon_bigtts` - English female Lauren (BigTTS)
- `en_male_adam_moon_bigtts` - English male Adam (BigTTS)
- `BV700_V2_streaming` - English female (standard)
- `BV701_V2_streaming` - English male (standard)

## API Usage

### Generate/Retrieve Audio

**POST** `/api/tts/volcengine`

Request:
```json
{
  "text": "Hello, this is a test"
}
```

Response: Audio file (audio/mpeg) with cache status header

### View Cache Statistics

**GET** `/api/tts/cache/stats`

Response:
```json
{
  "totalFiles": 150,
  "totalSize": 5242880,
  "totalSizeFormatted": "5.00 MB",
  "files": [
    {
      "name": "a1b2c3d4...mp3",
      "size": 34816,
      "sizeFormatted": "34.00 KB",
      "modified": "2025-01-11T10:30:00.000Z"
    }
  ]
}
```

### Clear Cache

**POST** `/api/tts/cache/clear`

Request (optional):
```json
{
  "daysOld": 30  // Only delete files older than 30 days
}
```

Response:
```json
{
  "success": true,
  "deletedCount": 45,
  "message": "Deleted 45 files older than 30 days"
}
```

## File Structure

```
public/
  └── audio/
      └── tts/
          ├── README.md
          ├── a1b2c3d4e5f6...mp3
          ├── b2c3d4e5f6g7...mp3
          └── ...
```

## Cache Management

### Automatic Cleanup

Currently, cache files are not automatically deleted. Consider implementing:
- Cron job to clear files older than X days
- Max cache size limit with LRU eviction

### Manual Cleanup

Using the API:
```bash
# Clear all cache
curl -X POST http://localhost:3001/api/tts/cache/clear

# Clear files older than 30 days
curl -X POST http://localhost:3001/api/tts/cache/clear \
  -H "Content-Type: application/json" \
  -d '{"daysOld": 30}'
```

Using utilities directly:
```typescript
import { clearCache, clearOldCache } from '@/lib/audio-cache'

// Clear all
clearCache()

// Clear old files
clearOldCache(30) // Delete files older than 30 days
```

## Git Ignore

Cached audio files are excluded from version control:

`.gitignore`:
```
# TTS audio cache
/public/audio/tts/*.mp3
```

Only the README is tracked in the repository.

## Testing

### Test TTS Generation

1. Visit: http://localhost:3001/test/tts
2. Enter text and click "Generate Speech"
3. First request: Check console for "MISS" (new generation)
4. Same text again: Check console for "HIT" (from cache)
5. Verify file exists in `public/audio/tts/`

### Check Cache Stats

```bash
curl http://localhost:3001/api/tts/cache/stats | jq
```

## Performance

### Benefits

- **First request**: ~2-3 seconds (API call + caching)
- **Cached requests**: ~50-100ms (file serving)
- **Bandwidth**: Files cached by browser (immutable)

### Storage

- Average audio file: ~30-50 KB per word
- 1000 cached words: ~30-50 MB
- Served directly from public directory (fast)

## Monitoring

### Server Logs

Look for these log messages:

```
✅ [Volcengine TTS] Serving from cache: hello world
💾 [Audio Cache] Saved to cache: {text, cacheKey, size}
🗑️ [Audio Cache] Deleted old file: a1b2c3d4...mp3
```

### Cache Hit Rate

Monitor `X-Cache-Status` response header:
- `HIT`: Served from cache (fast)
- `MISS`: Newly generated (slower)

## Troubleshooting

### Issue: Cache not working

Check:
1. Directory exists: `public/audio/tts/`
2. Write permissions on directory
3. Server logs for errors
4. `X-Cache-Status` header in response

### Issue: Files not being cached

Check:
1. Environment variables set correctly
2. Volcengine API responding successfully
3. Disk space available
4. No errors in server logs

### Issue: Old files filling up disk

Solution:
```typescript
// Run periodically (e.g., daily cron)
import { clearOldCache } from '@/lib/audio-cache'
clearOldCache(30) // Delete files older than 30 days
```

## Future Enhancements

- [ ] Automatic cache warming for common vocabulary words
- [ ] CDN integration for distributed caching
- [ ] Pre-generate audio for all vocabulary words
- [ ] Implement max cache size with LRU eviction
- [ ] Add cache analytics dashboard
- [ ] Support multiple voice types in same cache
- [ ] Compression for cached audio files
