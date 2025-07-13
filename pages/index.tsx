import React, { useEffect } from 'react'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { withErrorBoundary } from '@/components/ErrorBoundary'
import { useAnalytics } from '@/utils/analytics'
import { getSeoProps, getStructuredData } from '@/utils/seo'
import { fadeInUp, staggerChildren } from '@/utils/animations'
import { useLanguageToggle } from '@/utils/i18n'
import { theme } from '@/utils/theme'

// Dynamic imports for performance
const NeuronCanvas = dynamic(() => import('@/components/NeuronCanvas'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-darkbg" />
})

const Chapters = dynamic(() => import('@/components/Chapters'))
const ProjectStack = dynamic(() => import('@/components/ProjectStack'))
const PlaygroundTabs = dynamic(() => import('@/components/Playground/PlaygroundTabs'))
const ContactForm = dynamic(() => import('@/components/ContactForm'))

function Home() {
  const { t } = useTranslation('common')
  const router = useRouter()
  const { locale } = router
  const analytics = useAnalytics()

  useEffect(() => {
    // Initialize analytics
    analytics.trackPageView({
      path: router.asPath,
      title: t('meta.title'),
      locale: locale || 'ar'
    })
  }, [router.asPath, locale])

  const seoProps = getSeoProps({
    title: t('meta.title'),
    description: t('meta.description'),
    locale
  })

  return (
    <>
      <Head>
        <title>{seoProps.title}</title>
        <meta name="description" content={seoProps.description} />
        <meta property="og:title" content={seoProps.title} />
        <meta property="og:description" content={seoProps.description} />
        <meta property="og:image" content={seoProps.image} />
        <meta property="og:url" content={seoProps.url} />
        <meta property="og:type" content={seoProps.type} />
        <meta property="og:locale" content={seoProps.locale} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getStructuredData(locale))
          }}
        />
      </Head>

      <motion.div
        className="min-h-screen bg-darkbg text-white overflow-x-hidden"
        variants={staggerChildren}
        initial="initial"
        animate="animate"
      >
        {/* Landing Section */}
        <section id="landing" className="relative flex items-center justify-center h-screen">
          <NeuronCanvas />
          <div className="absolute text-center px-4 z-10">
            <motion.h1 
              className="text-4xl md:text-6xl font-bold mb-4"
              variants={fadeInUp}
            >
              {t('tagline')}
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl italic mb-8"
              variants={fadeInUp}
            >
              {t('subtagline')}
            </motion.p>
            <motion.div 
              className="flex gap-4 justify-center"
              variants={fadeInUp}
            >
              <a href="#about" className="btn-primary">
                {t('nav.chapters')}
              </a>
              <a href="#projects" className="btn-secondary">
                {t('buttons.projects')}
              </a>
              <a href="#playground" className="btn-secondary">
                {t('buttons.talk')}
              </a>
            </motion.div>
          </div>
        </section>

        {/* About Section - Chapters */}
        <section id="about" className="relative overflow-hidden">
          <Chapters />
        </section>

        {/* Projects Section */}
        <section id="projects" className="relative py-20 bg-black bg-opacity-80">
          <div className="container mx-auto px-4">
            <motion.h2
              className="text-3xl md:text-4xl font-bold text-center mb-12"
              variants={fadeInUp}
            >
              {t('projects.title')}
            </motion.h2>
            <ProjectStack />
          </div>
        </section>

        {/* AI Playground Section */}
        <section id="playground" className="relative py-20">
          <div className="container mx-auto px-4">
            <PlaygroundTabs />
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="relative py-20 bg-black bg-opacity-90">
          <div className="container mx-auto px-4">
            <motion.h2
              className="text-3xl md:text-4xl font-bold text-center mb-12"
              variants={fadeInUp}
            >
              {t('contact.title')}
            </motion.h2>
            <ContactForm />
          </div>
        </section>
      </motion.div>
    </>
  )
}

export const getStaticProps = async ({ locale = 'ar' }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common']))
    }
  }
}

export default withErrorBoundary(Home)