interface SeoProps {
  title: string
  description: string
  image?: string
  url?: string
  locale?: string
  type?: string
}

export const defaultSeo = {
  titleTemplate: '%s | Raneem Althaqafi',
  defaultTitle: 'Raneem Althaqafi – AI Portfolio',
  description: {
    ar: 'رنيم الثقفي – مبتكرة ذكاء اصطناعي ومطوّرة متكاملة، تمزج التقنية بالفن.',
    en: 'Raneem Althaqafi – AI innovator and full-stack developer blending technology with Art.'
  },
  openGraph: {
    type: 'website',
    locale: 'ar_SA',
    url: 'https://raneem.ai/',
    site_name: 'Raneem Althaqafi',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Raneem Althaqafi'
      }
    ]
  },
  twitter: {
    handle: '@raneemdev',
    site: '@raneemdev',
    cardType: 'summary_large_image'
  }
}

export function getSeoProps(props: Partial<SeoProps> = {}): SeoProps {
  const {
    title,
    description,
    image = defaultSeo.openGraph.images[0].url,
    url = defaultSeo.openGraph.url,
    locale = defaultSeo.openGraph.locale,
    type = defaultSeo.openGraph.type
  } = props

  return {
    title: title
      ? `${title} | ${defaultSeo.defaultTitle}`
      : defaultSeo.defaultTitle,
    description: description || defaultSeo.description[locale.startsWith('ar') ? 'ar' : 'en'],
    image,
    url,
    locale,
    type
  }
}

export function getStructuredData(locale: string = 'ar') {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Raneem Althaqafi',
    url: defaultSeo.openGraph.url,
    image: defaultSeo.openGraph.images[0].url,
    sameAs: [
      'https://linkedin.com/in/raneem-althaqafi',
      'https://github.com/RaneemQasim5251'
    ],
    jobTitle: locale === 'ar'
      ? 'مهندسة ذكاء اصطناعي ومطورة متكاملة'
      : 'AI Engineer & Full-stack Developer',
    description: defaultSeo.description[locale === 'ar' ? 'ar' : 'en'],
    knowsLanguage: ['ar', 'en'],
    alumniOf: {
      '@type': 'Organization',
      name: locale === 'ar' ? 'جامعة أم القرى' : 'Umm Al-Qura University'
    }
  }
} 