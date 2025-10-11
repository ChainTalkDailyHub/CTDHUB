import Image from 'next/image'
import { FaTelegram, FaTwitter, FaYoutube, FaCoins } from 'react-icons/fa'
import { LOGO_DEFAULT_PROPS } from '../lib/logo'

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-24 transition-colors duration-300" role="contentinfo">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <div className="mb-6">
              <img 
                src={LOGO_DEFAULT_PROPS.src}
                alt={LOGO_DEFAULT_PROPS.alt}
                className="h-24 w-auto"
              />
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-4">
              Your gateway to blockchain education and Web3 development.
            </p>
            <div className="bnb-badge">
              <Image src="/bnb-logo.png" alt="BNB Smart Chain" width={20} height={20} />
              <span>Built on BNB Chain</span>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li><a href="/courses" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-yellow-400 transition-colors">📚 Courses</a></li>
              <li><a href="/quiz" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-yellow-400 transition-colors">🧠 Quiz</a></li>
              <li><a href="/binno-ai" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-yellow-400 transition-colors">🤖 Binno AI</a></li>
              <li><a href="/dev" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-yellow-400 transition-colors">⚙️ Creator Studio</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Connect</h4>
            <ul className="space-y-3">
              <li>
                <a href="https://t.me/chaintalk_cto" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-yellow-400 transition-colors flex items-center gap-3">
                  <FaTelegram className="w-5 h-5" /> Telegram
                </a>
              </li>
              <li>
                <a href="https://x.com/chaintalk_cto" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-yellow-400 transition-colors flex items-center gap-3">
                  <FaTwitter className="w-5 h-5" /> X (Twitter)
                </a>
              </li>
              <li>
                <a href="https://www.coingecko.com/en/coins/chain-talk-daily" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-yellow-400 transition-colors flex items-center gap-3">
                  <FaCoins className="w-5 h-5" /> CoinGecko
                </a>
              </li>
              <li>
                <a href="https://www.youtube.com/@ChainTalkDaily-CTO" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-yellow-400 transition-colors flex items-center gap-3">
                  <FaYoutube className="w-5 h-5" /> YouTube
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 mt-12 pt-8 text-center">
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            © 2025 <span className="text-gradient-yellow-orange font-semibold">CTD HUB</span>. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

