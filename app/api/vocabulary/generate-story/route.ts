import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { loadVocabularyWords, type VocabularyLevel } from '@/lib/vocabulary-levels'
import { getStorySubtypeById } from '@/lib/story-types'
import { createClient } from '@/lib/supabase'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const { levels, letters, difficulties, wordsPerLevel, storyLength, storyType, storySubtype, userId, words, specificWords } = await request.json()

    console.log('📚 [Story Generation] Request received:', {
      levels,
      letters,
      difficulties,
      wordsPerLevel,
      storyLength,
      storyType,
      storySubtype,
      userId: userId ? userId.substring(0, 8) + '...' : 'anonymous',
      useExistingWords: !!words,
      useSpecificWords: !!specificWords,
      timestamp: new Date().toISOString()
    })

    // Default values
    const wordsToUsePerLevel = wordsPerLevel || 3
    const targetLength = storyLength || 'medium' // short, medium, long

    // Maximum words allowed per story length
    const MAX_WORDS_BY_LENGTH: Record<string, number> = {
      short: 10,
      medium: 20,
      long: 40,
    }

    // If words are provided, use them directly (for regenerating with same words)
    let selectedWords: { word: string; level: VocabularyLevel; meaning: string }[] = []

    if (words && Array.isArray(words) && words.length > 0) {
      // Use the provided words directly (full word objects)
      selectedWords = words.map((w: any) => ({
        word: w.word,
        level: w.level as VocabularyLevel,
        meaning: w.meaning || ''
      }))
      console.log('📝 [Story Generation] Using provided words:', selectedWords.map(w => w.word).join(', '))
    } else if (specificWords && Array.isArray(specificWords) && specificWords.length > 0) {
      // User manually selected specific words by name
      // Load all words from all levels to find the selected ones
      const allLevels = levels || ['SSAT', '7', '8', '9', '10', '11', '12']
      const allWords = loadVocabularyWords(allLevels as VocabularyLevel[])

      // Find the full word data for each selected word
      specificWords.forEach((wordName: string) => {
        const wordData = allWords.find(w => w.word.toLowerCase() === wordName.toLowerCase())
        if (wordData) {
          selectedWords.push({
            word: wordData.word,
            level: wordData.level || 'SSAT',
            meaning: wordData.meanings[0] || ''
          })
        }
      })

      console.log('📝 [Story Generation] Using user-selected words:', selectedWords.map(w => w.word).join(', '))
    } else {
      // Validate input for new word selection
      if (!levels || !Array.isArray(levels) || levels.length === 0) {
        console.warn('⚠️ [Story Generation] Invalid or missing levels parameter')
        return NextResponse.json(
          { error: 'At least one difficulty level is required' },
          { status: 400 }
        )
      }

      // Validate word count limit
      const totalWords = levels.length * wordsToUsePerLevel
      const maxWords = MAX_WORDS_BY_LENGTH[targetLength] || 20

      if (totalWords > maxWords) {
        console.warn('⚠️ [Story Generation] Word count exceeds limit:', {
          totalWords,
          maxWords,
          storyLength: targetLength
        })
        return NextResponse.json(
          { error: `For ${targetLength} stories, you can use up to ${maxWords} vocabulary words. You selected ${totalWords} words. Please reduce the number of words per level or select fewer levels.` },
          { status: 400 }
        )
      }

      // Load words from all selected levels
      for (const level of levels) {
        let levelWords = loadVocabularyWords([level as VocabularyLevel])

        // Filter by alphabet if letters are specified
        if (letters && Array.isArray(letters) && letters.length > 0) {
          const upperLetters = letters.map((l: string) => l.toUpperCase())
          levelWords = levelWords.filter(word =>
            upperLetters.includes(word.word.charAt(0).toUpperCase())
          )
        }

        // Note: Difficulty filtering is handled client-side since it requires user authentication
        // The client can pass pre-filtered words if needed

        // Randomly select words from this level
        const shuffled = levelWords.sort(() => 0.5 - Math.random())
        const selected = shuffled.slice(0, wordsToUsePerLevel)

        selectedWords.push(...selected.map(w => ({
          word: w.word,
          level: level as VocabularyLevel,
          meaning: w.meanings[0] || ''
        })))
      }
    }

    // Validate word count for provided words
    if (selectedWords.length > 0) {
      const maxWords = MAX_WORDS_BY_LENGTH[targetLength] || 20
      if (selectedWords.length > maxWords) {
        console.warn('⚠️ [Story Generation] Provided words exceed limit:', {
          wordCount: selectedWords.length,
          maxWords,
          storyLength: targetLength
        })
        return NextResponse.json(
          { error: `For ${targetLength} stories, you can use up to ${maxWords} vocabulary words. You provided ${selectedWords.length} words.` },
          { status: 400 }
        )
      }
    }

    if (selectedWords.length === 0) {
      const errorMsg = letters && letters.length > 0
        ? `No words found starting with the selected letters (${letters.join(', ')}) in the chosen difficulty levels`
        : 'Unable to load words from selected levels'
      console.error('❌ [Story Generation] No words could be loaded:', errorMsg)
      return NextResponse.json(
        { error: errorMsg },
        { status: 400 }
      )
    }

    // Determine target word count for story
    const targetWordCount = targetLength === 'short' ? 500 : targetLength === 'long' ? 2000 : 1000

    // Get story subtype configuration
    const subtypeConfig = storyType && storySubtype
      ? getStorySubtypeById(storyType, storySubtype)
      : null

    // Create the prompt for story generation
    const wordsList = selectedWords.map(w => `- ${w.word} (${w.meaning})`).join('\n')

    let prompt = `You are a creative writer helping students learn vocabulary. Write an engaging, age-appropriate short story for 10-12 year old students that naturally incorporates ALL of these vocabulary words:

${wordsList}

Requirements:
- Story should be approximately ${targetWordCount} words long
- Use EVERY word from the list above in a natural, meaningful way
- Create a complex story structure with well-developed characters, vivid settings, and engaging dialogue
- Include clear character development, rising action, climax, and resolution
- Bold each vocabulary word when you use it (use **word** format)
- The story should flow naturally - don't force the words awkwardly
- Make the story fun, engaging, and appropriate for middle school students
- Add descriptive details and sensory language to bring the story to life
- Make it educational but highly entertaining`

    // Add story type-specific guidance if provided
    if (subtypeConfig) {
      prompt += `\n\nStory Type: ${subtypeConfig.label}
${subtypeConfig.prompt}`
    }

    prompt += '\n\nWrite ONLY the story, no title, no additional explanation.'

    console.log('🤖 [Story Generation] Calling OpenAI API...')
    console.log('📝 [Story Generation] Using words:', selectedWords.map(w => w.word).join(', '))
    const apiStartTime = Date.now()

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a creative educational writer who creates engaging, complex stories for middle school students to help them learn vocabulary words. You craft stories with rich character development, vivid descriptions, engaging dialogue, and compelling plots. You always incorporate all given vocabulary words naturally into your stories.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 3000,
    })

    const apiDuration = Date.now() - apiStartTime
    const story = completion.choices[0]?.message?.content?.trim()

    if (!story) {
      console.error('❌ [Story Generation] OpenAI returned empty response')
      throw new Error('Failed to generate story')
    }

    const totalDuration = Date.now() - startTime
    console.log('✅ [Story Generation] Success:', {
      levels,
      wordsUsed: selectedWords.length,
      storyLength: story.length,
      apiDuration: `${apiDuration}ms`,
      totalDuration: `${totalDuration}ms`,
      model: 'gpt-4o-mini',
      tokensUsed: completion.usage?.total_tokens || 'N/A'
    })

    // Save to history if user is logged in
    if (userId) {
      try {
        const supabase = createClient()
        const wordCount = story.split(/\s+/).length

        console.log('💾 [Story Generation] Attempting to save story to history for user:', userId.substring(0, 8) + '...')

        // Extract levels from selected words if levels array is not provided
        const levelsForHistory = levels && levels.length > 0
          ? levels
          : [...new Set(selectedWords.map(w => w.level))]

        const { data, error: insertError } = await supabase
          .from('story_generation_history')
          .insert({
            user_id: userId,
            story_text: story,
            words_used: selectedWords,
            story_length: targetLength,
            story_type: storyType || null,
            story_subtype: storySubtype || null,
            levels_selected: levelsForHistory,
            letters_filter: letters && letters.length > 0 ? letters : null,
            difficulties_filter: difficulties && difficulties.length > 0 ? difficulties : null,
            words_per_level: wordsToUsePerLevel,
            word_count: wordCount,
            generated_at: new Date().toISOString()
          })
          .select()

        if (insertError) {
          console.error('❌ [Story Generation] Supabase error saving to history:', {
            error: insertError.message,
            code: insertError.code,
            details: insertError.details,
            hint: insertError.hint
          })
        } else {
          console.log('✅ [Story Generation] Story saved to history successfully:', {
            id: data?.[0]?.id,
            storyType: storyType || 'none',
            storySubtype: storySubtype || 'none',
            wordCount,
            storyLength: targetLength
          })
        }
      } catch (historyError) {
        // Don't fail the request if history save fails
        console.error('❌ [Story Generation] Failed to save to history:', historyError)
      }
    } else {
      console.log('⚠️ [Story Generation] No userId provided, skipping history save')
    }

    return NextResponse.json({
      story,
      words: selectedWords,
      metadata: {
        levels,
        wordsUsed: selectedWords.length,
        generatedAt: new Date().toISOString()
      }
    })
  } catch (error) {
    const duration = Date.now() - startTime
    console.error('❌ [Story Generation] Error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: `${duration}ms`,
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { error: 'Failed to generate story' },
      { status: 500 }
    )
  }
}
