import Image from 'next/image'
import { FaTelegram, FaTwitter, FaYoutube, FaCoins } from 'react-icons/fa'

export default function Footer() {
  return (
    <footer className="bg-gray-900/50 backdrop-blur-sm border-t border-gray-800/50 mt-24" role="contentinfo">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <div className="mb-6">
              <img 
                src="/images/CTDHUB.png" 
                alt="CTDHUB - Blockchain Learning Platform" 
                className="h-24 w-auto"
              />
            </div>
            <p className="text-gray-400 text-lg leading-relaxed">
              Your gateway to blockchain education and Web3 development.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-white mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li><a href="/courses" className="text-gray-400 hover:text-yellow-400 transition-colors">Courses</a></li>
              <li><a href="/quiz" className="text-gray-400 hover:text-yellow-400 transition-colors">Quiz</a></li>
              <li><a href="/binno-ai" className="text-gray-400 hover:text-yellow-400 transition-colors">Binno AI</a></li>
              <li><a href="/dev" className="text-gray-400 hover:text-yellow-400 transition-colors">Dev Area</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-white mb-6">Connect</h4>
            <ul className="space-y-3">
              <li>
                <a href="https://t.me/ctdhub" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-yellow-400 transition-colors flex items-center gap-3">
                  <FaTelegram className="w-5 h-5" /> Telegram
                </a>
              </li>
              <li>
                <a href="https://x.com/ctdhub" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-yellow-400 transition-colors flex items-center gap-3">
                  <FaTwitter className="w-5 h-5" /> X (Twitter)
                </a>
              </li>
              <li>
                <a href="https://coingecko.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-yellow-400 transition-colors flex items-center gap-3">
                  <FaCoins className="w-5 h-5" /> CoinGecko
                </a>
              </li>
              <li>
                <a href="https://youtube.com/@ctdhub" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-yellow-400 transition-colors flex items-center gap-3">
                  <FaYoutube className="w-5 h-5" /> YouTube
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800/50 mt-12 pt-8 text-center">
          <p className="text-gray-400 text-lg">
            © 2025 <span className="text-[#FFC700] font-semibold">CTDHUB</span>. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}