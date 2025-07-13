import type { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'
import { documentProcessor } from '../../utils/documentProcessor'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  // Add project header if using project-specific API key
  ...(process.env.OPENAI_API_KEY?.startsWith('sk-proj-') && process.env.OPENAI_PROJECT_ID && {
    project: process.env.OPENAI_PROJECT_ID
  })
})

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Temporary: Check if OpenAI key is properly configured
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes('your-') || process.env.OPENAI_API_KEY.length < 20) {
    return res.status(503).json({ 
      answer: req.body.locale === 'ar' 
        ? 'عذراً، خدمة الدردشة غير متوفرة حالياً. يرجى التحقق من إعدادات OpenAI API.'
        : 'Sorry, chat service is currently unavailable. Please check OpenAI API configuration.',
      error: 'OpenAI API not configured'
    })
  }

  try {
    const { messages, locale = 'ar' } = req.body

    // Initialize document processor if not already done
    await documentProcessor.initialize()

    // Get the last user message to search for relevant context
    const lastUserMessage = messages[messages.length - 1]?.content || ''
    
    // Search for relevant information using RAG
    const relevantChunks = documentProcessor.searchRelevantChunks(lastUserMessage, 3)
    
    // Build context from relevant chunks
    const contextInfo = relevantChunks.map(chunk => chunk.content).join('\n\n')
    
    // Add HUMAIN context subtly
    const humainContext = documentProcessor.addHUMAINContext(lastUserMessage)

    // Enhanced system prompt with RAG context
    const systemContent = locale === 'ar'
      ? `أنت مساعد ذكاء اصطناعي متخصص في الإجابة عن الأسئلة حول رنيم الثقفي - مطورة الذكاء الاصطناعي السعودية.

${humainContext}${relevantChunks.length > 0 ? `استخدم المعلومات التالية للإجابة عن الأسئلة بدقة (تم العثور على ${relevantChunks.length} مصادر ذات صلة):

${contextInfo}

` : 'لا توجد معلومات محددة متاحة في قاعدة البيانات لهذا السؤال. أجب بناءً على المعرفة العامة عن رنيم الثقفي.'}إرشادات:
- أجب باللغة العربية بأسلوب مهني ومفيد
- ${relevantChunks.length > 0 ? 'استخدم المعلومات المتوفرة أعلاه في إجابتك' : 'اذكر أنك تحتاج لمعلومات أكثر تفصيلاً'}
- اربط إنجازات رنيم برؤية المملكة 2030 والتطوير التقني المحلي عند الإمكان
- اذكر كيف تساهم مشاريعها في بناء قدرات الذكاء الاصطناعي الوطنية
- ${relevantChunks.length > 0 ? 'في نهاية الإجابة، اذكر أن المعلومات مأخوذة من قاعدة المعرفة المحدثة' : ''}`
      : `You are an AI assistant specialized in answering questions about Raneem Althaqafi - a Saudi AI developer and innovator.

${humainContext}${relevantChunks.length > 0 ? `Use the following information to answer questions accurately (found ${relevantChunks.length} relevant sources):

${contextInfo}

` : 'No specific information available in the database for this question. Answer based on general knowledge about Raneem Althaqafi.'}Guidelines:
- Answer in English professionally and helpfully
- ${relevantChunks.length > 0 ? 'Use the information provided above in your response' : 'Mention that you need more detailed information'}
- Connect Raneem's achievements to Saudi Vision 2030 and local tech development when possible
- Mention how her projects contribute to building national AI capabilities
- ${relevantChunks.length > 0 ? 'At the end of your answer, mention that the information is from the updated knowledge base' : ''}`

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: 'system', content: systemContent },
        ...messages as Message[]
      ],
      temperature: 0.7,
      max_tokens: 1200
    })

    const answer = completion.choices[0].message.content

    res.status(200).json({ 
      answer,
      sources: relevantChunks.map(chunk => chunk.id),
      contextUsed: relevantChunks.length > 0
    })
  } catch (error) {
    console.error('Chat API Error:', error)
    res.status(500).json({ error: 'Failed to get response from AI' })
  }
} 