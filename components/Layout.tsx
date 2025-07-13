import React from 'react'
import { useRouter } from 'next/router'
import Navbar from './Navbar'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { locale } = useRouter()

  return (
    <div className={`min-h-screen bg-darkbg ${locale === 'ar' ? 'font-arabic' : 'font-sans'}`}>
      <Navbar />
      <main className="pt-16">
        {children}
      </main>
      <footer className="bg-black bg-opacity-90 text-white py-8 text-center">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Raneem Althaqafi
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Built with Next.js + Tailwind CSS + AI
          </p>
        </div>
      </footer>
    </div>
  )
}