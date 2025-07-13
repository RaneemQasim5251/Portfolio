import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'next-i18next'

const demoText = {
  ar: 'مرحبا',
  en: 'HELLO'
}

export default function BCITypeSimulator() {
  const { t, i18n } = useTranslation('common')
  const [text, setText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (isTyping && currentIndex < demoText.ar.length) {
      const timer = setTimeout(() => {
        setText(prev => prev + demoText.ar[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, 1000)

      return () => clearTimeout(timer)
    } else if (currentIndex >= demoText.ar.length) {
      setIsTyping(false)
      setCurrentIndex(0)
    }
  }, [isTyping, currentIndex])

  const startTyping = () => {
    setText('')
    setIsTyping(true)
  }

  return (
    <div className="chat-container">
      {/* Header */}
      <div className="chat-header">
        <div className="flex items-center gap-3">
          <div className="status-indicator status-online"></div>
          <div>
            <h3 className="text-white font-semibold text-lg">
              {t('playground.bci.title')}
            </h3>
            <p className="text-sm opacity-70">
              {t('playground.bci.description')}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Simulated EEG Display */}
        <div className="relative h-32 bg-gray-900 bg-opacity-50 backdrop-blur-sm rounded-lg overflow-hidden border border-white/10">
          <div className="absolute inset-0 flex items-center justify-center">
            {isTyping ? (
              <motion.div
                className="w-full h-16"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, #720E0E 50%, transparent 100%)',
                  backgroundSize: '200% 100%'
                }}
                animate={{
                  backgroundPosition: ['0% 0%', '200% 0%']
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear'
                }}
              />
            ) : (
              <motion.div
                className="w-full h-8"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, #333 50%, transparent 100%)',
                  backgroundSize: '200% 100%'
                }}
                animate={{
                  backgroundPosition: ['0% 0%', '200% 0%']
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'linear'
                }}
              />
            )}
          </div>
        </div>

        {/* Output Display */}
        <div className="bg-gray-800 bg-opacity-60 backdrop-blur-sm rounded-lg p-6 min-h-[100px] flex items-center justify-center border border-white/10">
          <motion.span
            className="text-3xl text-white"
            initial={false}
            animate={{ opacity: text ? 1 : 0.3 }}
          >
            {text || t('playground.bci.waiting')}
          </motion.span>
        </div>

        <button
          onClick={startTyping}
          disabled={isTyping}
          className="chat-button w-full"
        >
          {isTyping ? (
            <div className="flex items-center justify-center gap-2">
              <div className="loading-dots"></div>
              <div className="loading-dots" style={{ animationDelay: '0.1s' }}></div>
              <div className="loading-dots" style={{ animationDelay: '0.2s' }}></div>
              <span className="ml-2">{t('playground.bci.typing')}</span>
            </div>
          ) : (
            t('playground.bci.start')
          )}
        </button>

        <p className="text-sm opacity-60 text-center">
          {t('playground.bci.note')}
        </p>
      </div>
    </div>
  )
} 