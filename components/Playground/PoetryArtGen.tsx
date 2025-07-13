import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'next-i18next'

const sampleVerses = [
  {
    ar: "وَلَقَد نَظَرتُ إِلى السَّماءِ فَزادَني\nعَجَباً وَتِيهاً ما بِها مِن كَواكِبِ",
    en: "I looked at the sky and it increased my\nwonder and pride at what stars it holds"
  },
  {
    ar: "أَنا مَن نَظَرَ الأَعمى إِلى أَدَبي\nفَأَبصَرَ وَالأَصَمُّ سَمِع",
    en: "I am the one whose poetry made the blind see\nand the deaf hear"
  }
]

export default function PoetryArtGen() {
  const { t, i18n } = useTranslation('common')
  const [verse, setVerse] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState('')
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    if (!verse.trim()) return
    
    setIsGenerating(true)
    setError('')
    
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verse })
      })

      if (!response.ok) throw new Error('Failed to generate image')
      
      const data = await response.json()
      setGeneratedImage(data.imageUrl)
    } catch (err) {
      console.error('Poetry-Art generation error:', err)
      setError(t('playground.poetry.error'))
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="chat-container">
      {/* Header */}
      <div className="chat-header">
        <div className="flex items-center gap-3">
          <div className="status-indicator status-online"></div>
          <div>
            <h3 className="text-white font-semibold text-lg">
              {t('playground.poetry.title')}
            </h3>
            <p className="text-sm opacity-70">
              {t('playground.poetry.description')}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-3 text-white">
            {t('playground.poetry.input_label')}
          </label>
          <textarea
            value={verse}
            onChange={(e) => setVerse(e.target.value)}
            placeholder={t('playground.poetry.placeholder')}
            className="chat-input h-32 resize-none"
            dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
          />
        </div>

        <div className="flex gap-3">
          {sampleVerses.map((v, i) => (
            <button
              key={i}
              onClick={() => setVerse(v.ar)}
              className="suggested-question"
            >
              {t('playground.poetry.sample')} {i + 1}
            </button>
          ))}
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !verse.trim()}
          className="chat-button w-full"
        >
          {isGenerating ? (
            <div className="flex items-center justify-center gap-2">
              <div className="loading-dots"></div>
              <div className="loading-dots" style={{ animationDelay: '0.1s' }}></div>
              <div className="loading-dots" style={{ animationDelay: '0.2s' }}></div>
              <span className="ml-2">{t('playground.poetry.generating')}</span>
            </div>
          ) : (
            t('playground.poetry.generate')
          )}
        </button>

        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-500 border-opacity-30 rounded-lg p-4">
            <p className="text-red-300 text-center">{error}</p>
          </div>
        )}

        {generatedImage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 bg-opacity-30 backdrop-blur-sm rounded-lg p-4"
          >
            <img
              src={generatedImage}
              alt={t('playground.poetry.generated_alt')}
              className="w-full rounded-lg shadow-lg"
            />
          </motion.div>
        )}
      </div>
    </div>
  )
} 