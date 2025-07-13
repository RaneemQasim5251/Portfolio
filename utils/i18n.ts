import { useRouter } from 'next/router'

export function getDirection(locale?: string) {
  return locale === 'ar' ? 'rtl' : 'ltr'
}

export function getFontClass(locale?: string) {
  return locale === 'ar' ? 'font-arabic' : 'font-sans'
}

export function useLanguageToggle() {
  const router = useRouter()
  const { locale, pathname, asPath, query } = router

  const toggleLanguage = () => {
    const newLocale = locale === 'ar' ? 'en' : 'ar'
    router.push({ pathname, query }, asPath, { locale: newLocale })
  }

  return {
    currentLocale: locale,
    isArabic: locale === 'ar',
    toggleLanguage
  }
}

export const dateFormatter = {
  ar: new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }),
  en: new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function formatDate(date: Date, locale = 'ar') {
  return dateFormatter[locale as keyof typeof dateFormatter].format(date)
}

export function getPlaceholder(field: string, locale = 'ar') {
  const placeholders = {
    name: {
      ar: 'الاسم',
      en: 'Name'
    },
    email: {
      ar: 'البريد الإلكتروني',
      en: 'Email'
    },
    message: {
      ar: 'رسالتك',
      en: 'Your message'
    }
  }

  return placeholders[field as keyof typeof placeholders]?.[locale as 'ar' | 'en'] || ''
}