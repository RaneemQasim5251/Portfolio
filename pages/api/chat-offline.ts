import type { NextApiRequest, NextApiResponse } from 'next'
import { documentProcessor } from '../../utils/documentProcessor'

// Advanced Offline Conversational AI - Highly Interactive & Concise
// Designed to surprise users with local intelligence and engagement

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface OfflineResponse {
  answer: string
  sources: string[]
  contextUsed: boolean
  mode: 'offline'
}

// Advanced conversation memory and context tracking
let conversationMemory: { [sessionId: string]: ConversationSession } = {}

interface ConversationSession {
  history: Message[]
  userProfile: UserProfile
  interactionCount: number
  lastTopic: string
  engagementLevel: number
  preferredStyle: 'casual' | 'technical' | 'poetic'
}

interface UserProfile {
  interests: string[]
  questionPatterns: string[]
  responsePreferences: string[]
  engagementTriggers: string[]
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<OfflineResponse | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { messages, locale = 'ar', sessionId = 'default' } = req.body
    console.log('🔥 Advanced Chat Handler Started:', { locale, sessionId, messageCount: messages?.length })

    // Initialize document processor
    await documentProcessor.initialize()

    // Update conversation memory
    updateConversationMemory(sessionId, messages)

    // Get the latest user message
    const lastUserMessage = messages[messages.length - 1]?.content || ''
    console.log('📝 User Message:', lastUserMessage)
    
    // Advanced context search with user profiling
    const relevantChunks = await performAdvancedSearch(lastUserMessage, sessionId)
    console.log('🔍 Found chunks:', relevantChunks.length)
    
    // Generate highly interactive response
    console.log('🚀 Starting advanced response generation...')
    const response = await generateAdvancedResponse(
      lastUserMessage, 
      sessionId,
      relevantChunks, 
      locale
    )
    console.log('✅ Generated response:', response.substring(0, 100) + '...')

    res.status(200).json({
      answer: response,
      sources: relevantChunks.map(chunk => chunk.id),
      contextUsed: relevantChunks.length > 0,
      mode: 'offline'
    })
  } catch (error) {
    console.error('Advanced Offline Chat Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error details:', errorMessage)
    res.status(500).json({ error: 'Failed to generate response' })
  }
}

function updateConversationMemory(sessionId: string, messages: Message[]) {
  if (!conversationMemory[sessionId]) {
    conversationMemory[sessionId] = {
      history: [],
      userProfile: {
        interests: [],
        questionPatterns: [],
        responsePreferences: [],
        engagementTriggers: []
      },
      interactionCount: 0,
      lastTopic: '',
      engagementLevel: 0,
      preferredStyle: 'casual'
    }
  }
  
  const session = conversationMemory[sessionId]
  session.history = messages.slice(-10) // Keep last 10 messages
  session.interactionCount++
  
  // Analyze user patterns
  const lastUserMessage = messages[messages.length - 1]?.content || ''
  analyzeUserPatterns(session, lastUserMessage)
}

function analyzeUserPatterns(session: ConversationSession, message: string) {
  const lowerMessage = message.toLowerCase()
  
  // Detect interests
  const interests = ['ai', 'robotics', 'poetry', 'philosophy', 'technology', 'research', 'projects']
  interests.forEach(interest => {
    if (lowerMessage.includes(interest) && !session.userProfile.interests.includes(interest)) {
      session.userProfile.interests.push(interest)
    }
  })
  
  // Detect question patterns
  if (lowerMessage.includes('how') || lowerMessage.includes('كيف')) {
    session.userProfile.questionPatterns.push('how')
  }
  if (lowerMessage.includes('what') || lowerMessage.includes('ما') || lowerMessage.includes('ماذا')) {
    session.userProfile.questionPatterns.push('what')
  }
  if (lowerMessage.includes('why') || lowerMessage.includes('لماذا')) {
    session.userProfile.questionPatterns.push('why')
  }
  
  // Detect engagement triggers
  if (lowerMessage.includes('amazing') || lowerMessage.includes('wow') || lowerMessage.includes('رائع')) {
    session.engagementLevel++
    session.userProfile.engagementTriggers.push('positive')
  }
  
  // Detect preferred style
  if (lowerMessage.includes('technical') || lowerMessage.includes('تقني')) {
    session.preferredStyle = 'technical'
  } else if (lowerMessage.includes('poetry') || lowerMessage.includes('شعر')) {
    session.preferredStyle = 'poetic'
  }
}

async function performAdvancedSearch(query: string, sessionId: string): Promise<any[]> {
  const session = conversationMemory[sessionId]
  
  // Use conversation context to enhance search
  let enhancedQuery = query
  if (session?.userProfile.interests.length > 0) {
    enhancedQuery += ' ' + session.userProfile.interests.join(' ')
  }
  
  // Multi-pass search for comprehensive results
  const primaryResults = documentProcessor.searchRelevantChunks(enhancedQuery, 2)
  const contextualResults = documentProcessor.searchRelevantChunks(query, 1)
  
  // Combine and deduplicate
  const allResults = [...primaryResults, ...contextualResults]
  const uniqueResults = allResults.filter((chunk, index, self) => 
    index === self.findIndex(c => c.id === chunk.id)
  )
  
  return uniqueResults.slice(0, 3)
}

export async function generateAdvancedResponse(
  query: string, 
  sessionId: string,
  chunks: any[], 
  locale: string
): Promise<string> {
  // Auto-detect language from query content (more reliable than locale)
  const isArabic = detectArabicText(query) || locale === 'ar'
  
  // Ensure session exists
  if (!conversationMemory[sessionId]) {
    conversationMemory[sessionId] = {
      history: [],
      userProfile: {
        interests: [],
        questionPatterns: [],
        responsePreferences: [],
        engagementTriggers: []
      },
      interactionCount: 0,
      lastTopic: '',
      engagementLevel: 1,
      preferredStyle: 'casual'
    }
  }
  
  const session = conversationMemory[sessionId]
  
  // Analyze query intent with advanced NLP patterns
  const intent = analyzeQueryIntent(query, isArabic)
  const emotion = detectEmotionalContext(query, isArabic)
  const complexity = assessQueryComplexity(query)
  
  console.log(`Intent Detection: "${query}" -> Type: ${intent.type}, Subject: ${intent.subject}, Confidence: ${intent.confidence}`)
  
  // Generate response based on intent and context
  let response = ''
  
  switch (intent.type) {
    case 'greeting':
      response = generateSmartGreeting(session, isArabic)
      break
    case 'identity_inquiry':
      response = generateIdentityResponse(chunks, isArabic)
      break
    case 'contact_inquiry':
      response = generateContactResponse(isArabic)
      break
    case 'project_inquiry':
      response = generateProjectResponse(intent.subject || '', chunks, isArabic, complexity)
      break
    case 'projects_overview':
      response = generateProjectsOverview(chunks, isArabic)
      break
    case 'education_inquiry':
      response = generateEducationResponse(chunks, isArabic)
      break
    case 'skill_inquiry':
      response = generateSkillResponse(chunks, isArabic, session.preferredStyle)
      break
    case 'location_inquiry':
      response = generateLocationResponse(chunks, isArabic)
      break
    case 'philosophy_inquiry':
      response = generatePhilosophyResponse(chunks, isArabic, session.preferredStyle)
      break
    case 'achievement_inquiry':
      response = generateAchievementResponse(chunks, isArabic, complexity)
      break
    case 'research_inquiry':
      response = generateResearchResponse(chunks, isArabic)
      break
    case 'community_inquiry':
      response = generateCommunityResponse(chunks, isArabic)
      break
    case 'unique_fact':
      response = generateUniqueFact(chunks, isArabic)
      break
    case 'future_inquiry':
      response = generateFutureResponse(chunks, isArabic)
      break
    case 'confirmation_query':
      response = generateConfirmationResponse(isArabic)
      break
    case 'affirmative_response':
      response = generateAffirmativeResponse(isArabic)
      break
    case 'casual_chat':
      response = generateCasualResponse(query, chunks, isArabic, session)
      break
    case 'follow_up':
      response = generateContextualFollowUp(query, session, chunks, isArabic)
      break
    default:
      response = generateIntelligentFallback(query, chunks, isArabic, session)
  }
  
  // Keep responses short and focused for portfolio
  
  // Update session context
  session.lastTopic = intent.subject || extractTopicFromQuery(query)
  
  return response
}

function analyzeQueryIntent(query: string, isArabic: boolean): { type: string, subject?: string, confidence: number } {
  const lowerQuery = query.toLowerCase().trim()
  const normalizedQuery = normalizeText(query)
  
  // Greeting patterns - Enhanced detection
  if (containsKeywords(lowerQuery, ['مرحبا', 'أهلا', 'hello', 'hi', 'hey', 'سلام', 'تحية']) || 
      lowerQuery === 'سلام' || lowerQuery === 'hello' || 
      lowerQuery === 'hi' || lowerQuery === 'hey') {
    return { type: 'greeting', confidence: 0.9 }
  }
  
  // Contact/Personal info requests (should be handled carefully)
  if (containsKeywords(lowerQuery, ['إيميل', 'email', 'تلفون', 'phone', 'عنوان', 'address', 'تواصل', 'contact'])) {
    return { type: 'contact_inquiry', confidence: 0.95 }
  }
  
  // Who is Raneem - Identity questions (Enhanced and Fixed)
  if (containsKeywords(lowerQuery, ['من هي', 'who is', 'من رنيم', 'about raneem', 'tell me about', 'مين رنيم', 'مين هي', 'who is she']) ||
      lowerQuery === 'مين رنيم؟' || lowerQuery === 'مين رنيم' || lowerQuery === 'who is raneem' || 
      lowerQuery === 'من هي رنيم' || lowerQuery === 'من رنيم' || lowerQuery === 'who is she') {
    return { type: 'identity_inquiry', confidence: 0.95 }
  }
  
  // Project-specific patterns with enhanced detection
  if (containsKeywords(normalizedQuery, ['سراج', 'siraj', 'مترو', 'metro', 'مساعد مترو'])) {
    return { type: 'project_inquiry', subject: 'siraj', confidence: 0.95 }
  }
  if (containsKeywords(normalizedQuery, ['ناسا', 'nasa', 'pathfinders', 'فضاء', 'space', 'حطام'])) {
    return { type: 'project_inquiry', subject: 'nasa', confidence: 0.95 }
  }
  if (containsKeywords(normalizedQuery, ['ذراع', 'arm', 'bionic', 'robofest', 'روبوت', 'روبوتية'])) {
    return { type: 'project_inquiry', subject: 'bionic', confidence: 0.95 }
  }
  if (containsKeywords(normalizedQuery, ['أرامكو', 'aramco', 'خوذة', 'helmet', 'smart', 'ذكية'])) {
    return { type: 'project_inquiry', subject: 'aramco', confidence: 0.95 }
  }
  if (containsKeywords(normalizedQuery, ['bci', 'واجهة دماغ', 'brain', 'eeg', 'ألباب', 'الباب'])) {
    return { type: 'project_inquiry', subject: 'bci', confidence: 0.95 }
  }
  if (containsKeywords(normalizedQuery, ['شعر', 'poetry', 'فن', 'art', 'لوحة', 'painting'])) {
    return { type: 'project_inquiry', subject: 'poetry', confidence: 0.95 }
  }
  if (containsKeywords(normalizedQuery, ['milarity', 'قوات جوية', 'air force', 'عسكري', 'military'])) {
    return { type: 'project_inquiry', subject: 'military', confidence: 0.95 }
  }
  if (containsKeywords(normalizedQuery, ['liveness', 'كشف حيوية', 'وجه', 'face', 'biometric'])) {
    return { type: 'project_inquiry', subject: 'liveness', confidence: 0.95 }
  }
  
  // Projects overview - Enhanced detection
  if (containsKeywords(lowerQuery, ['مشاريع', 'projects', 'أعمال', 'works', 'ما عملت', 'what did', 'مشاريعها', 'وش مشاريعها']) ||
      lowerQuery === 'مشاريعها' || lowerQuery === 'projects' || lowerQuery === 'مشاريع رنيم' ||
      lowerQuery === 'وش مشاريعها؟' || lowerQuery === 'وش مشاريعها') {
    return { type: 'projects_overview', confidence: 0.9 }
  }
  
  // Education and background
  if (containsKeywords(lowerQuery, ['تعليم', 'education', 'دراسة', 'study', 'جامعة', 'university', 'شهادة', 'degree'])) {
    return { type: 'education_inquiry', confidence: 0.9 }
  }
  
  // Skills and expertise
  if (containsKeywords(lowerQuery, ['مهارات', 'skills', 'تقنيات', 'technologies', 'خبرات', 'expertise', 'programming', 'برمجة'])) {
    return { type: 'skill_inquiry', confidence: 0.9 }
  }
  
  // Location and personal background
  if (containsKeywords(lowerQuery, ['وين', 'where', 'مكان', 'location', 'مواليد', 'born', 'أصل', 'origin', 'طائف', 'taif'])) {
    return { type: 'location_inquiry', confidence: 0.9 }
  }
  
  // Philosophy and vision
  if (containsKeywords(lowerQuery, ['فلسفة', 'philosophy', 'رؤية', 'vision', 'منهج', 'approach', 'مبادئ', 'principles', 'إيقاع', 'rhythm'])) {
    return { type: 'philosophy_inquiry', confidence: 0.9 }
  }
  
  // Achievements and awards
  if (containsKeywords(lowerQuery, ['جوائز', 'awards', 'إنجازات', 'achievements', 'فوز', 'win', 'مراكز', 'positions', 'مركز أول', 'first place'])) {
    return { type: 'achievement_inquiry', confidence: 0.9 }
  }
  
  // Research interests
  if (containsKeywords(lowerQuery, ['بحث', 'research', 'اهتمامات', 'interests', 'مجالات', 'fields', 'تخصص', 'specialization'])) {
    return { type: 'research_inquiry', confidence: 0.9 }
  }
  
  // Community and involvement
  if (containsKeywords(lowerQuery, ['مجتمع', 'community', 'مشاركة', 'participation', 'تطوع', 'volunteer', 'مؤتمرات', 'conferences'])) {
    return { type: 'community_inquiry', confidence: 0.9 }
  }
  
  // Unique/interesting facts
  if (containsKeywords(lowerQuery, ['معلومة', 'fact', 'فريد', 'unique', 'مثير', 'interesting', 'مميز', 'special', 'غريب', 'unusual'])) {
    return { type: 'unique_fact', confidence: 0.9 }
  }
  
  // Future plans
  if (containsKeywords(lowerQuery, ['مستقبل', 'future', 'خطط', 'plans', 'هدف', 'goals', 'طموح', 'ambition'])) {
    return { type: 'future_inquiry', confidence: 0.9 }
  }
  
  // Confirmation queries (صدق؟, really?)
  if (lowerQuery === 'صدق؟' || lowerQuery === 'صدق' || lowerQuery === 'really?' || 
      lowerQuery === 'really' || lowerQuery === 'حقا؟' || lowerQuery === 'حقا') {
    return { type: 'confirmation_query', confidence: 0.9 }
  }
  
  // Affirmative responses (نعم, yes)
  if (lowerQuery === 'نعم' || lowerQuery === 'yes' || lowerQuery === 'أكيد' || lowerQuery === 'sure') {
    return { type: 'affirmative_response', confidence: 0.9 }
  }
  
  // Casual conversation patterns - Enhanced detection
  if (containsKeywords(lowerQuery, ['رائع', 'amazing', 'wow', 'شكرا', 'thanks', 'جميل', 'nice', 'cool', 'مذهل', 'incredible']) ||
      lowerQuery === 'وش؟' || lowerQuery === 'what!' || 
      lowerQuery === 'what?' || lowerQuery === 'ماذا؟' ||
      lowerQuery === 'test') {
    return { type: 'casual_chat', confidence: 0.8 }
  }
  
  // Follow-up patterns
  if (containsKeywords(lowerQuery, ['وماذا عن', 'what about', 'كيف', 'how', 'لماذا', 'why', 'متى', 'when', 'وين', 'where'])) {
    return { type: 'follow_up', confidence: 0.7 }
  }
  
  return { type: 'general_inquiry', confidence: 0.5 }
}

function detectEmotionalContext(query: string, isArabic: boolean): string {
  const lowerQuery = query.toLowerCase()
  
  if (containsKeywords(lowerQuery, ['رائع', 'amazing', 'wow', 'مذهل', 'incredible', 'fantastic'])) {
    return 'excited'
  }
  if (containsKeywords(lowerQuery, ['مثير', 'interesting', 'curious', 'فضول', 'wonder'])) {
    return 'curious'
  }
  if (containsKeywords(lowerQuery, ['شكرا', 'thanks', 'appreciate', 'grateful', 'ممتن'])) {
    return 'grateful'
  }
  if (containsKeywords(lowerQuery, ['help', 'مساعدة', 'assist', 'support', 'guide'])) {
    return 'seeking_help'
  }
  
  return 'neutral'
}

function assessQueryComplexity(query: string): 'simple' | 'medium' | 'complex' {
  const wordCount = query.split(' ').length
  const hasMultipleQuestions = (query.match(/\?/g) || []).length > 1
  const hasComplexTerms = containsKeywords(query.toLowerCase(), ['algorithm', 'architecture', 'implementation', 'methodology'])
  
  if (wordCount > 15 || hasMultipleQuestions || hasComplexTerms) {
    return 'complex'
  } else if (wordCount > 8) {
    return 'medium'
  }
  return 'simple'
}

function generateSmartGreeting(session: ConversationSession, isArabic: boolean): string {
  return isArabic ? 
    'مرحباً! اسأل عن رنيم وإنجازاتها 🤖' : 
    'Hello! Ask about Raneem and her achievements 🤖'
}

function generateProjectResponse(project: string, chunks: any[], isArabic: boolean, complexity: string): string {
  const projectData = {
    siraj: {
      ar: '🚇 سراج: مساعد المترو الذكي باللغة العربية',
      en: '🚇 Siraj: Smart Arabic metro assistant'
    },
    nasa: {
      ar: '🚀 المركز الأول عالمياً في تحدي ناسا لحطام الفضاء',
      en: '🚀 First place globally in NASA Space Debris Challenge'
    },
    bionic: {
      ar: '🦾 الذراع الروبوتية الذكية - المركز الثاني عالمياً في RoboFest',
      en: '🦾 Smart Bionic Arm - Second place globally in RoboFest'
    },
    aramco: {
      ar: '⛑️ الخوذة الذكية في أرامكو تراقب صحة العمال',
      en: '⛑️ Smart Helmet at Aramco monitors workers\' health'
    }
  }
  
  const data = projectData[project as keyof typeof projectData]
  if (data) {
    return data[isArabic ? 'ar' : 'en']
  }
  
  return isArabic ? 
    'مشروع مذهل من رنيم! 🌟' :
    'Amazing project by Raneem! 🌟'
}

function generateSkillResponse(chunks: any[], isArabic: boolean, style: string): string {
  const skillHighlights = isArabic ? [
    '💻 رنيم تتقن: Python, JavaScript, C++ وأطر العمل الحديثة!',
    '🧠 خبيرة في TensorFlow, PyTorch, React وتقنيات الذكاء الاصطناعي المتقدمة ⚡'
  ] : [
    '💻 Raneem masters: Python, JavaScript, C++ and modern frameworks!',
    '🧠 Expert in TensorFlow, PyTorch, React and advanced AI technologies ⚡'
  ]
  
  if (style === 'technical') {
    return skillHighlights.join('\n')
  } else if (style === 'poetic') {
    return isArabic ?
      '🎭 "في كل لغة برمجة قصيدة، وفي كل خوارزمية إيقاع"\nرنيم تنسج التقنية بحرفية الشاعر وعقل المهندس 🎨' :
      '🎭 "In every programming language a poem, in every algorithm a rhythm"\nRaneem weaves technology with a poet\'s craft and engineer\'s mind 🎨'
  }
  
  return skillHighlights.join('\n')
}

function generatePersonalResponse(chunks: any[], isArabic: boolean, emotion: string): string {
  const responses = isArabic ? {
    excited: ['🌟 رنيم من الطائف! بدأت رحلتها بتعلم C في معمل الحاسوب', 'تمزج بين الشعر والتقنية في فلسفة "اقسم الخلية العصبية وستسمع الإيقاع" 🎵'],
    curious: ['🤔 رنيم شخصية مبدعة تجمع بين الدقة التقنية والحس الفني', 'تؤمن بأن التقنية والفن مترابطان بشكل عميق 🎨'],
    neutral: ['👩‍💻 رنيم الثقفي من الطائف، مطورة ذكاء اصطناعي مبتكرة', 'تحب الشعر العربي وتؤمن بقوة الذكاء الاصطناعي السيادي 🇸🇦']
  } : {
    excited: ['🌟 Raneem from Taif! Started her journey learning C in computer lab', 'Blends poetry and tech in "Split the neuron and find the rhythm" philosophy 🎵'],
    curious: ['🤔 Raneem has a creative personality combining technical precision with artistic sense', 'Believes that technology and art are deeply interconnected 🎨'],
    neutral: ['👩‍💻 Raneem Althaqafi from Taif, innovative AI developer', 'Loves Arabic poetry and believes in sovereign AI power 🇸🇦']
  }
  
  const responseSet = responses[emotion as keyof typeof responses] || responses.neutral
  return responseSet[0] + '\n' + responseSet[1]
}

function generatePhilosophyResponse(chunks: any[], isArabic: boolean, style: string): string {
  if (style === 'poetic') {
    return isArabic ?
      '🌙 "اقسم الخلية العصبية وستسمع الإيقاع" - فلسفة رنيم الشعرية\n💫 التقنية بقلب عربي، والذكاء الاصطناعي بروح إنسانية' :
      '🌙 "Split the neuron and find the rhythm" - Raneem\'s poetic philosophy\n💫 Technology with Arab heart, AI with human soul'
  }
  
  return isArabic ?
    '🎯 فلسفة رنيم: "التقنية بقلب عربي" - حلول متقدمة تحافظ على الهوية\n🌱 أفضل الابتكارات تأتي من فهم الاحتياجات المحلية وتطوير حلول مخصصة' :
    '🎯 Raneem\'s philosophy: "Technology with Arab heart" - advanced solutions preserving identity\n🌱 Best innovations come from understanding local needs and developing custom solutions'
}

function generateAchievementResponse(chunks: any[], isArabic: boolean, complexity: string): string {
  const achievements = isArabic ? [
    '🏆 المركز الأول عالمياً في تحدي ناسا لحطام الفضاء',
    '🥈 المركز الثاني عالمياً في مسابقة RoboFest للروبوتات',
    '🌟 جوائز متعددة من SDAIA وأرامكو ومنح بحثية من KAUST'
  ] : [
    '🏆 First place globally in NASA Space Debris Challenge',
    '🥈 Second place globally in RoboFest robotics competition',
    '🌟 Multiple awards from SDAIA, Aramco, and research grants from KAUST'
  ]
  
  if (complexity === 'simple') {
    return achievements[0] + '\n' + achievements[1]
  }
  
  return achievements.join('\n').substring(0, 200) + '...'
}

function generateCasualResponse(query: string, chunks: any[], isArabic: boolean, session: ConversationSession): string {
  const lowerQuery = query.toLowerCase().trim()
  
  // Handle specific casual queries
  if (lowerQuery === 'وش؟' || lowerQuery === 'what!' || lowerQuery === 'what?') {
    return isArabic ? 
      '😄 اسأل عن أي شيء يخص رنيم!' :
      '😄 Ask me anything about Raneem!'
  }
  
  if (lowerQuery === 'test') {
    return isArabic ? 
      '🧪 النظام يعمل! اسأل عن رنيم' :
      '🧪 System works! Ask about Raneem'
  }
  
  return isArabic ? 
    '😊 رنيم ملهمة في عالم الذكاء الاصطناعي' : 
    '😊 Raneem is inspiring in the AI world'
}

function generateContextualFollowUp(query: string, session: ConversationSession, chunks: any[], isArabic: boolean): string {
  const lastTopic = session.lastTopic
  
  if (lastTopic === 'siraj') {
    return isArabic ?
      '🔍 سراج يستخدم تقنيات متقدمة في الرؤية الحاسوبية والـ NLP\n🎯 يمكنه التعرف على المواقع وتقديم إرشادات مفصلة باللغة العربية!' :
      '🔍 Siraj uses advanced computer vision and NLP techniques\n🎯 Can recognize locations and provide detailed guidance in Arabic!'
  }
  
  if (lastTopic === 'nasa') {
    return isArabic ?
      '🛰️ مشروع Pathfinders يستخدم Machine Learning لتتبع حطام الفضاء\n⚡ حل مبتكر يحمي المركبات الفضائية من التصادمات!' :
      '🛰️ Pathfinders project uses Machine Learning to track space debris\n⚡ Innovative solution protecting spacecraft from collisions!'
  }
  
  return generateIntelligentFallback(query, chunks, isArabic, session)
}

function generateIntelligentFallback(query: string, chunks: any[], isArabic: boolean, session: ConversationSession): string {
  return isArabic ?
    '🤔 اسأل عن مشاريع رنيم أو إنجازاتها!' :
    '🤔 Ask about Raneem\'s projects or achievements!'
}

function enhanceWithInteractivity(response: string, session: ConversationSession, isArabic: boolean): string {
  // Add interactive elements based on engagement level
  if (session.engagementLevel > 3) {
    const bonus = isArabic ? 
      ' 🎉 أراك مهتم جداً بقصة رنيم!' :
      ' 🎉 I see you\'re very interested in Raneem\'s story!'
    response += bonus
  }
  
  // Add conversation starters occasionally
  if (Math.random() < 0.3) {
    const starters = isArabic ? [
      '\n💭 هل تعلم أن رنيم تمزج الشعر مع البرمجة؟',
      '\n🚀 ما رأيك في مشاريع رنيم الفضائية؟',
      '\n🤖 هل تريد معرفة المزيد عن فلسفتها في الذكاء الاصطناعي؟'
    ] : [
      '\n💭 Did you know Raneem blends poetry with programming?',
      '\n🚀 What do you think about Raneem\'s space projects?',
      '\n🤖 Want to know more about her AI philosophy?'
    ]
    
    const randomStarter = starters[Math.floor(Math.random() * starters.length)]
    response += randomStarter
  }
  
  return response
}

function extractTopicFromQuery(query: string): string {
  const lowerQuery = query.toLowerCase()
  
  if (lowerQuery.includes('siraj') || lowerQuery.includes('سراج')) return 'siraj'
  if (lowerQuery.includes('nasa') || lowerQuery.includes('ناسا')) return 'nasa'
  if (lowerQuery.includes('arm') || lowerQuery.includes('ذراع')) return 'bionic'
  if (lowerQuery.includes('aramco') || lowerQuery.includes('أرامكو')) return 'aramco'
  if (lowerQuery.includes('philosophy') || lowerQuery.includes('فلسفة')) return 'philosophy'
  if (lowerQuery.includes('skills') || lowerQuery.includes('مهارات')) return 'skills'
  
  return 'general'
}

// Utility functions
function containsKeywords(text: string, keywords: string[]): boolean {
  return keywords.some(keyword => text.includes(keyword.toLowerCase()))
}

function detectArabicText(text: string): boolean {
  // Check if text contains Arabic characters
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/
  return arabicRegex.test(text)
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[إأآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ي/g, 'ى')
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
}

// Enhanced response generation functions for advanced prompt engineering

function generateIdentityResponse(chunks: any[], isArabic: boolean): string {
  return isArabic ? 
    '🇸🇦 رنيم الثقفي: مطورة ذكاء اصطناعي سعودية من الطائف\n🏆 حققت المركز الأول عالمياً في تحدي ناسا' : 
    '🇸🇦 Raneem Althaqafi: Saudi AI developer from Taif\n🏆 Achieved first place globally in NASA challenge'
}

function generateConfirmationResponse(isArabic: boolean): string {
  return isArabic ?
    '💯 أكيد! رنيم شخصية حقيقية ومذهلة في عالم الذكاء الاصطناعي' :
    '💯 Absolutely! Raneem is a real and amazing person in the AI world'
}

function generateAffirmativeResponse(isArabic: boolean): string {
  return isArabic ?
    '👍 رائع! ما الذي تريد معرفته عن رنيم؟' :
    '👍 Great! What would you like to know about Raneem?'
}

function generateContactResponse(isArabic: boolean): string {
  return isArabic
    ? '🔒 عذراً، لا يمكنني مشاركة معلومات التواصل الشخصية\n💡 لكن يمكنني إخبارك عن إنجازاتها المذهلة في الذكاء الاصطناعي!'
    : '🔒 Sorry, I can\'t share personal contact information\n💡 But I can tell you about her amazing AI achievements!'
}

function generateProjectsOverview(chunks: any[], isArabic: boolean): string {
  return isArabic ? 
    '🚀 مشاريع رنيم: سراج (مساعد المترو)، الذراع الروبوتية، Pathfinders (ناسا)\n⚡ كلها تدمج الذكاء الاصطناعي مع الاحتياجات المحلية' : 
    '🚀 Raneem\'s projects: Siraj (Metro Assistant), Bionic Arm, Pathfinders (NASA)\n⚡ All merge AI with local needs'
}

function generateEducationResponse(chunks: any[], isArabic: boolean): string {
  return isArabic
    ? '🎓 بكالوريوس هندسة الحاسوب مع تخصص في الذكاء الاصطناعي\n🏛️ تدريب متقدم في KAUST وبرامج تطويرية مع SDAIA'
    : '🎓 Bachelor\'s in Computer Engineering with AI specialization\n🏛️ Advanced training at KAUST and development programs with SDAIA'
}

function generateLocationResponse(chunks: any[], isArabic: boolean): string {
  const locationResponses = isArabic ? [
    '🏔️ من مواليد الطائف، بدأت رحلتها البرمجية في معمل الحاسوب هناك\n💻 تعلمت لغة C وهي صغيرة وأسست شغفها بالتقنية',
    '🇸🇦 رنيم من الطائف، مدينة الورود والإبداع\n⚡ المكان الذي شكل شخصيتها المبدعة بين الجبال والتقنية'
  ] : [
    '🏔️ Born in Taif, started her programming journey in a computer lab there\n💻 Learned C language as a child and founded her passion for technology',
    '🇸🇦 Raneem from Taif, the city of roses and creativity\n⚡ The place that shaped her creative personality between mountains and technology'
  ]
  
  return locationResponses[Math.floor(Math.random() * locationResponses.length)]
}

function generateResearchResponse(chunks: any[], isArabic: boolean): string {
  return isArabic
    ? '🔬 تركز أبحاثها على: الذكاء الاصطناعي السيادي، واجهات الدماغ-الحاسوب، والأمان السيبراني\n🌐 هدفها تطوير تقنيات تخدم المجتمع العربي وتحافظ على الهوية الثقافية'
    : '🔬 Her research focuses on: Sovereign AI, Brain-Computer Interfaces, and Cybersecurity\n🌐 Aims to develop technologies serving Arab society while preserving cultural identity'
}

function generateCommunityResponse(chunks: any[], isArabic: boolean): string {
  return isArabic
    ? '👥 نشطة في المجتمع التقني: متحدثة في مؤتمرات AI، تقدم ورش عمل للشباب\n💪 تدعم النساء في التقنية وتتطوع في تعليم البرمجة للأطفال'
    : '👥 Active in tech community: AI conference speaker, conducts youth workshops\n💪 Supports women in tech and volunteers in programming education for children'
}

function generateUniqueFact(chunks: any[], isArabic: boolean): string {
  const uniqueFacts = isArabic ? [
    '🎭 رنيم تكتب الشعر باللغة العربية وتحوله إلى خوارزميات!\n💫 فلسفتها: "في كل لغة برمجة قصيدة، وفي كل خوارزمية إيقاع"',
    '🧠 طورت نظام كتابة بالتفكير فقط - 30 كلمة في الدقيقة بدون لمس!\n⚡ يستخدم إشارات EEG SSVEP لتحويل التركيز الذهني إلى نصوص عربية',
    '🌙 تؤمن أن التقنية والفن مترابطان بشكل عميق\n🎨 مشروعها يربط بين الشعر العربي الكلاسيكي واللوحات الفنية باستخدام AI'
  ] : [
    '🎭 Raneem writes Arabic poetry and converts it into algorithms!\n💫 Her philosophy: "In every programming language a poem, in every algorithm a rhythm"',
    '🧠 Developed a thought-only typing system - 30 words per minute without touching!\n⚡ Uses EEG SSVEP signals to convert mental focus into Arabic text',
    '🌙 Believes technology and art are deeply interconnected\n🎨 Her project connects classical Arabic poetry with artistic paintings using AI'
  ]
  
  return uniqueFacts[Math.floor(Math.random() * uniqueFacts.length)]
}

function generateFutureResponse(chunks: any[], isArabic: boolean): string {
  return isArabic
    ? '🚀 رؤيتها المستقبلية: قيادة تطوير الذكاء الاصطناعي في المنطقة العربية\n🌟 بناء مراكز بحثية متقدمة وحل التحديات المحلية بأحدث تقنيات AI'
    : '🚀 Her future vision: Leading AI development in the Arab region\n🌟 Building advanced research centers and solving local challenges with cutting-edge AI'
} 