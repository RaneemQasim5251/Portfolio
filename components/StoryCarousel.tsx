import React from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'next-i18next'

const stories = ['story1', 'story2', 'story3']

export default function StoryCarousel() {
  const { t } = useTranslation('common')

  return (
    <div className="flex space-x-8 md:space-x-12 lg:space-x-16 overflow-x-auto scroll-snap-x scroll-smooth px-4">
      {stories.map((storyKey) => (
        <motion.div
          key={storyKey}
          className="snap-center min-w-[80%] md:min-w-[60%] lg:min-w-[40%] glass-panel p-6 relative"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-lg leading-relaxed">{t(`about.${storyKey}`)}</p>
          <button
            className="mt-4 text-primary hover:text-white transition-colors"
            onClick={() => {
              // TODO: Implement audio playback
              console.log(`Play audio for ${storyKey}`)
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8 8 0 010 11.9M6.343 9.657L11 14.314l4.657-4.657a3.314 3.314 0 00-4.657-4.657 3.314 3.314 0 00-4.657 4.657z"
              />
            </svg>
          </button>
        </motion.div>
      ))}
    </div>
  )
} 