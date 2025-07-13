import { useTranslation } from 'next-i18next';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface ProjectTag {
  label: string;
  color: string;
}

export default function ProjectStack() {
  const { t } = useTranslation();
  
  const [imageError, setImageError] = useState<{[key: string]: boolean}>({});
  const [expandedLayer, setExpandedLayer] = useState<string | null>(null);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);

  const handleImageError = (projectKey: string) => {
    setImageError(prev => ({...prev, [projectKey]: true}));
  };

  const toggleLayer = (layerId: string) => {
    setExpandedLayer(expandedLayer === layerId ? null : layerId);
    setExpandedProject(null);
  };

  const toggleProject = (projectKey: string) => {
    setExpandedProject(expandedProject === projectKey ? null : projectKey);
  };

  const projectTags: {[key: string]: ProjectTag[]} = {
    milarity: [
      { label: 'Cloud Infrastructure', color: 'bg-gray-400/60' },
      { label: 'AI Analytics', color: 'bg-gray-400/60' }
    ],
    nasa: [
      { label: 'Space Tech', color: 'bg-gray-400/60' },
      { label: '3D Visualization', color: 'bg-gray-400/60' }
    ],
    aramco: [
      { label: 'IoT', color: 'bg-gray-400/60' },
      { label: 'Safety', color: 'bg-gray-400/60' }
    ],
    bci: [
      { label: 'Neural Signals', color: 'bg-gray-400/60' },
      { label: 'Arabic NLP', color: 'bg-gray-400/60' }
    ],
    liveness: [
      { label: 'Computer Vision', color: 'bg-gray-400/60' },
      { label: 'Deep Learning', color: 'bg-gray-400/60' }
    ],
    siraj: [
      { label: 'Voice AI', color: 'bg-gray-400/60' },
      { label: 'Arabic Assistant', color: 'bg-gray-400/60' }
    ],
    poetry: [
      { label: 'Creative AI', color: 'bg-gray-400/60' },
      { label: 'Arabic Art', color: 'bg-gray-400/60' }
    ]
  };

  const projectIcons: {[key: string]: string} = {
    milarity: '☁️',
    nasa: '🚀',
    aramco: '🏭',
    bci: '🧠',
    liveness: '👁️',
    siraj: '🎤',
    poetry: '🎨'
  };

  const layerIcons: {[key: string]: string} = {
    infra: '🏗️',
    data: '📊',
    models: '🤖',
    apps: '📱'
  };

  const layers = [
    {
      id: 'infra',
      title: t('projects.layer1'),
      projects: ['milarity'],
      description: 'Infrastructure & Cloud Services',
      gradient: 'from-gray-500/15 to-gray-600/15'
    },
    {
      id: 'data',
      title: t('projects.layer2'),
      projects: ['nasa', 'aramco'],
      description: 'Data Processing & Analytics',
      gradient: 'from-gray-500/15 to-gray-600/15'
    },
    {
      id: 'models',
      title: t('projects.layer3'),
      projects: ['bci', 'liveness'],
      description: 'AI Models & Computer Vision',
      gradient: 'from-gray-500/15 to-gray-600/15'
    },
    {
      id: 'apps',
      title: t('projects.layer4'),
      projects: ['siraj', 'poetry'],
      description: 'Applications & User Interfaces',
      gradient: 'from-gray-500/15 to-gray-600/15'
    }
  ];

  return (
    <div className="space-y-4">
      {layers.map((layer) => (
        <motion.div
          key={layer.id}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/60 to-gray-800/40 backdrop-blur-xl border border-white/10 shadow-2xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {/* Gradient Background */}
          <div className={`absolute inset-0 bg-gradient-to-r ${layer.gradient} opacity-50`} />
          
          {/* Layer Header */}
          <motion.button
            onClick={() => toggleLayer(layer.id)}
            className="relative w-full flex items-center gap-3 p-5 hover:bg-white/5 transition-all duration-300 group"
            whileHover={{ scale: 1.005 }}
            whileTap={{ scale: 0.995 }}
          >
            {/* Icon with unified light styling */}
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-400/20 to-gray-500/20 backdrop-blur-sm border border-gray-400/30 text-2xl shadow-lg group-hover:shadow-gray-400/20 transition-all duration-300">
              <span className="drop-shadow-lg filter grayscale brightness-125">{layerIcons[layer.id]}</span>
            </div>
            
            {/* Text Content with improved spacing */}
            <div className="flex-1 text-left ml-1">
              <h3 className="text-xl font-bold text-white group-hover:text-red-400 transition-colors duration-300 mb-1">
                {layer.title}
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                {layer.description} • {layer.projects.length} {layer.projects.length === 1 ? 'Project' : 'Projects'}
              </p>
            </div>
            
            {/* Animated Arrow */}
            <motion.div
              animate={{ rotate: expandedLayer === layer.id ? 180 : 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="text-red-400 p-2 rounded-full hover:bg-red-500/10 transition-colors duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </motion.div>
          </motion.button>

          {/* Expanded Layer Content */}
          <AnimatePresence>
            {expandedLayer === layer.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="relative bg-gradient-to-b from-black/20 to-black/40 backdrop-blur-sm border-t border-white/10">
                  <div className="p-5 space-y-3">
                    {layer.projects.map((projectKey) => (
                      <div key={projectKey} className="relative">
                        {/* Project Header */}
                        <motion.button
                          onClick={() => toggleProject(projectKey)}
                          className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-white/5 transition-all duration-300 group border border-transparent hover:border-white/10"
                          whileHover={{ scale: 1.002 }}
                          whileTap={{ scale: 0.998 }}
                        >
                          {/* Project Icon - unified light color */}
                          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-gray-400/20 to-gray-500/20 backdrop-blur-sm border border-gray-400/20 text-lg shadow-md group-hover:shadow-gray-400/20 transition-all duration-300">
                            <span className="drop-shadow-sm filter grayscale brightness-125">{projectIcons[projectKey]}</span>
                          </div>
                          
                          {/* Project Title and Tags - closer to icon */}
                          <div className="flex-1 text-left">
                            <h4 className="text-lg font-semibold text-white group-hover:text-red-400 transition-colors duration-300 mb-2">
                              {t(`projects.${projectKey}.title`)}
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {projectTags[projectKey].slice(0, 2).map((tag, index) => (
                                <span
                                  key={index}
                                  className={`${tag.color} px-3 py-1 rounded-full text-xs font-medium text-white backdrop-blur-sm border border-white/10 shadow-sm`}
                                >
                                  {tag.label}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          {/* Expand Arrow */}
                          <motion.div
                            animate={{ rotate: expandedProject === projectKey ? 180 : 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="text-red-400 p-2 rounded-full hover:bg-red-500/10 transition-colors duration-300"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </motion.div>
                        </motion.button>

                        {/* Project Details */}
                        <AnimatePresence>
                          {expandedProject === projectKey && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: "easeInOut" }}
                              className="overflow-hidden"
                            >
                              <div className="ml-3 mt-3 p-5 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl border border-white/10 shadow-xl">
                                <div className="grid md:grid-cols-2 gap-5">
                                  {/* Project Image */}
                                  <div className="relative h-44 rounded-xl overflow-hidden shadow-lg">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
                                    {!imageError[projectKey] ? (
                                      <Image
                                        src={`/images/${projectKey}.png`}
                                        alt={t(`projects.${projectKey}.title`)}
                                        fill
                                        className="object-cover transition-transform duration-500 hover:scale-105"
                                        onError={() => handleImageError(projectKey)}
                                      />
                                    ) : (
                                      <div className="absolute inset-0 flex items-center justify-center bg-gray-800/80 backdrop-blur-sm text-gray-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Project Info */}
                                  <div className="space-y-4">
                                    <p className="text-gray-300 text-sm leading-relaxed">
                                      {t(`projects.${projectKey}.desc`)}
                                    </p>
                                    
                                    <div className="flex flex-wrap gap-2">
                                      {projectKey === 'siraj' && (
                                        <Link
                                          href="#playground"
                                          className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-xl bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-400 hover:from-red-500/30 hover:to-red-600/30 transition-all duration-300 border border-red-400/20 hover:border-red-400/40 backdrop-blur-sm shadow-lg hover:shadow-red-500/20"
                                        >
                                          <span>{t('projects.see_demo')}</span>
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                          </svg>
                                        </Link>
                                      )}
                                      <Link
                                        href={t(`projects.${projectKey}.github`)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-xl bg-gradient-to-r from-gray-700/50 to-gray-800/50 text-gray-300 hover:from-gray-700/70 hover:to-gray-800/70 hover:text-white transition-all duration-300 border border-gray-600/20 hover:border-gray-500/40 backdrop-blur-sm shadow-lg hover:shadow-gray-500/20"
                                      >
                                        <span>{t('projects.view_code')}</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                        </svg>
                                      </Link>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
} 