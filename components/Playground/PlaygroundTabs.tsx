import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'next-i18next'
import EnhancedChatbot from './EnhancedChatbot'
import HybridChatbotFixed from './HybridChatbotFixed'
import OllamaChatbot from './OllamaChatbot'
import PoetryArtGen from './PoetryArtGen'
import BCITypeSimulator from './BCITypeSimulator'
import LivenessDemo from './LivenessDemo'

const tabs = [
  { 
    id: 'hybrid-chat', 
    icon: '💬',
    titleEn: 'Offline RAG',
    titleAr: 'دردشة غير متصلة',
    descEn: 'Pure offline intelligence',
    descAr: 'ذكاء اصطناعي محلي بدون إنترنت'
  },
  { 
    id: 'ollama-chat', 
    icon: '🧠',
    titleEn: 'Ollama Local',
    titleAr: 'أولاما المحلي',
    descEn: 'Local AI with DeepSeek R1',
    descAr: 'ذكاء اصطناعي محلي مع DeepSeek R1'
  },
  { 
    id: 'chat', 
    icon: '☁️',
    titleEn: 'Enhanced Chat',
    titleAr: 'دردشة محسنة',
    descEn: 'Cloud AI with GPT-4',
    descAr: 'ذكاء اصطناعي سحابي مع GPT-4'
  },
  { 
    id: 'poetry', 
    icon: '🎨',
    titleEn: 'Poetry Art',
    titleAr: 'فن الشعر',
    descEn: 'Creative AI poetry',
    descAr: 'شعر إبداعي بالذكاء الاصطناعي'
  },
  { 
    id: 'bci', 
    icon: '⚡',
    titleEn: 'BCI Type',
    titleAr: 'كتابة عقلية',
    descEn: 'Brain-computer interface',
    descAr: 'واجهة دماغ-حاسوب'
  },
  { 
    id: 'liveness', 
    icon: '👁️',
    titleEn: 'Liveness',
    titleAr: 'كشف الحيوية',
    descEn: 'Face liveness detection',
    descAr: 'كشف حيوية الوجه'
  }
]

export default function PlaygroundTabs() {
  const { t, i18n } = useTranslation('common')
  const [activeTab, setActiveTab] = useState('hybrid-chat')
  const isArabic = i18n.language === 'ar'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Enhanced Header */}
      <div className="text-center mb-8">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-white mb-3"
        >
          {isArabic ? 'تحدث معي ومع مشاريعي' : 'Chat with Me and My Projects'}
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-gray-300 text-lg max-w-2xl mx-auto"
        >
          {isArabic 
            ? 'اختر من بين مختلف المشاريع والتقنيات للتفاعل معها مباشرة'
            : 'Choose from different projects and technologies to interact with them directly'
          }
        </motion.p>
      </div>

      {/* Enhanced Tab Navigation */}
      <div className="mb-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {tabs.map((tab, index) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`relative group p-4 rounded-2xl transition-all duration-300 backdrop-blur-sm border ${
                activeTab === tab.id 
                  ? 'bg-gradient-to-br from-red-500/20 to-red-600/20 border-red-400/40 text-white shadow-lg shadow-red-500/20' 
                  : 'bg-gray-800/40 border-gray-700/50 text-gray-300 hover:bg-gray-700/50 hover:border-gray-600/50'
              }`}
            >
              {/* Icon with unified white styling */}
              <div className={`flex items-center justify-center w-12 h-12 rounded-xl mb-3 mx-auto transition-all duration-300 ${
                activeTab === tab.id 
                  ? 'bg-red-500/20' 
                  : 'bg-gray-700/50 group-hover:bg-gray-600/50'
              }`}>
                <span className="text-2xl text-white filter brightness-125">{tab.icon}</span>
              </div>
              
              {/* Title */}
              <div className="text-center">
                <h3 className={`text-sm font-semibold mb-1 transition-colors duration-300 ${
                  activeTab === tab.id ? 'text-white' : 'text-gray-200 group-hover:text-white'
                }`}>
                  {isArabic ? tab.titleAr : tab.titleEn}
                </h3>
                
                {/* Description */}
                <p className={`text-xs leading-tight transition-colors duration-300 ${
                  activeTab === tab.id ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300'
                }`}>
                  {isArabic ? tab.descAr : tab.descEn}
                </p>
              </div>

              {/* Active indicator */}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-400/30"
                  initial={false}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Enhanced Tab Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative"
      >
        <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/40 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
          {/* Content Area */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="min-h-[500px]"
              >
                {activeTab === 'hybrid-chat' && <HybridChatbotFixed />}
                {activeTab === 'ollama-chat' && <OllamaChatbot />}
                {activeTab === 'chat' && <EnhancedChatbot />}
                {activeTab === 'poetry' && <PoetryArtGen />}
                {activeTab === 'bci' && <BCITypeSimulator />}
                {activeTab === 'liveness' && <LivenessDemo />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  )
} 