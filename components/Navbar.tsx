import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import { useTranslation } from 'next-i18next'
import MobileMenu from './MobileMenu'

export default function Navbar() {
  const router = useRouter()
  const { t } = useTranslation('common')
  const { locale } = router
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleLanguage = () => {
    const newLocale = locale === 'ar' ? 'en' : 'ar'
    router.push(router.pathname, router.asPath, { locale: newLocale })
  }

  const navItems = [
    { key: 'chapters', href: '#about' },
    { key: 'projects', href: '#projects' },
    { key: 'playground', href: '#playground' },
    { key: 'contact', href: '#contact' }
  ]

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-black bg-opacity-50 backdrop-blur-lg"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Name */}
            <motion.a
              href="#"
              className="text-xl font-bold text-white"
              whileHover={{ scale: 1.05 }}
            >
              {locale === 'ar' ? 'رنيم الثقفي' : 'Raneem Althaqafi'}
            </motion.a>

            {/* Navigation Links - Desktop */}
            <div className="hidden md:flex items-center space-x-4 rtl:space-x-reverse">
              {navItems.map((item) => (
                <a
                  key={item.key}
                  href={item.href}
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {t(`nav.${item.key}`)}
                </a>
              ))}
            </div>

            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              {/* Language Toggle */}
              <button
                onClick={toggleLanguage}
                className="px-4 py-2 text-sm font-medium text-white bg-primary bg-opacity-50 rounded hover:bg-opacity-75 transition-colors"
              >
                {locale === 'ar' ? 'English' : 'العربية'}
              </button>

              {/* Mobile Menu Button */}
              <button
                className="md:hidden text-gray-400 hover:text-white"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        navItems={navItems}
      />
    </>
  )
}