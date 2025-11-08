import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const { word, definition, partOfSpeech } = await request.json()

    console.log('💡 [Tip Generation] Request received:', {
      word,
      definition: definition?.substring(0, 50) + (definition?.length > 50 ? '...' : ''),
      partOfSpeech,
      timestamp: new Date().toISOString()
    })

    if (!word) {
      console.warn('⚠️ [Tip Generation] Request missing word parameter')
      return NextResponse.json(
        { error: 'Word is required' },
        { status: 400 }
      )
    }

    // Generate memory tip using OpenAI
    const prompt = `Create a memorable, creative mnemonic tip to help a 10-12 year old student remember the word "${word}"${definition ? ` which means "${definition}"` : ''}${partOfSpeech ? ` (${partOfSpeech})` : ''}.

Requirements:
- Keep it SHORT (1-2 sentences max, under 150 characters)
- Make it FUN and ENGAGING for kids
- Use vivid imagery, sounds-like associations, or relatable scenarios
- Focus on helping them remember the MEANING
- Avoid being too complex or abstract
- Don't use the word in the tip itself

Examples of good tips:
- "Picture a playful puppy named Dally who loves to frolic around instead of doing its chores!"
- "Think of a superhero using a special shield to deflect lasers away from them!"
- "Imagine a wild party where everyone is jumping and laughing like they're on a rollercoaster of excitement!"

Generate ONE creative memory tip for "${word}":`

    console.log('🤖 [Tip Generation] Calling OpenAI API...')
    const apiStartTime = Date.now()

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a creative educational assistant helping students remember vocabulary words through memorable mnemonics. Always respond with ONLY the memory tip, no additional text or explanation.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.9,
      max_tokens: 100,
    })

    const apiDuration = Date.now() - apiStartTime
    const tip = completion.choices[0]?.message?.content?.trim()

    if (!tip) {
      console.error('❌ [Tip Generation] OpenAI returned empty response')
      throw new Error('Failed to generate memory tip')
    }

    const totalDuration = Date.now() - startTime
    console.log('✅ [Tip Generation] Success:', {
      word,
      tipLength: tip.length,
      tip: tip.substring(0, 100) + (tip.length > 100 ? '...' : ''),
      apiDuration: `${apiDuration}ms`,
      totalDuration: `${totalDuration}ms`,
      model: 'gpt-4o-mini',
      tokensUsed: completion.usage?.total_tokens || 'N/A'
    })

    return NextResponse.json({ tip })
  } catch (error) {
    const duration = Date.now() - startTime
    console.error('❌ [Tip Generation] Error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: `${duration}ms`,
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { error: 'Failed to generate memory tip' },
      { status: 500 }
    )
  }
}
