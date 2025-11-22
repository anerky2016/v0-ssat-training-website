import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Parse request body
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      console.error('❌ [Answer Explanation] Failed to parse request body:', parseError)
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    const { question, correctAnswer, allOptions, userAnswer, wordInfo, isRegeneration, previousExplanation } = body

    console.log('💡 [Answer Explanation] Request received:', {
      question: question?.substring(0, 50) + '...',
      correctAnswer,
      optionsCount: allOptions?.length || 0,
      userAnswer,
      hasWordInfo: !!wordInfo,
      isRegeneration: isRegeneration || false,
      hasPreviousExplanation: !!previousExplanation,
      timestamp: new Date().toISOString()
    })

    if (!question || !correctAnswer) {
      console.warn('⚠️ [Answer Explanation] Missing required parameters:', {
        hasQuestion: !!question,
        hasCorrectAnswer: !!correctAnswer
      })
      return NextResponse.json(
        { error: 'Question and correct answer are required' },
        { status: 400 }
      )
    }

    // Build context about the word if available
    let wordContext = ''
    if (wordInfo && wordInfo.exists) {
      wordContext = `\n\nWord Information:
- Word: ${wordInfo.word}
- Pronunciation: ${wordInfo.pronunciation || 'N/A'}
- Part of Speech: ${wordInfo.partOfSpeech || 'N/A'}
- Definition: ${wordInfo.meaning || 'N/A'}`
    }

    // Add regeneration context if this is a retry
    let regenerationContext = ''
    if (isRegeneration && previousExplanation) {
      regenerationContext = `\n\nIMPORTANT: The student found the previous explanation unhelpful. Here's what you said before:
"${previousExplanation}"

Please provide a DIFFERENT explanation using:
- A different angle or perspective
- More concrete examples
- Simpler language
- Different teaching strategy (e.g., if you used definition first, try examples first)
- Focus on what might have been unclear in the previous explanation`
    }

    // Build options list for comparison
    const optionsList = allOptions && allOptions.length > 0
      ? `\n\nAll Answer Choices:\n${allOptions.map((opt: string, i: number) => `${String.fromCharCode(65 + i)}. ${opt}`).join('\n')}`
      : ''

    const prompt = `A student is working on a sentence completion question and needs to understand why one answer is BETTER than the others.${isRegeneration ? ' This is a REGENERATED explanation - provide a different approach.' : ''}

Question: ${question}
${optionsList}

Correct Answer: ${correctAnswer}
${userAnswer && userAnswer !== correctAnswer ? `Student's Wrong Answer: ${userAnswer}` : ''}${wordContext}${regenerationContext}

Provide a CONCISE, ACCURATE explanation (2-3 sentences max) for a middle school student that:
1. Explains why "${correctAnswer}" is the BEST fit for the sentence context
2. ${allOptions && allOptions.length > 1 ? `Briefly contrasts why the other choices don't work as well` : ''}
3. ${userAnswer && userAnswer !== correctAnswer ? `Specifically addresses why "${userAnswer}" is incorrect` : ''}
4. Uses simple, clear language
${isRegeneration ? '5. Uses a DIFFERENT teaching approach than before' : ''}

Keep it SHORT and FOCUSED. Quality over quantity.`

    console.log('🤖 [Answer Explanation] Calling OpenAI API...')
    const apiStartTime = Date.now()

    const completion = await openai.chat.completions.create({
      model: 'gpt-5.1', // Using OpenAI's latest GPT-5.1 model with advanced reasoning
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      // GPT-5.1 supports adaptive reasoning and multimodal capabilities
    })

    const apiDuration = Date.now() - apiStartTime
    const explanation = completion.choices[0]?.message?.content?.trim()

    if (!explanation) {
      console.error('❌ [Answer Explanation] OpenAI returned empty response')
      throw new Error('Failed to generate explanation')
    }

    const totalDuration = Date.now() - startTime
    console.log('✅ [Answer Explanation] Success:', {
      correctAnswer,
      isRegeneration: isRegeneration || false,
      explanationLength: explanation.length,
      preview: explanation.substring(0, 100) + '...',
      apiDuration: `${apiDuration}ms`,
      totalDuration: `${totalDuration}ms`,
      model: 'gpt-5.1',
      tokensUsed: completion.usage?.total_tokens || 'N/A',
      reasoningTokens: completion.usage?.completion_tokens_details?.reasoning_tokens || 'N/A'
    })

    return NextResponse.json({ explanation })
  } catch (error) {
    const duration = Date.now() - startTime
    console.error('❌ [Answer Explanation] Error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: `${duration}ms`,
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { error: 'Failed to generate explanation' },
      { status: 500 }
    )
  }
}
