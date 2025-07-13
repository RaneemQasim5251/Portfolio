import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'next-i18next'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  sources?: string[]
  hasAudio?: boolean
  mode?: 'online' | 'offline'
}

interface ChatResponse {
  answer: string
  sources?: string[]
  contextUsed?: boolean
  mode?: 'online' | 'offline'
}

export default function HybridChatbot() {
  const { t, i18n } = useTranslation('common')
  const locale = i18n.language
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [chatMode, setChatMode] = useState<'online' | 'offline'>('offline') // Default to offline
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const endpoint = chatMode === 'online' ? '/api/chat' : '/api/chat-offline'
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [userMessage],
          locale
        })
      })

      if (!response.ok) {
        // If online mode fails, try offline mode as fallback
        if (chatMode === 'online') {
          const offlineResponse = await fetch('/api/chat-offline', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: [userMessage],
              locale
            })
          })

          if (offlineResponse.ok) {
            const offlineData: ChatResponse = await offlineResponse.json()
            const assistantMessage: Message = {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: offlineData.answer,
              timestamp: new Date(),
              sources: offlineData.sources,
              hasAudio: true,
              mode: 'offline'
            }
            setMessages(prev => [...prev, assistantMessage])
            return
          }
        }
        throw new Error('Failed to get response')
      }

      const data: ChatResponse = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.answer,
        timestamp: new Date(),
        sources: data.sources,
        hasAudio: true,
        mode: chatMode
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: locale === 'ar' 
          ? 'عذراً، حدث خطأ في معالجة سؤالك. يرجى المحاولة مرة أخرى.'
          : 'Sorry, there was an error processing your question. Please try again.',
        timestamp: new Date(),
        mode: 'offline'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleVoiceInput = async () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop()
      }
      setIsRecording(false)
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const mediaRecorder = new MediaRecorder(stream)
        mediaRecorderRef.current = mediaRecorder
        audioChunksRef.current = []

        mediaRecorder.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data)
        }

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
          
          // Only use STT if online mode is available
          if (chatMode === 'online') {
            const formData = new FormData()
            formData.append('audio', audioBlob, 'recording.wav')

            try {
              const response = await fetch('/api/stt', {
                method: 'POST',
                body: formData
              })

              if (response.ok) {
                const { text } = await response.json()
                if (text.trim()) {
                  handleSendMessage(text)
                }
              }
            } catch (error) {
              console.error('Speech-to-text error:', error)
            }
          }

          // Cleanup
          stream.getTracks().forEach(track => track.stop())
        }

        mediaRecorder.start()
        setIsRecording(true)
      } catch (error) {
        console.error('Error accessing microphone:', error)
      }
    }
  }

  const handlePlayAudio = async (messageId: string, text: string) => {
    if (isPlaying === messageId) {
      setIsPlaying(null)
      return
    }

    // Only use TTS if online mode is available
    if (chatMode === 'offline') {
      alert(locale === 'ar' 
        ? 'الصوت متاح فقط في الوضع المتصل بالإنترنت'
        : 'Audio is only available in online mode')
      return
    }

    setIsPlaying(messageId)

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          language: locale,
          voice_type: 'narrative'
        })
      })

      if (response.ok) {
        const audioBlob = await response.blob()
        const audioUrl = URL.createObjectURL(audioBlob)
        const audio = new Audio(audioUrl)
        
        audio.onended = () => {
          setIsPlaying(null)
          URL.revokeObjectURL(audioUrl)
        }
        
        audio.play()
      }
    } catch (error) {
      console.error('Text-to-speech error:', error)
      setIsPlaying(null)
    }
  }

  const suggestedQuestions = locale === 'ar' ? [
    'من هي رنيم الثقفي؟',
    'ما هي المشاريع التي طورتها رنيم؟',
    'حدثني عن إنجازات رنيم في مجال الذكاء الاصطناعي',
    'ما هو مشروع سراج؟',
    'كيف فازت رنيم في تحدي ناسا؟'
  ] : [
    'Who is Raneem Althaqafi?',
    'What projects has Raneem developed?',
    'Tell me about Raneem\'s AI achievements',
    'What is the Siraj project?',
    'How did Raneem win the NASA challenge?'
  ]

  const clearChat = () => {
    setMessages([])
  }

  return (
    <div className="max-w-4xl mx-auto bg-gray-900 bg-opacity-50 backdrop-blur-sm rounded-2xl border border-gray-700 overflow-hidden">
      {/* Header with mode toggle */}
      <div className="bg-gradient-to-r from-purple-900 to-blue-900 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <h3 className="text-white font-semibold">
            {t('playground.chat.title')} - {chatMode === 'online' ? 'Online' : 'Offline'}
          </h3>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Mode Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-white text-sm">
              {locale === 'ar' ? 'الوضع:' : 'Mode:'}
            </span>
            <button
              onClick={() => setChatMode(chatMode === 'online' ? 'offline' : 'online')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                chatMode === 'online'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-600 text-gray-300'
              }`}
            >
              {chatMode === 'online' ? 'Online' : 'Offline'}
            </button>
          </div>
          
          {/* Clear Chat */}
          <button
            onClick={clearChat}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
          >
            {locale === 'ar' ? 'مسح' : 'Clear'}
          </button>
        </div>
      </div>

      {/* Mode Info */}
      <div className="bg-gray-800 p-3 border-b border-gray-700">
        <div className="flex items-center gap-2 text-sm">
          {chatMode === 'online' ? (
            <>
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-green-400">
                {locale === 'ar' 
                  ? 'متصل - يستخدم OpenAI GPT-4 مع تكاليف'
                  : 'Online - Using OpenAI GPT-4 with costs'}
              </span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-blue-400">
                {locale === 'ar' 
                  ? 'غير متصل - يستخدم قاعدة المعرفة المحلية (مجاني)'
                  : 'Offline - Using local knowledge base (free)'}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="h-96 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-100'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
                
                {/* Message metadata */}
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-600">
                  <div className="flex items-center gap-2">
                    {message.mode && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        message.mode === 'online' 
                          ? 'bg-green-500 text-white' 
                          : 'bg-blue-500 text-white'
                      }`}>
                        {message.mode}
                      </span>
                    )}
                    
                    {message.sources && message.sources.length > 0 && (
                      <span className="text-xs text-gray-400">
                        {message.sources.length} {locale === 'ar' ? 'مصدر' : 'sources'}
                      </span>
                    )}
                  </div>
                  
                  {message.role === 'assistant' && message.hasAudio && (
                    <button
                      onClick={() => handlePlayAudio(message.id, message.content)}
                      disabled={isPlaying === message.id}
                      className="text-xs text-gray-400 hover:text-white transition-colors"
                    >
                      {isPlaying === message.id ? '⏸️' : '🔊'}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-gray-700 text-gray-100 px-4 py-3 rounded-2xl">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <span className="text-sm ml-2">
                  {locale === 'ar' ? 'جاري الكتابة...' : 'Typing...'}
                </span>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {messages.length === 0 && (
        <div className="p-4 border-t border-gray-700">
          <p className="text-gray-400 text-sm mb-3">
            {locale === 'ar' ? 'أسئلة مقترحة:' : 'Suggested questions:'}
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleSendMessage(question)}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-700">
        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(input); }} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={locale === 'ar' ? 'اكتب سؤالك هنا...' : 'Type your question here...'}
            className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          
          {chatMode === 'online' && (
            <button
              type="button"
              onClick={handleVoiceInput}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isRecording
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }`}
              disabled={isLoading}
            >
              {isRecording ? '🛑' : '🎤'}
            </button>
          )}
          
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            {isLoading ? '⏳' : '↗'}
          </button>
        </form>
      </div>
    </div>
  )
} 