# Picture Generation Implementation Plan

## Architecture Overview

### Two-Step Image Generation System

**Step 1: AI Picture Description (OpenAI)**
- User clicks "Generate Picture" button on a word
- Send request to OpenAI GPT to describe an appropriate picture
- Save description to Supabase database

**Step 2: Image Generation (Runware.ai)**
- Use the saved description to generate actual image via Runware
- Save image URL to database
- Display image to user

---

## Implementation Details

### 1. Database Schema (Supabase)

```sql
CREATE TABLE word_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  word TEXT UNIQUE NOT NULL,
  definitions TEXT[] NOT NULL,
  part_of_speech TEXT,

  -- AI Generated Description
  picture_description TEXT,
  description_generated_at TIMESTAMP,

  -- Generated Image
  image_url TEXT,
  image_generated_at TIMESTAMP,
  image_provider TEXT DEFAULT 'runware',

  -- Metadata
  user_id TEXT, -- Track who requested it
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_word_images_word ON word_images(word);
CREATE INDEX idx_word_images_user_id ON word_images(user_id);
```

### 2. API Endpoints

#### Endpoint 1: Generate Picture Description
```
POST /api/vocabulary/generate-picture-description

Body: {
  word: string,
  definitions: string[],
  partOfSpeech?: string
}

Response: {
  success: boolean,
  description: string,
  word: string
}
```

#### Endpoint 2: Generate Actual Image
```
POST /api/vocabulary/generate-image-from-description

Body: {
  word: string,
  description: string
}

Response: {
  success: boolean,
  imageUrl: string,
  word: string
}
```

#### Endpoint 3: Get Word Image Status
```
GET /api/vocabulary/word-image?word={word}

Response: {
  exists: boolean,
  hasDescription: boolean,
  hasImage: boolean,
  description?: string,
  imageUrl?: string
}
```

### 3. OpenAI Prompt Template

```
Create a picture for the word "{WORD}" for kids to memorize the word.

The definition is:
1. {DEFINITION_1}
2. {DEFINITION_2}
...

Can you please describe a picture? The picture should be intuitive and no alien or any weird items or objects.
```

### 4. Component Updates

#### Add Button to `VocabularyWordCard.tsx`

```tsx
<Button
  onClick={() => handleGeneratePicture(word)}
  disabled={isGenerating}
>
  {hasImage ? "View Picture" : "Generate Picture"}
</Button>
```

#### Button States:
- **Not generated**: "Generate Picture" button
- **Generating description**: Loading spinner + "Describing..."
- **Description ready**: Auto-trigger image generation or show "Generate Image" button
- **Image generated**: Display image + "Regenerate" button

### 5. File Structure

```
/app/api/vocabulary/
  ├── generate-picture-description/
  │   └── route.ts                    # OpenAI description generation
  ├── generate-image-from-description/
  │   └── route.ts                    # Runware image generation
  └── word-image/
      └── route.ts                    # Get image status

/lib/
  ├── runware-image-generation.ts     # Runware service wrapper
  └── vocabulary-image-cache.ts       # Database operations for images

/components/vocabulary/
  └── VocabularyWordCard.tsx          # Add generate button
  └── PictureGenerationButton.tsx     # New component (optional)
```

### 6. User Flow

1. User views a vocabulary word card
2. Clicks "Generate Picture" button
3. **Step 1 (OpenAI)**:
   - Frontend shows "Generating description..."
   - Backend calls OpenAI with prompt
   - Extracts picture description
   - Saves to Supabase `word_images` table
   - Returns description to frontend
4. **Step 2 (Runware)**:
   - Automatically or manually triggered
   - Frontend shows "Creating image..."
   - Backend calls Runware with description
   - Saves image URL to Supabase
   - Returns image URL
5. Frontend displays the generated image
6. Image is cached - next time user sees this word, image loads immediately

### 7. Environment Variables Needed

```env
OPENAI_API_KEY=xxx              # Already exists
RUNWARE_API_KEY=xxx             # New - need to add
NEXT_PUBLIC_SUPABASE_URL=xxx    # Already exists
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx  # Already exists
```

---

## Benefits of This Approach

✅ **Quality Control**: OpenAI describes appropriate, educational images
✅ **Cost Effective**: Generate once, use forever (cached)
✅ **Kid-Friendly**: Prompt ensures no inappropriate content
✅ **Flexible**: Can regenerate if description isn't good
✅ **Traceable**: Save both description and image for debugging
✅ **Fast**: Subsequent loads are instant (cached in DB)

---

## Open Questions

1. **Automatic vs Manual Step 2**: After getting the description, should I:
   - **Option A**: Automatically generate the image (user waits for both steps)
   - **Option B**: Let user review description first, then click "Generate Image"

2. **Where to show the button**:
   - Word cards in browse lists?
   - Flashcards?
   - Word detail pages?
   - All of the above?

3. **Permissions**: Should only logged-in users generate images, or allow anyone?

4. **Rate Limiting**: Should I limit how many images a user can generate per day?

5. **Bulk Generation**: Want an admin tool to pre-generate images for all words?

---

## Example Flow

**Word**: "abundant"

**Definitions**:
1. existing or available in large quantities
2. plentiful

**OpenAI Response**:
> "A picture showing a large fruit tree with many ripe apples hanging from its branches. A child stands below with a basket, looking up happily at the plentiful fruit. The scene is bright and cheerful, showing abundance clearly."

→ Save to Supabase
→ Send to Runware
→ Get image URL
→ Display to user

---

## Next Steps

1. Get answers to open questions
2. Set up Runware.ai API key
3. Create database table in Supabase
4. Implement API endpoints
5. Create helper libraries
6. Update components with button
7. Test end-to-end flow
8. (Optional) Build admin bulk generation tool
