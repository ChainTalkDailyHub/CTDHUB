import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import WalletButton from './WalletButton'
import UserMenu from './UserMenuSimple'
import ThemeToggle from './ThemeToggle'
import { LOGO_DEFAULT_PROPS, LOGO_FALLBACK_TEXT } from '../lib/logo'

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [userAddress, setUserAddress] = useState('')
  
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)
  
  useEffect(() => {
    const stored = localStorage.getItem('ctdhub:wallet')
    if (stored) {
      setIsConnected(true)
      setUserAddress(stored)
    }

    // Listen for wallet connection changes
    const handleStorageChange = () => {
      const wallet = localStorage.getItem('ctdhub:wallet')
      if (wallet) {
        setIsConnected(true)
        setUserAddress(wallet)
      } else {
        setIsConnected(false)
        setUserAddress('')
        setIsUserMenuOpen(false)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])
  
  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <div className="h-[2px] w-full bg-gradient-to-r from-yellow-400 via-purple-500 to-blue-500 opacity-80"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="flex items-center group">
            <div className="relative">
              <img 
                src={LOGO_DEFAULT_PROPS.src}
                alt={LOGO_DEFAULT_PROPS.alt}
                className="h-32 w-auto hover:opacity-90 transition-opacity duration-300"
                onError={(e) => {
                  console.log('Logo failed to load, showing fallback');
                  const target = e.target as HTMLElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
                onLoad={() => {
                  console.log('CTDHUB logo loaded successfully');
                }}
              />
              <div 
                className="hidden h-32 items-center justify-center px-6 bg-gradient-to-r from-ctd-yellow to-ctd-holo text-black font-bold text-3xl rounded-lg hover:opacity-90 transition-opacity duration-300"
                style={{ display: 'none' }}
              >
                {LOGO_FALLBACK_TEXT}
              </div>
            </div>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 transition-colors font-medium">
              Home
            </Link>
            <Link href="/courses" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 transition-colors font-medium">
              Courses
            </Link>
            <Link href="/binno-ai" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-yellow-400 transition-colors font-medium">
              Binno AI
            </Link>
            {isConnected && (
              <>
                <Link href="/quiz" className="relative group text-ctd-mute dark:text-ctd-mute-dark hover:text-ctd-text dark:hover:text-ctd-text-dark transition-colors duration-300 py-2">
                  <span className="relative z-10">Quiz</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-ctd-yellow/0 to-ctd-holo/0 group-hover:from-ctd-yellow/10 group-hover:to-ctd-holo/10 rounded-lg transition-all duration-300 -mx-2"></div>
                </Link>
                <Link href="/questionnaire" className="relative group text-ctd-mute dark:text-ctd-mute-dark hover:text-ctd-text dark:hover:text-ctd-text-dark transition-colors duration-300 py-2">
                  <span className="relative z-10">CTD Skill Compass</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-ctd-yellow/0 to-ctd-holo/0 group-hover:from-ctd-yellow/10 group-hover:to-ctd-holo/10 rounded-lg transition-all duration-300 -mx-2"></div>
                </Link>
                <Link href="/dev" className="relative group text-ctd-mute dark:text-ctd-mute-dark hover:text-ctd-text dark:hover:text-ctd-text-dark transition-colors duration-300 py-2">
                  <span className="relative z-10">Creator Studio</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-ctd-yellow/0 to-ctd-holo/0 group-hover:from-ctd-yellow/10 group-hover:to-ctd-holo/10 rounded-lg transition-all duration-300 -mx-2"></div>
                </Link>
              </>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <WalletButton />
            
            {/* User Menu Hamburger Button - Only show when connected */}
            {isConnected && (
              <button
                onClick={() => setIsUserMenuOpen(true)}
                className="relative p-3 rounded-lg bg-gradient-to-r from-ctd-yellow/20 to-ctd-holo/20 border border-ctd-border dark:border-ctd-border-dark text-ctd-yellow hover:text-ctd-holo hover:from-ctd-yellow/30 hover:to-ctd-holo/30 hover:border-ctd-yellow/50 transition-all duration-300 group"
                aria-label="Abrir menu do usuário"
                title="Menu do Usuário"
              >
                {/* Hamburger Icon */}
                <div className="flex flex-col space-y-1">
                  <div className="w-5 h-0.5 bg-current rounded-full group-hover:scale-110 transition-transform"></div>
                  <div className="w-5 h-0.5 bg-current rounded-full group-hover:scale-110 transition-transform"></div>
                  <div className="w-5 h-0.5 bg-current rounded-full group-hover:scale-110 transition-transform"></div>
                </div>
                
                {/* Status indicator */}
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-ctd-holo rounded-full border-2 border-ctd-bg dark:border-ctd-bg-dark animate-pulse"></div>
              </button>
            )}
            
            {/* Mobile menu button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-lg text-ctd-mute dark:text-ctd-mute-dark hover:text-ctd-text dark:hover:text-ctd-text-dark hover:bg-ctd-panel dark:hover:bg-ctd-panel-dark/50 transition-colors"
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
          <div className="md:hidden bg-ctd-panel dark:bg-ctd-panel-dark/95 backdrop-blur-md border-t border-ctd-border dark:border-ctd-border-dark/50">
            <div className="px-4 py-4 space-y-2">
              <Link
                href="/"
                className="block px-4 py-3 text-ctd-mute dark:text-ctd-mute-dark hover:text-ctd-text dark:hover:text-ctd-text-dark hover:bg-ctd-panel dark:hover:bg-ctd-panel-dark/50 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                🏠 Home
              </Link>
              <Link
                href="/courses"
                className="block px-4 py-3 text-ctd-mute dark:text-ctd-mute-dark hover:text-ctd-text dark:hover:text-ctd-text-dark hover:bg-ctd-panel dark:hover:bg-ctd-panel-dark/50 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                📚 Courses
              </Link>
              <Link
                href="/binno-ai"
                className="block px-4 py-3 text-ctd-mute dark:text-ctd-mute-dark hover:text-ctd-text dark:hover:text-ctd-text-dark hover:bg-ctd-panel dark:hover:bg-ctd-panel-dark/50 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                🤖 AI Chat
              </Link>
              {isConnected && (
                <>
                  <Link
                    href="/quiz"
                    className="block px-4 py-3 text-ctd-mute dark:text-ctd-mute-dark hover:text-ctd-text dark:hover:text-ctd-text-dark hover:bg-ctd-panel dark:hover:bg-ctd-panel-dark/50 rounded-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    🎯 Quiz
                  </Link>
                  <Link
                    href="/questionnaire"
                    className="block px-4 py-3 text-ctd-mute dark:text-ctd-mute-dark hover:text-ctd-text dark:hover:text-ctd-text-dark hover:bg-ctd-panel dark:hover:bg-ctd-panel-dark/50 rounded-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    🧭 CTD Skill Compass
                  </Link>
                  <Link
                    href="/dev"
                    className="block px-4 py-3 text-ctd-mute dark:text-ctd-mute-dark hover:text-ctd-text dark:hover:text-ctd-text-dark hover:bg-ctd-panel dark:hover:bg-ctd-panel-dark/50 rounded-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    ⚙️ Creator Studio
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* User Menu Sidebar */}
      <UserMenu 
        isOpen={isUserMenuOpen}
        onClose={() => setIsUserMenuOpen(false)}
        userAddress={userAddress}
      />
    </header>
  )
}