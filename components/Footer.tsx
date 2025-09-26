import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="bg-gray-900/50 backdrop-blur-sm border-t border-gray-800/50 mt-24" role="contentinfo">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <div className="mb-6">
              <div className="relative">
                <Image 
                  src="/images/CTDHUB.png" 
                  alt="CTDHUB - Blockchain Learning Platform" 
                  width={200}
                  height={100}
                  className="h-24 w-auto"
                  onError={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'block';
                  }}
                />
                <div 
                  className="hidden h-24 flex items-center justify-center px-6 bg-gradient-to-r from-[#FFC700] to-yellow-500 text-black font-bold text-3xl rounded-lg"
                  style={{ display: 'none' }}
                >
                  CTDHUB
                </div>
              </div>
            </div>
            <p className="text-gray-400 text-lg leading-relaxed">
              Your gateway to blockchain education and Web3 development.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-white mb-6">Quick Links</h4>
            <nav aria-label="Footer navigation">
              <ul className="space-y-3">
                <li><a href="/courses" className="text-gray-400 hover:text-[#FFC700] transition-colors duration-200 text-lg" aria-label="Browse blockchain courses">Courses</a></li>
                <li><a href="/quiz" className="text-gray-400 hover:text-[#FFC700] transition-colors duration-200 text-lg" aria-label="Take knowledge quizzes">Quiz</a></li>
                <li><a href="/binno-ai" className="text-gray-400 hover:text-[#FFC700] transition-colors duration-200 text-lg" aria-label="Chat with Binno AI assistant">Binno AI</a></li>
                <li><a href="/developer" className="text-gray-400 hover:text-[#FFC700] transition-colors duration-200 text-lg" aria-label="Access developer tools">Dev Area</a></li>
              </ul>
            </nav>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-white mb-6">Connect</h4>
            <nav aria-label="Social media links">
              <ul className="space-y-3">
                <li><a href="https://t.me/chaintalk_cto" className="text-gray-400 hover:text-[#FFC700] transition-colors duration-200 text-lg" aria-label="Join our Telegram channel" target="_blank" rel="noopener noreferrer">📱 Telegram</a></li>
                <li><a href="https://x.com/chaintalk_cto" className="text-gray-400 hover:text-[#FFC700] transition-colors duration-200 text-lg" aria-label="Follow us on X (Twitter)" target="_blank" rel="noopener noreferrer">🐦 X (Twitter)</a></li>
                <li><a href="https://www.coingecko.com/en/coins/chain-talk-daily" className="text-gray-400 hover:text-[#FFC700] transition-colors duration-200 text-lg" aria-label="View CTD on CoinGecko" target="_blank" rel="noopener noreferrer">🦎 CoinGecko</a></li>
                <li><a href="https://www.youtube.com/@ChainTalkDaily-CTO" className="text-gray-400 hover:text-[#FFC700] transition-colors duration-200 text-lg" aria-label="Subscribe to our YouTube channel" target="_blank" rel="noopener noreferrer">📺 YouTube</a></li>
              </ul>
            </nav>
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