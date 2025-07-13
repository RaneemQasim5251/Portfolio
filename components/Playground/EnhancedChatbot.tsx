import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'next-i18next';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: string[];
  hasAudio?: boolean;
}

interface ChatResponse {
  answer: string;
  sources?: string[];
  contextUsed?: boolean;
}

export default function EnhancedChatbot() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language || 'ar';
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: locale === 'ar' 
        ? 'مرحباً! أنا مساعد ذكي متخصص في الإجابة عن أسئلتك حول رنيم الثقفي. اسألني عن مشاريعها، إنجازاتها، أو خبراتها في مجال الذكاء الاصطناعي.'
        : 'Hello! I\'m an AI assistant specialized in answering questions about Raneem Althaqafi. Ask me about her projects, achievements, or experience in artificial intelligence.',
      timestamp: new Date(),
      hasAudio: true
    }
  ]);
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [userMessage],
          locale
        })
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data: ChatResponse = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.answer,
        timestamp: new Date(),
        sources: data.sources,
        hasAudio: true
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: locale === 'ar' 
          ? 'عذراً، حدث خطأ في معالجة سؤالك. يرجى المحاولة مرة أخرى.'
          : 'Sorry, there was an error processing your question. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = async () => {
    if (isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          
          const formData = new FormData();
          formData.append('audio', audioBlob, 'recording.wav');

          try {
            const response = await fetch('/api/stt', {
              method: 'POST',
              body: formData
            });

            if (response.ok) {
              const { text } = await response.json();
              if (text.trim()) {
                handleSendMessage(text);
              }
            }
          } catch (error) {
            console.error('Speech-to-text error:', error);
          }

          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (error) {
        console.error('Error accessing microphone:', error);
      }
    }
  };

  const handlePlayAudio = async (messageId: string, text: string) => {
    if (isPlaying === messageId) {
      setIsPlaying(null);
      return;
    }

    setIsPlaying(messageId);

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          language: locale,
          voice_type: 'narrative'
        })
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        audio.onended = () => {
          setIsPlaying(null);
          URL.revokeObjectURL(audioUrl);
        };
        
        audio.play();
      }
    } catch (error) {
      console.error('Text-to-speech error:', error);
      setIsPlaying(null);
    }
  };

  const suggestedQuestions = locale === 'ar' ? [
    'ما هي المشاريع التي طورتها رنيم؟',
    'حدثني عن إنجازات رنيم في مجال الذكاء الاصطناعي',
    'ما هو مشروع سراج؟',
    'كيف فازت رنيم في تحدي ناسا؟'
  ] : [
    'What projects has Raneem developed?',
    'Tell me about Raneem\'s AI achievements',
    'What is the Siraj project?',
    'How did Raneem win the NASA challenge?'
  ];

  const clearChat = () => {
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: locale === 'ar' 
        ? 'مرحباً! أنا مساعد ذكي متخصص في الإجابة عن أسئلتك حول رنيم الثقفي. اسألني عن مشاريعها، إنجازاتها، أو خبراتها في مجال الذكاء الاصطناعي.'
        : 'Hello! I\'m an AI assistant specialized in answering questions about Raneem Althaqafi. Ask me about her projects, achievements, or experience in artificial intelligence.',
      timestamp: new Date(),
      hasAudio: true
    }]);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-900/20 to-gray-800/20 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-800/50 to-gray-700/50 border-b border-white/10">
        <div className="flex items-center gap-3">
          {/* Status indicator with animation */}
          <div className="relative">
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping opacity-75"></div>
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg flex items-center gap-2">
              <span className="text-lg">☁️</span>
              {locale === 'ar' ? 'دردشة محسنة' : 'Enhanced Chat'}
            </h3>
            <p className="text-sm text-gray-400">
              {locale === 'ar' 
                ? 'ذكاء اصطناعي سحابي مع GPT-4'
                : 'Cloud AI with GPT-4'
              }
            </p>
          </div>
        </div>
        
        <button
          onClick={clearChat}
          className="px-4 py-2 text-sm bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white rounded-xl transition-all duration-200 border border-gray-600/50 hover:border-gray-500/50"
        >
          {locale === 'ar' ? 'مسح' : 'Clear'}
        </button>
      </div>

      {/* Status Bar */}
      <div className="px-4 py-2 bg-gray-800/30 border-b border-white/5">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-400 font-medium">
            {locale === 'ar' 
              ? 'متصل - مدعوم بـ GPT-4 مع إدخال صوتي'
              : 'Online - Powered by GPT-4 with voice input'
            }
          </span>
        </div>
      </div>

      {/* Enhanced Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar min-h-[400px]">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] ${
                message.role === 'user' 
                  ? 'bg-gradient-to-br from-gray-700/80 to-gray-600/80 text-white ml-8' 
                  : 'bg-gradient-to-br from-gray-800/60 to-gray-700/60 text-gray-100 mr-8'
              } backdrop-blur-sm rounded-2xl p-4 border border-white/10 shadow-lg`}>
                
                {/* Message content */}
                <div className="space-y-3">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  
                  {/* Message footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <div className="flex items-center gap-3 text-xs">
                      {/* Timestamp */}
                      <span className="text-gray-400">
                        {message.timestamp.toLocaleTimeString(locale === 'ar' ? 'ar-SA' : 'en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      
                      {/* Sources indicator */}
                      {message.sources && message.sources.length > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="text-blue-400">📚</span>
                          <span className="text-blue-400">
                            {message.sources.length} {locale === 'ar' ? 'مصدر' : 'sources'}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Audio button for assistant messages */}
                    {message.role === 'assistant' && message.hasAudio && (
                      <button
                        onClick={() => handlePlayAudio(message.id, message.content)}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-600/50 hover:bg-gray-500/50 text-gray-300 hover:text-white rounded-lg transition-all duration-200"
                      >
                        <span>{isPlaying === message.id ? '⏸️' : '🔊'}</span>
                        <span>{isPlaying === message.id ? (locale === 'ar' ? 'إيقاف' : 'Stop') : (locale === 'ar' ? 'استمع' : 'Listen')}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Enhanced Loading indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="max-w-[85%] bg-gradient-to-br from-gray-800/60 to-gray-700/60 backdrop-blur-sm rounded-2xl p-4 border border-white/10 shadow-lg mr-8">
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-sm text-gray-400">
                  {locale === 'ar' ? 'جاري البحث والتحليل...' : 'Searching and analyzing...'}
                </span>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Enhanced Suggested Questions */}
      {messages.length === 1 && (
        <div className="p-4 border-t border-white/10 bg-gradient-to-r from-gray-800/30 to-gray-700/30">
          <p className="text-white font-medium text-sm mb-3 flex items-center gap-2">
            <span>💡</span>
            {locale === 'ar' ? 'أسئلة مقترحة:' : 'Suggested questions:'}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {suggestedQuestions.map((question, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleSendMessage(question)}
                className="text-left p-3 bg-gray-700/40 hover:bg-gray-600/50 text-gray-300 hover:text-white rounded-xl transition-all duration-200 text-sm border border-gray-600/30 hover:border-gray-500/50"
              >
                <span className="text-gray-400 mr-2">→</span>
                {question}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Input Area */}
      <div className="p-4 border-t border-white/10 bg-gradient-to-r from-gray-800/30 to-gray-700/30">
        <form onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(input);
        }} className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={locale === 'ar' ? 'اكتب سؤالك هنا...' : 'Type your question here...'}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-gray-500/70 focus:bg-gray-700/50 transition-all duration-200"
              disabled={isRecording}
            />
            {input.trim() && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                {input.length}/500
              </div>
            )}
          </div>
          
          {/* Voice input button */}
          <button
            type="button"
            onClick={handleVoiceInput}
            className={`p-3 rounded-xl transition-all duration-200 ${
              isRecording 
                ? 'bg-red-500/80 hover:bg-red-500 text-white border border-red-400/50' 
                : 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white border border-gray-600/50'
            }`}
            title={isRecording ? (locale === 'ar' ? 'إيقاف التسجيل' : 'Stop recording') : (locale === 'ar' ? 'بدء التسجيل' : 'Start recording')}
          >
            {isRecording ? '⏹️' : '🎤'}
          </button>
          
          {/* Send button */}
          <button
            type="submit"
            disabled={isLoading || isRecording || !input.trim()}
            className="p-3 bg-gray-700/50 hover:bg-gray-600/50 disabled:bg-gray-800/50 text-gray-300 hover:text-white disabled:text-gray-500 rounded-xl transition-all duration-200 border border-gray-600/50 hover:border-gray-500/50 disabled:border-gray-700/50"
          >
            {isLoading ? '⏳' : '↗'}
          </button>
        </form>
      </div>

      {/* Enhanced Features Info */}
      <div className="p-3 text-center border-t border-white/5 bg-gray-800/20">
        <div className="text-xs text-gray-400 flex items-center justify-center gap-4">
          <span className="flex items-center gap-1">
            <span>✨</span>
            {locale === 'ar' ? 'مدعوم بـ GPT-4' : 'Powered by GPT-4'}
          </span>
          <span className="flex items-center gap-1">
            <span>🎤</span>
            {locale === 'ar' ? 'إدخال صوتي' : 'Voice input'}
          </span>
          <span className="flex items-center gap-1">
            <span>🔊</span>
            {locale === 'ar' ? 'إجابات صوتية' : 'Audio responses'}
          </span>
        </div>
      </div>
    </div>
  );
} 