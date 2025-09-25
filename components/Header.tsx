import Link from 'next/link'
import WalletButton from './WalletButton'

export default function Header() {
  return (
    <header className="bg-gray-900/80 backdrop-blur-md border-b border-gray-700/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center group">
            <img 
              src="/images/CTDHUB.png" 
              alt="CTDHub - Learn, Build, Earn" 
              className="h-48 w-auto hover:opacity-90 transition-opacity duration-300"
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

          <WalletButton />
        </div>
      </div>
    </header>
  )
}