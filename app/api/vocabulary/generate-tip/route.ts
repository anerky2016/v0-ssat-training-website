import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { word, definition, partOfSpeech } = await request.json()

    if (!word) {
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

    const tip = completion.choices[0]?.message?.content?.trim()

    if (!tip) {
      throw new Error('Failed to generate memory tip')
    }

    return NextResponse.json({ tip })
  } catch (error) {
    console.error('Error generating memory tip:', error)
    return NextResponse.json(
      { error: 'Failed to generate memory tip' },
      { status: 500 }
    )
  }
}
