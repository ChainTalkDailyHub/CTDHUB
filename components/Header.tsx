import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import WalletButton from './WalletButton'

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)
  
  return (
    <header className="bg-gray-900/80 backdrop-blur-md border-b border-gray-700/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center group">
            <Image 
              src="/images/CTDHUB.png" 
              alt="CTDHub - Blockchain Learning Platform" 
              width={120}
              height={48}
              priority
              className="h-12 w-auto hover:opacity-90 transition-opacity duration-300"
            />
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/courses" className="relative group text-gray-300 hover:text-white transition-colors duration-300 py-2">
              <span className="relative z-10">Courses</span>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 to-orange-500/0 group-hover:from-yellow-400/10 group-hover:to-orange-500/10 rounded-lg transition-all duration-300 -mx-2"></div>
            </Link>
            <Link href="/quiz" className="relative group text-gray-300 hover:text-white transition-colors duration-300 py-2">
              <span className="relative z-10">Quiz</span>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 to-orange-500/0 group-hover:from-yellow-400/10 group-hover:to-orange-500/10 rounded-lg transition-all duration-300 -mx-2"></div>
            </Link>
            <Link href="/binno-ai" className="relative group text-gray-300 hover:text-white transition-colors duration-300 py-2">
              <span className="relative z-10">Binno AI</span>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 to-orange-500/0 group-hover:from-yellow-400/10 group-hover:to-orange-500/10 rounded-lg transition-all duration-300 -mx-2"></div>
            </Link>
            <Link href="/developer" className="relative group text-gray-300 hover:text-white transition-colors duration-300 py-2">
              <span className="relative z-10">Dev Area</span>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 to-orange-500/0 group-hover:from-yellow-400/10 group-hover:to-orange-500/10 rounded-lg transition-all duration-300 -mx-2"></div>
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <WalletButton />
            
            {/* Mobile menu button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors"
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-gray-900/95 backdrop-blur-md border-t border-gray-700/50">
            <div className="px-4 py-4 space-y-2">
              <Link
                href="/courses"
                className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                📚 Courses
              </Link>
              <Link
                href="/quiz"
                className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                🧠 Quiz
              </Link>
              <Link
                href="/binno-ai"
                className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                🤖 Binno AI
              </Link>
              <Link
                href="/developer"
                className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                ⚙️ Dev Area
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}