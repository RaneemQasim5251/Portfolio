import React from 'react'
import type { AppProps } from 'next/app'
import { appWithTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import Layout from '@/components/Layout'
import '../styles/globals.css'

// Initialize i18next
import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'

i18next
  .use(initReactI18next)
  .init({
    lng: 'ar', // default language
    fallbackLng: 'ar',
    interpolation: {
      escapeValue: false,
    },
  })

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter()
  
  React.useEffect(() => {
    // Update i18next language when route changes
    i18next.changeLanguage(router.locale || 'ar')
  }, [router.locale])

  return (
    <React.StrictMode>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </React.StrictMode>
  )
}

export default appWithTranslation(MyApp)