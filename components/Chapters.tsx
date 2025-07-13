import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/router'
import chaptersData from '../data/chapters.json'

interface Chapter {
  id: string
  titleEn: string
  titleAr: string
  captionEn: string
  captionAr: string
  videoUrl: string
}

interface ChapterSection {
  titleEn: string
  titleAr: string
  captionEn: string
  captionAr: string
  videoUrl: string
}

export default function Chapters() {
  const router = useRouter()
  const { locale } = router
  const isArabic = locale === 'ar'
  
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isInView, setIsInView] = useState(false)
  
  const containerRef = useRef<HTMLDivElement>(null)

  // Combine all sections (prologue + chapters + epilogue)
  const allSections = [
    { ...chaptersData.prologue, id: 'prologue' },
    ...chaptersData.chapters,
    { ...chaptersData.epilogue, id: 'epilogue' }
  ]

  // Handle scroll navigation and visibility
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Only handle scroll if we're inside the chapters container and in view
      if (containerRef.current && containerRef.current.contains(e.target as Node) && isInView) {
        e.preventDefault()
        e.stopPropagation()
        if (e.deltaY > 0 && currentIndex < allSections.length - 1) {
          setCurrentIndex(prev => prev + 1)
        } else if (e.deltaY < 0 && currentIndex > 0) {
          setCurrentIndex(prev => prev - 1)
        }
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle keys if chapters section is in view
      if (isInView) {
        if (e.key === 'ArrowDown' && currentIndex < allSections.length - 1) {
          e.preventDefault()
          e.stopPropagation()
          setCurrentIndex(prev => prev + 1)
        } else if (e.key === 'ArrowUp' && currentIndex > 0) {
          e.preventDefault()
          e.stopPropagation()
          setCurrentIndex(prev => prev - 1)
        }
      }
    }

    const handleScroll = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const windowHeight = window.innerHeight
        const isVisible = rect.top < windowHeight * 0.5 && rect.bottom > windowHeight * 0.5
        setIsInView(isVisible)
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('scroll', handleScroll)
    
    // Check initial visibility
    handleScroll()

    return () => {
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [currentIndex, allSections.length, isInView])



  const currentSection = allSections[currentIndex]

  const getSectionTitle = (section: any) => {
    if (section.id === 'prologue') return isArabic ? 'المقدمة' : 'Prologue'
    if (section.id === 'epilogue') return isArabic ? 'النهاية' : 'Epilogue'
    return `${isArabic ? 'الفصل' : 'Chapter'} ${section.id}`
  }

  return (
    <div 
      ref={containerRef}
      className="relative min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white overflow-hidden"
    >
      {/* Navigation Menu */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: isMenuOpen ? 0 : -280 }}
        className="fixed left-0 top-0 h-screen w-72 bg-black bg-opacity-90 backdrop-blur-lg z-50 p-4"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">
            {isArabic ? 'فصول الحياة' : 'Chapters'}
          </h2>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white hover:text-primary transition-colors"
          >
            {isMenuOpen ? '✕' : '☰'}
          </button>
        </div>
        
        <div className="space-y-2 max-h-[calc(100vh-100px)] overflow-y-auto no-scrollbar">
          {allSections.map((section, index) => (
            <button
              key={section.id}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setCurrentIndex(index)
                setIsMenuOpen(false)
              }}
              className={`w-full text-left p-2 rounded-lg transition-all ${
                index === currentIndex
                  ? 'bg-primary bg-opacity-80 text-white'
                  : 'bg-gray-800 bg-opacity-50 hover:bg-opacity-80 text-gray-300 hover:text-white'
              }`}
            >
              <div className="text-xs opacity-70 mb-1">
                {getSectionTitle(section)}
              </div>
              <div className="font-medium text-xs">
                {isArabic ? section.titleAr : section.titleEn}
              </div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Menu Toggle Button - Only show when in view */}
      {isInView && (
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="fixed left-3 top-4 z-40 w-10 h-10 bg-black bg-opacity-50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-opacity-70 transition-all text-sm"
        >
          ☰
        </button>
      )}

      {/* Progress Indicator - Only show when in view */}
      {isInView && (
        <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-40">
          <div className="flex flex-col space-y-1">
            {allSections.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setCurrentIndex(index)
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-primary scale-150'
                    : 'bg-gray-600 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.6 }}
          className="min-h-screen flex items-center justify-center px-12 py-20"
        >
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className={`space-y-6 ${isArabic ? 'md:order-2 text-right' : 'md:order-1 text-left'}`}>
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-primary text-sm font-medium mb-2"
                >
                  {getSectionTitle(currentSection)}
                </motion.div>
                
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl md:text-5xl font-bold mb-6 leading-tight"
                >
                  {isArabic ? currentSection.titleAr : currentSection.titleEn}
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-lg md:text-xl text-gray-300 leading-relaxed"
                >
                  {isArabic ? currentSection.captionAr : currentSection.captionEn}
                </motion.p>
              </div>

              {/* Navigation Arrows */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex gap-4"
              >
                                 <button
                   onClick={(e) => {
                     e.preventDefault()
                     e.stopPropagation()
                     setCurrentIndex(Math.max(0, currentIndex - 1))
                   }}
                   disabled={currentIndex === 0}
                   className="flex items-center gap-2 px-4 py-2 bg-gray-800 bg-opacity-50 rounded-lg hover:bg-opacity-80 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                 >
                   <span>{isArabic ? '→' : '←'}</span>
                   <span className="text-sm">{isArabic ? 'السابق' : 'Previous'}</span>
                 </button>
                 
                 <button
                   onClick={(e) => {
                     e.preventDefault()
                     e.stopPropagation()
                     setCurrentIndex(Math.min(allSections.length - 1, currentIndex + 1))
                   }}
                   disabled={currentIndex === allSections.length - 1}
                   className="flex items-center gap-2 px-4 py-2 bg-primary bg-opacity-80 rounded-lg hover:bg-opacity-100 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                 >
                   <span className="text-sm">{isArabic ? 'التالي' : 'Next'}</span>
                   <span>{isArabic ? '←' : '→'}</span>
                 </button>
              </motion.div>
            </div>

            {/* Video Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className={`${isArabic ? 'md:order-1' : 'md:order-2'}`}
            >
              <div
                className="relative aspect-video bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10"
              >
                                 {currentSection.videoUrl ? (
                   <img
                     src={currentSection.videoUrl}
                     alt={isArabic ? currentSection.titleAr : currentSection.titleEn}
                     className="w-full h-full object-cover"
                   />
                 ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl mb-4">🎬</div>
                      <p className="text-gray-400">
                        {isArabic ? 'الفيديو قادم قريباً' : 'Video Coming Soon'}
                      </p>
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Scroll Hint */}
      {currentIndex === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center"
        >
          <div className="text-gray-400 text-sm mb-2">
            {isArabic ? 'مرر للأسفل للمتابعة' : 'Scroll to continue'}
          </div>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-2xl"
          >
            ↓
          </motion.div>
        </motion.div>
      )}
    </div>
  )
} 