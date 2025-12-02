import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface GenerateSynonymRequest {
  word: string
  meaning?: string
  partOfSpeech?: string
  level?: string
  count?: number // Number of questions to generate
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateSynonymRequest = await request.json()
    const { word, meaning, partOfSpeech, level, count = 1 } = body

    if (!word) {
      return NextResponse.json(
        { error: 'Word is required' },
        { status: 400 }
      )
    }

    console.log(`[Generate Synonym] Generating ${count} synonym question(s) for word: ${word}`)

    // Build context for OpenAI
    let wordContext = `Word: ${word}`
    if (partOfSpeech) wordContext += `\nPart of Speech: ${partOfSpeech}`
    if (meaning) wordContext += `\nMeaning: ${meaning}`
    if (level) wordContext += `\nDifficulty Level: ${level}`

    const prompt = `You are an expert SSAT test question writer. Generate ${count} high-quality synonym question(s) for the SSAT Middle Level test.

${wordContext}

For each question, you must:
1. Create a clear question asking for the best synonym
2. Provide exactly 5 answer choices (A-E)
3. Make sure ONE answer is clearly the best synonym
4. Make the other 4 options plausible but incorrect (use related words, antonyms, or words in similar contexts)
5. Ensure all options are appropriate for middle school students
6. Add a brief explanation of why the correct answer is the best synonym

Return a JSON array with ${count} question object(s). Each object must have this EXACT structure:
{
  "question": "Which word is the best synonym for [WORD]?",
  "originalWord": "${word}",
  "options": ["option1", "option2", "option3", "option4", "option5"],
  "answer": "the correct option from the list above",
  "explanation": "Brief explanation of why this is the correct synonym"
}

IMPORTANT RULES:
- The "answer" field must contain the EXACT text of one of the options
- All 5 options must be single words or short phrases (2-3 words max)
- Options should be in alphabetical order
- Make the distractors (wrong answers) challenging but clearly distinguishable from the correct answer
- Avoid overly obscure or archaic words

Return ONLY the JSON array, no other text.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert SSAT test question writer. You create high-quality, educationally valuable synonym questions for middle school students. You always return valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8, // Some creativity for varied questions
      max_tokens: 1500,
    })

    const responseText = completion.choices[0]?.message?.content?.trim()

    if (!responseText) {
      throw new Error('No response from OpenAI')
    }

    console.log('[Generate Synonym] OpenAI response:', responseText.substring(0, 200) + '...')

    // Strip markdown code blocks if present (OpenAI sometimes wraps JSON in ```json ... ```)
    let cleanedText = responseText.trim()
    if (cleanedText.startsWith('```')) {
      // Remove opening ```json or ``` and closing ```
      cleanedText = cleanedText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
    }

    // Parse the JSON response
    let questions
    try {
      questions = JSON.parse(cleanedText)
    } catch (parseError) {
      console.error('[Generate Synonym] Failed to parse JSON:', cleanedText)
      throw new Error('Invalid JSON response from OpenAI')
    }

    // Ensure it's an array
    if (!Array.isArray(questions)) {
      questions = [questions]
    }

    // Validate and format each question
    const formattedQuestions = questions.map((q: any, index: number) => {
      if (!q.originalWord || !q.question || !q.options || !q.answer) {
        throw new Error(`Question ${index + 1} is missing required fields`)
      }

      if (!Array.isArray(q.options) || q.options.length !== 5) {
        throw new Error(`Question ${index + 1} must have exactly 5 options`)
      }

      if (!q.options.includes(q.answer)) {
        throw new Error(`Question ${index + 1}: answer "${q.answer}" not found in options`)
      }

      return {
        id: `generated-synonym-${word.toLowerCase()}-${Date.now()}-${index}`,
        question: q.question,
        originalWord: q.originalWord,
        options: q.options,
        answer: q.answer,
        explanation: q.explanation || '',
        questionType: 'SYNONYM',
        testNumber: 0, // Generated question
        sectionName: 'Generated',
      }
    })

    console.log(`[Generate Synonym] Successfully generated ${formattedQuestions.length} question(s)`)

    return NextResponse.json({
      success: true,
      questions: formattedQuestions,
      count: formattedQuestions.length,
    })
  } catch (error: any) {
    console.error('[Generate Synonym] Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate synonym questions',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
