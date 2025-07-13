import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'next-i18next'
import { FiSend, FiMic, FiMicOff, FiCpu, FiZap } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  reasoning?: string
  processingTime?: number
  mode?: 'ollama-local' | 'offline'
}

interface OllamaStatus {
  available: boolean
  model: string
  checking: boolean
}

const OllamaChatbot: React.FC = () => {
  const { t, i18n } = useTranslation('common')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [useReasoning, setUseReasoning] = useState(true)
  const [ollamaStatus, setOllamaStatus] = useState<OllamaStatus>({
    available: false,
    model: 'deepseek-r1:1.5b',
    checking: true
  })
  const [showReasoning, setShowReasoning] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    checkOllamaStatus()
    const interval = setInterval(checkOllamaStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const checkOllamaStatus = async () => {
    try {
      const response = await fetch('/api/chat-ollama', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'test' }],
          locale: i18n.language,
          useReasoning: false
        })
      })
      
      if (response.ok) {
        setOllamaStatus({
          available: true,
          model: useReasoning ? 'deepseek-r1:1.5b' : 'llama3.2:1b',
          checking: false
        })
      } else {
        setOllamaStatus(prev => ({ ...prev, available: false, checking: false }))
      }
    } catch (error) {
      setOllamaStatus(prev => ({ ...prev, available: false, checking: false }))
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat-ollama', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          locale: i18n.language,
          useReasoning
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.answer,
        timestamp: new Date(),
        reasoning: data.reasoning,
        processingTime: data.processingTime,
        mode: data.mode
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Chat error:', error)
      
      try {
        const fallbackResponse = await fetch('/api/chat-offline', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [...messages, userMessage],
            locale: i18n.language
          })
        })

        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json()
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: fallbackData.answer,
            timestamp: new Date(),
            mode: 'offline'
          }
          setMessages(prev => [...prev, assistantMessage])
        }
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError)
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: i18n.language === 'ar' 
            ? 'عذراً، حدث خطأ في معالجة سؤالك. يرجى المحاولة مرة أخرى.'
            : 'Sorry, there was an error processing your question. Please try again.',
          timestamp: new Date(),
          mode: 'offline'
        }
        setMessages(prev => [...prev, errorMessage])
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSend()
    }
  }

  const toggleListening = () => {
    setIsListening(!isListening)
  }

  const clearChat = () => {
    setMessages([])
  }

  const getStatusIcon = () => {
    if (ollamaStatus.checking) return <FiCpu className="animate-spin" />
    return ollamaStatus.available ? '🟢' : '🔴'
  }

  return (
    <div className="chat-container">
      {/* Header */}
      <div className="chat-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`status-indicator ${ollamaStatus.available ? 'status-online' : 'status-offline'}`}></div>
            <div>
              <h3 className="text-white font-semibold text-lg">
                {i18n.language === 'ar' ? 'أولاما المحلي' : 'Ollama Local'}
              </h3>
              <p className="text-sm opacity-70">
                {i18n.language === 'ar' 
                  ? 'ذكاء اصطناعي محلي مع DeepSeek R1'
                  : 'Local AI with DeepSeek R1'
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setUseReasoning(!useReasoning)}
              className={`chat-button-secondary text-xs px-3 py-1 ${
                useReasoning ? 'bg-purple-500 hover:bg-purple-600' : ''
              }`}
              title={useReasoning ? 'Reasoning ON' : 'Reasoning OFF'}
            >
              <FiZap className="w-3 h-3" />
            </button>
            
            <button
              onClick={clearChat}
              className="chat-button-secondary text-xs px-3 py-1"
            >
              {i18n.language === 'ar' ? 'مسح' : 'Clear'}
            </button>
          </div>
        </div>
      </div>

      {/* Status Info */}
      <div className="bg-gray-800 bg-opacity-30 backdrop-blur-sm p-3 border-b border-white/10">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${ollamaStatus.available ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className={ollamaStatus.available ? 'text-green-400' : 'text-red-400'}>
              {ollamaStatus.checking 
                ? (i18n.language === 'ar' ? 'جاري التحقق...' : 'Checking...') 
                : ollamaStatus.available 
                  ? `${ollamaStatus.model} ${i18n.language === 'ar' ? 'جاهز' : 'Ready'}`
                  : (i18n.language === 'ar' ? 'وضع الاحتياطي' : 'Fallback Mode')
              }
            </span>
          </div>
          
          {useReasoning && (
            <div className="flex items-center gap-1">
              <FiZap className="w-3 h-3 text-purple-400" />
              <span className="text-purple-400 text-xs">
                {i18n.language === 'ar' ? 'التفكير مفعل' : 'Reasoning ON'}
              </span>
            </div>
          )}
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
                <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
                
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    {message.mode && (
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        message.mode === 'ollama-local' 
                          ? 'bg-purple-500 text-white' 
                          : 'bg-blue-500 text-white'
                      }`}>
                        {message.mode === 'ollama-local' ? '🧠 Ollama' : '💻 Local'}
                      </span>
                    )}
                    {message.processingTime && (
                      <span className="text-xs opacity-60">{message.processingTime}ms</span>
                    )}
                  </div>
                </div>
                
                {message.reasoning && (
                  <div className="mt-3 p-3 bg-black bg-opacity-20 rounded-lg">
                    <button
                      onClick={() => setShowReasoning(!showReasoning)}
                      className="text-xs font-medium mb-2 hover:opacity-80 transition-opacity flex items-center gap-1"
                    >
                      <span>{showReasoning ? '🔽' : '▶️'}</span>
                      {i18n.language === 'ar' ? 'عملية التفكير' : 'Reasoning Process'}
                    </button>
                    {showReasoning && (
                      <div className="text-xs opacity-80 whitespace-pre-wrap leading-relaxed">
                        {message.reasoning}
                      </div>
                    )}
                  </div>
                )}
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
                  {i18n.language === 'ar' ? 'جاري التفكير...' : 'Thinking...'}
                </span>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-6 border-t border-white/10">
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={i18n.language === 'ar' ? 'اكتب سؤالك هنا...' : 'Ask anything about Raneem...'}
              className="chat-input"
              style={{ paddingRight: '3rem' }}
            />
            <button
              onClick={toggleListening}
              className={`absolute right-3 top-3 p-1 rounded-full transition-colors ${
                isListening 
                  ? 'text-red-400 hover:text-red-300' 
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              {isListening ? <FiMicOff className="w-4 h-4" /> : <FiMic className="w-4 h-4" />}
            </button>
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="chat-button"
          >
            <FiSend className="w-4 h-4" />
          </button>
        </div>
        
        <div className="mt-3 text-xs opacity-60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>{getStatusIcon()}</span>
            <span>
              {ollamaStatus.available 
                ? `${i18n.language === 'ar' ? 'متصل بـ' : 'Connected to'} ${ollamaStatus.model}`
                : (i18n.language === 'ar' ? 'يستخدم الوضع الاحتياطي' : 'Using fallback mode')
              }
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span>💻 {i18n.language === 'ar' ? 'وضع محلي' : 'Local Mode'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OllamaChatbot 