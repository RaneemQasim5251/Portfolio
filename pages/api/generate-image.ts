import type { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  // Add project header if using project-specific API key
  ...(process.env.OPENAI_API_KEY?.startsWith('sk-proj-') && process.env.OPENAI_PROJECT_ID && {
    project: process.env.OPENAI_PROJECT_ID
  })
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { verse } = req.body

    if (!verse) {
      return res.status(400).json({ error: 'Verse is required' })
    }

    // First, translate and interpret the verse using GPT-4
    const interpretation = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a poetic interpreter. Translate the given Arabic verse to English and create a detailed visual description that captures its essence and imagery. Focus on visual elements that could be used to generate art.'
        },
        {
          role: 'user',
          content: verse
        }
      ],
      temperature: 0.7,
      max_tokens: 300
    })

    const visualDescription = interpretation.choices[0].message.content

    // Then, generate an image based on the interpretation
    const imageResponse = await openai.images.generate({
      model: 'dall-e-3',
      prompt: `Create an artistic interpretation of this poetic description: ${visualDescription}. Style: elegant, royal, with deep reds and golds, Arabic calligraphic influence.`,
      n: 1,
      size: '1024x1024',
      quality: 'standard'
    })

    if (!imageResponse.data?.[0]?.url) {
      throw new Error('No image URL in response')
    }

    res.status(200).json({ imageUrl: imageResponse.data[0].url })
  } catch (error) {
    console.error('Image generation error:', error)
    res.status(500).json({ error: 'Failed to generate image' })
  }
}