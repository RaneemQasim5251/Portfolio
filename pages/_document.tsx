import React from 'react'
import { Html, Head, Main, NextScript } from 'next/document'
import type { DocumentProps } from 'next/document'

export default function Document({ __NEXT_DATA__ }: DocumentProps) {
  const locale = __NEXT_DATA__?.locale || 'ar'
  
  return (
    <Html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&family=Inter:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
        <meta name="description" content={
          locale === 'ar' 
            ? "رنيم الثقفي – مبتكرة ذكاء اصطناعي ومطوّرة متكاملة، تمزج التقنية بالفن."
            : "Raneem Althaqafi – AI innovator and full-stack developer blending technology with Art."
        } />
      </Head>
      <body className={locale === 'ar' ? 'font-arabic' : 'font-sans'}>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
} 