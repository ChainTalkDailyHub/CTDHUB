import Image from 'next/image'
import { FaTelegram, FaTwitter, FaYoutube, FaCoins } from 'react-icons/fa'
import { LOGO_DEFAULT_PROPS } from '../lib/logo'

export default function Footer() {
  return (
    <footer className="bg-ctd-panel/50 backdrop-blur-sm border-t border-ctd-border mt-24" role="contentinfo">
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
            <p className="text-ctd-mute text-lg leading-relaxed">
              Your gateway to blockchain education and Web3 development.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-ctd-text mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li><a href="/courses" className="text-ctd-mute hover:text-ctd-yellow transition-colors">Courses</a></li>
              <li><a href="/quiz" className="text-ctd-mute hover:text-ctd-yellow transition-colors">Quiz</a></li>
              <li><a href="/binno-ai" className="text-ctd-mute hover:text-ctd-yellow transition-colors">Binno AI</a></li>
              <li><a href="/dev" className="text-ctd-mute hover:text-ctd-yellow transition-colors">Dev Area</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-ctd-text mb-6">Connect</h4>
            <ul className="space-y-3">
              <li>
                <a href="https://t.me/chaintalk_cto" target="_blank" rel="noopener noreferrer" className="text-ctd-mute hover:text-ctd-yellow transition-colors flex items-center gap-3">
                  <FaTelegram className="w-5 h-5" /> Telegram
                </a>
              </li>
              <li>
                <a href="https://x.com/chaintalk_cto" target="_blank" rel="noopener noreferrer" className="text-ctd-mute hover:text-ctd-yellow transition-colors flex items-center gap-3">
                  <FaTwitter className="w-5 h-5" /> X (Twitter)
                </a>
              </li>
              <li>
                <a href="https://www.coingecko.com/en/coins/chain-talk-daily" target="_blank" rel="noopener noreferrer" className="text-ctd-mute hover:text-ctd-yellow transition-colors flex items-center gap-3">
                  <FaCoins className="w-5 h-5" /> CoinGecko
                </a>
              </li>
              <li>
                <a href="https://www.youtube.com/@ChainTalkDaily-CTO" target="_blank" rel="noopener noreferrer" className="text-ctd-mute hover:text-ctd-yellow transition-colors flex items-center gap-3">
                  <FaYoutube className="w-5 h-5" /> YouTube
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-ctd-border/50 mt-12 pt-8 text-center">
          <p className="text-ctd-mute text-lg">
            © 2025 <span className="text-ctd-yellow font-semibold">CTDHUB</span>. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}