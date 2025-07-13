import type { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'
import formidable from 'formidable'
import fs from 'fs'

export const config = {
  api: {
    bodyParser: false,
  },
}

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
    const form = formidable({})
    const [fields, files] = await form.parse(req)
    const audioFile = files.audio?.[0]

    if (!audioFile) {
      return res.status(400).json({ error: 'Audio file is required' })
    }

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(audioFile.filepath),
      model: 'whisper-1',
      language: 'ar',
      response_format: 'text',
    })

    // Clean up the temporary file
    fs.unlinkSync(audioFile.filepath)

    res.status(200).json({ text: transcription })
  } catch (error) {
    console.error('STT error:', error)
    res.status(500).json({ error: 'Failed to transcribe audio' })
  }
} 