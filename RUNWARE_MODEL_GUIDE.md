# Runware Model Configuration Guide

## Current Status ✅

**System is now working** with model: `runware:100@1`

The picture generation feature is fully operational and generating images successfully.

## What Happened

### Issue with FLUX.2 [dev]

When we tried to use `FLUX.2 [dev]` as the model identifier, Runware returned this error:

```
Invalid value for 'model' parameter.
Model must be an string value representing a valid AIR identifier.
```

### Finding: Model Identifier Format

Runware uses **AIR (Artificial Intelligence Runtime) identifiers** in this format:

```
name:id@version
```

Examples:
- `runware:100@1` ✅ (currently used)
- `memories:1@1` (for image captioning)
- `elevenlabs:1@1` (for audio)

The string `FLUX.2 [dev]` is **not** a valid AIR identifier.

## Available FLUX Models on Runware

According to Runware's website, they offer these FLUX models:

1. **FLUX.2 [klein] 9B** - 4-step distilled, sub-second inference
2. **FLUX.2 [klein] 4B** - Ultra-low latency variant
3. **FLUX.2 [klein] 9B Base** - Undistilled foundation model
4. **FLUX.2 [klein] 4B Base** - Compact model for local deployment

**Note**: FLUX.2 [dev] is **not listed** on Runware. They offer FLUX.2 [klein] variants instead.

## How to Find the Correct Model Identifier

Unfortunately, the Runware SDK's `modelSearch()` function doesn't return AIR identifiers for most models. To find the correct identifier for FLUX.2 [klein]:

### Option 1: Check Runware Dashboard (Recommended)

1. Log into https://my.runware.ai/
2. Navigate to the **Models** section
3. Look for **FLUX.2 [klein]** models
4. The AIR identifier should be displayed (format: `name:id@version`)

### Option 2: Contact Runware Support

- Email: support@runware.ai
- Ask for the AIR identifier for FLUX.2 [klein] 9B

### Option 3: Test Common Identifiers

I've created a test script you can run:

```bash
RUNWARE_API_KEY='your-key' node scripts/test-model-ids.js
```

This will test common identifier patterns like:
- `flux:1@1`
- `flux:2@1`
- `flux-klein:1@1`
- `klein:1@1`

## OpenAI Description Flow ✅

**Confirmed working**: The OpenAI-generated description IS being passed correctly to Runware.

The flow:
```
1. User clicks "Generate"
   ↓
2. OpenAI generates kid-friendly description
   ↓
3. Description saved to database
   ↓
4. Description sent to Runware SDK
   ↓
5. Runware generates image using the description
   ↓
6. Image URL returned and displayed
```

Console logs show:
```
Generating image with Runware SDK...
Model: runware:100@1
Description from OpenAI: [full description text]
```

## Current Configuration

**File**: `lib/runware-image-generation.ts:39`

```typescript
model = 'google:4@2', // Current model (updated 2026-02-15)
```

### Model History

- `runware:100@1` - Initial working model
- `runware:400@1` - Second model (2026-02-15)
- `google:4@2` - **Current** (updated 2026-02-15)

## How to Change the Model

Once you find the correct AIR identifier for FLUX.2 [klein], update this line:

```typescript
model = 'your-flux-identifier', // e.g., 'flux:2@1' or 'klein:1@1'
```

Then rebuild and deploy:
```bash
npm run build
./deploy-remote.sh
```

## Testing the Feature

1. Log into your site
2. Go to any vocabulary word page
3. Click "Generate" in the Memory Picture section
4. Check server logs (pm2 logs midssat):
   ```
   Model: runware:100@1
   Description from OpenAI: [description]
   Generated image for "[word]": https://im.runware.ai/...
   ```

## What Model is `runware:100@1`?

This appears to be Runware's curated default model. Without access to their documentation, the exact model details are unknown, but it:
- ✅ Generates high-quality images
- ✅ Works reliably
- ✅ Produces kid-friendly educational content
- ✅ Handles the OpenAI descriptions well

## Next Steps

If you want to use FLUX.2 [klein] specifically:

1. Check your Runware dashboard for the AIR identifier
2. Update the model in `lib/runware-image-generation.ts:39`
3. Rebuild and deploy
4. Test the generation

## Scripts Created

I've created helper scripts in the `scripts/` directory:

- `find-flux-model.js` - Search for FLUX models
- `find-klein-model.js` - Search for FLUX.2 [klein] models
- `test-model-ids.js` - Test different model identifiers

## Summary

- ✅ System is working with `runware:100@1`
- ✅ OpenAI descriptions are being sent correctly to Runware
- ✅ Images are generating successfully
- ⚠️ FLUX.2 [dev] doesn't exist on Runware (they have FLUX.2 [klein])
- 📋 Need to find the AIR identifier for FLUX.2 [klein] from Runware dashboard
