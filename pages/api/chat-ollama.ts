import type { NextApiRequest, NextApiResponse } from 'next'
import { documentProcessor } from '../../utils/documentProcessor'

// Advanced Offline RAG with Ollama Integration
// Inspired by DeepSeek R1 local processing approach

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface OllamaResponse {
  answer: string
  sources: string[]
  contextUsed: boolean
  mode: 'ollama-local'
  reasoning?: string
  processingTime: number
}

// Ollama API configuration
const OLLAMA_CONFIG = {
  baseUrl: 'http://localhost:11434',
  model: 'deepseek-r1:1.5b', // Fallback to llama3.2:1b if not available
  timeout: 30000
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<OllamaResponse | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const startTime = Date.now()

  try {
    const { messages, locale = 'ar', useReasoning = true } = req.body

    // Initialize document processor
    await documentProcessor.initialize()

    // Get the latest user message
    const lastUserMessage = messages[messages.length - 1]?.content || ''
    
    // Advanced RAG: Retrieve relevant context
    const relevantChunks = documentProcessor.searchRelevantChunks(lastUserMessage, 3)
    
    // Check if Ollama is available
    const isOllamaAvailable = await checkOllamaAvailability()
    
    if (!isOllamaAvailable) {
      // Fallback to enhanced local processing
      return handleFallbackResponse(lastUserMessage, relevantChunks, locale, startTime, res)
    }

    // Generate response using Ollama
    const response = await generateOllamaResponse(
      lastUserMessage,
      relevantChunks,
      locale,
      useReasoning
    )

    const processingTime = Date.now() - startTime

    res.status(200).json({
      answer: response.answer,
      sources: relevantChunks.map(chunk => chunk.id),
      contextUsed: relevantChunks.length > 0,
      mode: 'ollama-local',
      reasoning: response.reasoning,
      processingTime
    })

  } catch (error) {
    console.error('Ollama RAG Error:', error)
    
    // Fallback to local processing on error
    try {
      const fallbackMessages = req.body.messages || []
      const lastUserMessage = fallbackMessages[fallbackMessages.length - 1]?.content || ''
      const relevantChunks = documentProcessor.searchRelevantChunks(lastUserMessage, 3)
      return handleFallbackResponse(lastUserMessage, relevantChunks, req.body.locale || 'ar', startTime, res)
    } catch (fallbackError) {
      console.error('Fallback Error:', fallbackError)
      res.status(500).json({ error: 'Failed to generate response' })
    }
  }
}

async function checkOllamaAvailability(): Promise<boolean> {
  try {
    const response = await fetch(`${OLLAMA_CONFIG.baseUrl}/api/tags`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(5000)
    })
    return response.ok
  } catch (error) {
    console.log('Ollama not available, using fallback processing')
    return false
  }
}

async function generateOllamaResponse(
  query: string,
  chunks: any[],
  locale: string,
  useReasoning: boolean
): Promise<{ answer: string, reasoning?: string }> {
  const isArabic = locale === 'ar'
  
  // Prepare context from RAG chunks
  const context = chunks.length > 0 
    ? chunks.map(chunk => chunk.content).join('\n\n')
    : ''

  // Create enhanced prompt with RAG context
  const systemPrompt = isArabic 
    ? `أنت مساعد ذكي متخصص في الإجابة عن الأسئلة حول رنيم الثقفي - مطورة الذكاء الاصطناعي السعودية.

قواعد الإجابة:
- استخدم المعلومات المتوفرة في السياق أولاً
- أجب بشكل مختصر ومفيد (سطرين كحد أقصى)
- استخدم الرموز التعبيرية لجعل الإجابة أكثر تفاعلاً
- إذا لم تجد المعلومة في السياق، اعتمد على معرفتك العامة عن رنيم
- حافظ على الطابع الودود والمحادثة التفاعلية

السياق المتوفر:
${context}

السؤال: ${query}`
    : `You are an AI assistant specialized in answering questions about Raneem Althaqafi - Saudi AI developer.

Response Rules:
- Use the provided context information first
- Answer concisely and helpfully (max 2 lines)
- Use emojis to make responses more interactive
- If information isn't in context, rely on general knowledge about Raneem
- Maintain friendly and conversational tone

Available Context:
${context}

Question: ${query}`

  // Choose model based on availability and reasoning preference
  const modelToUse = useReasoning ? 'deepseek-r1:1.5b' : 'llama3.2:1b'
  
  try {
    const response = await fetch(`${OLLAMA_CONFIG.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: modelToUse,
        prompt: systemPrompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 200,
          stop: ['</think>'] // Stop at end of reasoning for R1 models
        }
      }),
      signal: AbortSignal.timeout(OLLAMA_CONFIG.timeout)
    })

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`)
    }

    const data = await response.json()
    let fullResponse = data.response || ''

    // Extract reasoning and answer for R1 models
    if (useReasoning && fullResponse.includes('<think>')) {
      const thinkMatch = fullResponse.match(/<think>([\s\S]*?)<\/think>/)
      const reasoning = thinkMatch ? thinkMatch[1].trim() : ''
      const answer = fullResponse.replace(/<think>[\s\S]*?<\/think>/, '').trim()
      
      return {
        answer: answer || fullResponse,
        reasoning: reasoning
      }
    }

    return {
      answer: fullResponse,
      reasoning: useReasoning ? 'Quick response mode - no reasoning trace' : undefined
    }

  } catch (error) {
    console.error('Ollama generation error:', error)
    throw error
  }
}

async function handleFallbackResponse(
  query: string,
  chunks: any[],
  locale: string,
  startTime: number,
  res: NextApiResponse
) {
  // Use the enhanced offline system from chat-offline.ts
  try {
    const { generateAdvancedResponse } = await import('./chat-offline')
    
    const response = await generateAdvancedResponse(
      query,
      'ollama-fallback',
      chunks,
      locale
    )
    
    const processingTime = Date.now() - startTime

    return res.status(200).json({
      answer: response,
      sources: chunks.map(chunk => chunk.id),
      contextUsed: chunks.length > 0,
      mode: 'ollama-local',
      reasoning: 'Enhanced fallback mode - using advanced offline processing',
      processingTime
    })
  } catch (error) {
    console.error('Enhanced fallback error:', error)
    // Final fallback to old system
    const isArabic = locale === 'ar'
    const fallbackResponse = generateAdvancedFallback(query, chunks, isArabic)
    const processingTime = Date.now() - startTime

    return res.status(200).json({
      answer: fallbackResponse,
      sources: chunks.map(chunk => chunk.id),
      contextUsed: chunks.length > 0,
      mode: 'ollama-local',
      reasoning: 'Basic fallback mode - using local processing',
      processingTime
    })
  }
}

function generateAdvancedFallback(query: string, chunks: any[], isArabic: boolean): string {
  const lowerQuery = query.toLowerCase()
  
  // Use RAG context if available
  if (chunks.length > 0) {
    const contextInfo = chunks[0].content
    
    // Project-specific intelligent responses
    if (containsKeywords(lowerQuery, ['سراج', 'siraj', 'مترو', 'metro'])) {
      return isArabic 
        ? '🚇 سراج: مساعد المترو الذكي باللغة العربية يستخدم NLP والرؤية الحاسوبية!\nيساعد ركاب مترو الرياض بتقديم إرشادات ذكية ومخصصة ✨'
        : '🚇 Siraj: Smart Arabic metro assistant using NLP and computer vision!\nHelps Riyadh Metro passengers with intelligent, personalized guidance ✨'
    }
    
    if (containsKeywords(lowerQuery, ['ناسا', 'nasa', 'pathfinders', 'فضاء'])) {
      return isArabic 
        ? '🚀 المركز الأول عالمياً في تحدي ناسا لحطام الفضاء!\nمشروع Pathfinders يستخدم الذكاء الاصطناعي لتنظيف الفضاء 🌌'
        : '🚀 First place globally in NASA Space Debris Challenge!\nPathfinders project uses AI to clean up space debris 🌌'
    }
    
    // Extract key information from context
    const firstSentence = contextInfo.split('.')[0]
    return isArabic 
      ? `💡 ${firstSentence}\n🤖 معلومة من قاعدة البيانات المحلية - اسأل المزيد!`
      : `💡 ${firstSentence}\n🤖 Info from local database - ask for more!`
  }
  
  // Fallback responses without context
  const fallbackResponses = isArabic ? [
    '🤖 أنا مساعد رنيم الذكي المحلي - اسأل عن مشاريعها وإنجازاتها!\n💫 أعمل بالكامل دون اتصال بالإنترنت لحماية خصوصيتك',
    '🧠 رنيم خبيرة في الذكاء الاصطناعي السيادي والحلول العربية!\n🎯 جرب سؤالاً محدداً عن مشاريعها أو فلسفتها التقنية',
    '🌟 رنيم من الطائف - مطورة ذكاء اصطناعي مبتكرة!\n🚀 فازت بالمركز الأول عالمياً في تحدي ناسا وطورت مشاريع مذهلة'
  ] : [
    '🤖 I\'m Raneem\'s local AI assistant - ask about her projects and achievements!\n💫 I work completely offline to protect your privacy',
    '🧠 Raneem is an expert in sovereign AI and Arabic solutions!\n🎯 Try a specific question about her projects or tech philosophy',
    '🌟 Raneem from Taif - innovative AI developer!\n🚀 Won first place globally in NASA challenge and developed amazing projects'
  ]
  
  return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]
}

function containsKeywords(text: string, keywords: string[]): boolean {
  return keywords.some(keyword => text.includes(keyword.toLowerCase()))
}

// Utility function to normalize Arabic text
function normalizeArabicText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[إأآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ي/g, 'ى')
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
} 