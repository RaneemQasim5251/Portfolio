import type { NextApiRequest, NextApiResponse } from 'next'
import * as sdk from 'microsoft-cognitiveservices-speech-sdk'

const AZURE_SPEECH_KEY = process.env.AZURE_SPEECH_KEY
const AZURE_SPEECH_REGION = process.env.AZURE_SPEECH_REGION
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second

interface VoiceConfig {
  name: string
  style: string
}

interface VoiceConfigs {
  ar: VoiceConfig
  en: VoiceConfig
}

// Voice configurations
const VOICE_CONFIGS: VoiceConfigs = {
  ar: {
    name: 'ar-AE-FatimaNeural',
    style: 'friendly'
  },
  en: {
    name: 'en-US-JennyNeural',
    style: 'friendly'
  }
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const synthesizeSpeech = async (
  speechConfig: sdk.SpeechConfig,
  ssml: string,
  retryCount = 0
): Promise<Buffer> => {
  try {
    const synthesizer = new sdk.SpeechSynthesizer(speechConfig)
    
    const result = await new Promise<sdk.SpeechSynthesisResult>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        synthesizer.close()
        reject(new Error('Synthesis timeout'))
      }, 15000) // 15 seconds timeout

      synthesizer.speakSsmlAsync(
        ssml,
        (result: sdk.SpeechSynthesisResult) => {
          clearTimeout(timeoutId)
          resolve(result)
        },
        (error: string) => {
          clearTimeout(timeoutId)
          reject(new Error(error))
        }
      )
    })

    synthesizer.close()
    return Buffer.from(result.audioData)
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      console.log(`TTS attempt ${retryCount + 1} failed, retrying...`)
      await delay(RETRY_DELAY * (retryCount + 1))
      return synthesizeSpeech(speechConfig, ssml, retryCount + 1)
    }
    throw error
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { text, language = 'ar' } = req.body

    if (!text) {
      return res.status(400).json({ error: 'Text is required' })
    }

    if (!AZURE_SPEECH_KEY || !AZURE_SPEECH_REGION) {
      return res.status(500).json({ error: 'Azure Speech Service not configured' })
    }

    // Select voice based on language
    const voiceConfig = VOICE_CONFIGS[language as keyof VoiceConfigs] || VOICE_CONFIGS.ar

    // Create the SSML string
    const ssml = `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${language}">
        <voice name="${voiceConfig.name}">
          <prosody rate="0%" pitch="0%">
            <mstts:express-as style="${voiceConfig.style}" xmlns:mstts="http://www.w3.org/2001/mstts">
              ${text}
            </mstts:express-as>
          </prosody>
        </voice>
      </speak>
    `

    console.log(`Generating TTS: ${text.substring(0, 50)}... (${language}, voice: ${voiceConfig.name})`)

    // Create the speech synthesizer with custom configuration
    const speechConfig = sdk.SpeechConfig.fromSubscription(AZURE_SPEECH_KEY, AZURE_SPEECH_REGION)
    speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3
    
    // Set proxy if needed (for environments behind proxy)
    if (process.env.HTTPS_PROXY) {
      const proxyUrl = new URL(process.env.HTTPS_PROXY)
      speechConfig.setProxy(proxyUrl.hostname, parseInt(proxyUrl.port), '', '') // Use empty strings for username and password
    }

    const audioData = await synthesizeSpeech(speechConfig, ssml)

    // Set appropriate headers for audio streaming
    res.setHeader('Content-Type', 'audio/mpeg')
    res.setHeader('Content-Length', audioData.byteLength)
    res.setHeader('Cache-Control', 'public, max-age=3600') // Cache for 1 hour
    res.setHeader('Access-Control-Allow-Origin', '*')
    
    res.status(200).send(audioData)
  } catch (error) {
    console.error('TTS error:', error)
    res.status(500).json({ error: 'Failed to generate speech. Please try again.' })
  }
} 