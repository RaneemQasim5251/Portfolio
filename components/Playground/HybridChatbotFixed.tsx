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

export default function HybridChatbotFixed() {
  const { t, i18n } = useTranslation('common')
  const locale = i18n.language
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [chatMode, setChatMode] = useState<'online' | 'offline'>('offline')
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
      const allMessages = [...messages, userMessage]
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: allMessages.map(msg => ({ role: msg.role, content: msg.content })),
          locale: locale
        })
      })

      if (!response.ok) {
        if (chatMode === 'online') {
          const offlineResponse = await fetch('/api/chat-offline', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: allMessages.map(msg => ({ role: msg.role, content: msg.content })),
              locale: locale
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
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop()
      }
      setIsRecording(false)
    } else {
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
    <div className="chat-container">
      {/* Header */}
      <div className="chat-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`status-indicator ${chatMode === 'online' ? 'status-online' : 'status-offline'}`}></div>
            <div>
              <h3 className="text-white font-semibold text-lg">
                {locale === 'ar' ? 'دردشة غير متصلة' : 'Offline RAG Chat'}
              </h3>
              <p className="text-sm opacity-70">
                {locale === 'ar' 
                  ? 'ذكاء اصطناعي محلي بدون إنترنت'
                  : 'Pure offline intelligence'
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-white text-sm opacity-70">
                {locale === 'ar' ? 'الوضع:' : 'Mode:'}
              </span>
              <button
                onClick={() => setChatMode(chatMode === 'online' ? 'offline' : 'online')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  chatMode === 'online'
                    ? 'bg-green-500 text-white'
                    : 'bg-blue-500 text-white'
                }`}
              >
                {chatMode === 'online' ? 'Online' : 'Offline'}
              </button>
            </div>
            
            <button
              onClick={clearChat}
              className="chat-button-secondary text-xs px-3 py-1"
            >
              {locale === 'ar' ? 'مسح' : 'Clear'}
            </button>
          </div>
        </div>
      </div>

      {/* Mode Info */}
      <div className="bg-gray-800 bg-opacity-30 backdrop-blur-sm p-3 border-b border-white/10">
        <div className="flex items-center gap-2 text-sm">
          <div className={`w-2 h-2 rounded-full ${chatMode === 'online' ? 'bg-green-400' : 'bg-blue-400'}`}></div>
          <span className={chatMode === 'online' ? 'text-green-400' : 'text-blue-400'}>
            {chatMode === 'online' ? (
              locale === 'ar' 
                ? 'متصل - يستخدم OpenAI GPT-4 مع تكاليف'
                : 'Online - Using OpenAI GPT-4 with costs'
            ) : (
              locale === 'ar' 
                ? 'غير متصل - يستخدم قاعدة المعرفة المحلية (مجاني)'
                : 'Offline - Using local knowledge base (free)'
            )}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="h-[200px] overflow-y-auto p-6 space-y-4 no-scrollbar">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={message.role === 'user' ? 'chat-message-user' : 'chat-message-assistant'}>
                <p className="text-sm leading-relaxed whitespace-pre-line">{message.content}</p>
                
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    {message.mode && (
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        message.mode === 'online' 
                          ? 'bg-green-500 text-white' 
                          : 'bg-blue-500 text-white'
                      }`}>
                        {message.mode}
                      </span>
                    )}
                    
                    {message.sources && message.sources.length > 0 && (
                      <span className="text-xs opacity-60">
                        {message.sources.length} {locale === 'ar' ? 'مصدر' : 'sources'}
                      </span>
                    )}
                  </div>
                  
                  {message.role === 'assistant' && message.hasAudio && (
                    <button
                      onClick={() => handlePlayAudio(message.id, message.content)}
                      disabled={isPlaying === message.id}
                      className="text-xs opacity-60 hover:opacity-100 transition-opacity"
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
            <div className="chat-message-assistant">
              <div className="flex items-center gap-2">
                <div className="loading-dots"></div>
                <div className="loading-dots" style={{ animationDelay: '0.1s' }}></div>
                <div className="loading-dots" style={{ animationDelay: '0.2s' }}></div>
                <span className="text-sm ml-2 opacity-70">
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
        <div className="p-6 border-t border-white/10">
          <p className="text-white opacity-70 text-sm mb-4">
            {locale === 'ar' ? 'أسئلة مقترحة:' : 'Suggested questions:'}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleSendMessage(question)}
                className="suggested-question text-left"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-6 border-t border-white/10">
        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(input); }} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={locale === 'ar' ? 'اكتب سؤالك هنا...' : 'Type your question here...'}
            className="flex-1 chat-input"
            style={{ paddingRight: '3rem' }}
            disabled={isLoading}
          />
          
          {chatMode === 'online' && (
            <button
              type="button"
              onClick={handleVoiceInput}
              className={`chat-button-secondary ${isRecording ? 'bg-red-500 hover:bg-red-600' : ''}`}
              disabled={isLoading}
            >
              {isRecording ? '🛑' : '🎤'}
            </button>
          )}
          
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="chat-button"
          >
            {isLoading ? '⏳' : '↗'}
          </button>
        </form>
      </div>
    </div>
  )
} 