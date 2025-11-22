import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const { question, correctAnswer, userAnswer, wordInfo } = await request.json()

    console.log('💡 [Answer Explanation] Request received:', {
      question: question?.substring(0, 50) + '...',
      correctAnswer,
      userAnswer,
      timestamp: new Date().toISOString()
    })

    if (!question || !correctAnswer) {
      console.warn('⚠️ [Answer Explanation] Missing required parameters')
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

    const prompt = `A student is working on a sentence completion question and needs help understanding why the correct answer makes sense.

Question: ${question}

Correct Answer: ${correctAnswer}
${userAnswer ? `Student's Answer: ${userAnswer}` : ''}${wordContext}

Please provide a clear, helpful explanation for a middle school student (10-14 years old) that:
1. Explains why "${correctAnswer}" is the best choice for this sentence
2. Breaks down the meaning of the sentence and how "${correctAnswer}" fits the context
3. ${userAnswer && userAnswer !== correctAnswer ? `Briefly explains why "${userAnswer}" doesn't work as well` : ''}
4. Uses simple language and examples if helpful
5. Keeps it concise (3-5 sentences maximum)

Focus on making it easy to understand and educational.`

    console.log('🤖 [Answer Explanation] Calling OpenAI API...')
    const apiStartTime = Date.now()

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful, patient teacher explaining vocabulary and sentence completion to middle school students. Your explanations are clear, educational, and age-appropriate. Always focus on helping students understand WHY an answer is correct, not just THAT it is correct.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 300,
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
      explanationLength: explanation.length,
      preview: explanation.substring(0, 100) + '...',
      apiDuration: `${apiDuration}ms`,
      totalDuration: `${totalDuration}ms`,
      model: 'gpt-4o-mini',
      tokensUsed: completion.usage?.total_tokens || 'N/A'
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
