# Audio Cache Directory

This directory stores cached TTS audio files generated on-demand.

## Structure
- Files are named using MD5 hash of the text content
- Format: {hash}.mp3

## Cache Management
- Files are automatically generated when requested
- Cached files are reused on subsequent requests
- See lib/audio-cache.ts for cache utilities

