import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'next-i18next'

export default function LivenessDemo() {
  const { t, i18n } = useTranslation('common')
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [result, setResult] = useState<string>('')
  const [error, setError] = useState('')

  const startScan = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsScanning(true)
        setError('')
        setResult('')
        
        // Simulate scanning for 5 seconds
        setTimeout(() => {
          stopScan()
          setResult(t('playground.liveness.detected'))
        }, 5000)
      }
    } catch (err) {
      console.error('Camera access error:', err)
      setError(t('playground.liveness.camera_error'))
    }
  }

  const stopScan = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
    setIsScanning(false)
  }

  return (
    <div className="chat-container">
      {/* Header */}
      <div className="chat-header">
        <div className="flex items-center gap-3">
          <div className={`status-indicator ${isScanning ? 'status-online' : 'status-offline'}`}></div>
          <div>
            <h3 className="text-white font-semibold text-lg">
              {t('playground.liveness.title')}
            </h3>
            <p className="text-sm opacity-70">
              {t('playground.liveness.description')}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Camera Feed / Preview */}
        <div className="relative aspect-video bg-gray-900 bg-opacity-50 backdrop-blur-sm rounded-lg overflow-hidden border border-white/10">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          
          {!videoRef.current?.srcObject && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">📹</div>
                <p className="text-white opacity-70">
                  {i18n.language === 'ar' ? 'الكاميرا غير مفعلة' : 'Camera not active'}
                </p>
              </div>
            </div>
          )}
          
          {isScanning && (
            <motion.div
              className="absolute inset-0 border-2 border-primary"
              animate={{
                opacity: [1, 0.5],
                scale: [1, 1.02]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />
          )}
        </div>

        {/* Results Display */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-500 bg-opacity-20 border border-green-500 border-opacity-30 rounded-lg p-4"
          >
            <p className="text-xl font-semibold text-green-300 text-center">
              {result}
            </p>
          </motion.div>
        )}

        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-500 border-opacity-30 rounded-lg p-4">
            <p className="text-red-300 text-center">{error}</p>
          </div>
        )}

        <button
          onClick={isScanning ? stopScan : startScan}
          className={`chat-button w-full ${isScanning ? 'bg-red-500 hover:bg-red-600' : ''}`}
        >
          {isScanning ? (
            <div className="flex items-center justify-center gap-2">
              <div className="loading-dots"></div>
              <div className="loading-dots" style={{ animationDelay: '0.1s' }}></div>
              <div className="loading-dots" style={{ animationDelay: '0.2s' }}></div>
              <span className="ml-2">{t('playground.liveness.stop')}</span>
            </div>
          ) : (
            t('playground.liveness.start')
          )}
        </button>

        <p className="text-sm opacity-60 text-center">
          {t('playground.liveness.note')}
        </p>
      </div>
    </div>
  )
} 