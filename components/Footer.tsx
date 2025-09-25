export default function Footer() {
  return (
    <footer className="bg-gray-900/50 backdrop-blur-sm border-t border-gray-800/50 mt-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <div className="mb-6">
              <img 
                src="/images/CTDHUB.png" 
                alt="CTDHub - Learn, Build, Earn" 
                className="h-20 w-auto"
              />
            </div>
            <p className="text-gray-400 text-lg leading-relaxed">
              Your gateway to blockchain education and Web3 development.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-white mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li><a href="/courses" className="text-gray-400 hover:text-[#FFC700] transition-colors duration-200 text-lg">Courses</a></li>
              <li><a href="/quiz" className="text-gray-400 hover:text-[#FFC700] transition-colors duration-200 text-lg">Quiz</a></li>
              <li><a href="/binno-ai" className="text-gray-400 hover:text-[#FFC700] transition-colors duration-200 text-lg">Binno AI</a></li>
              <li><a href="/developer" className="text-gray-400 hover:text-[#FFC700] transition-colors duration-200 text-lg">Dev Area</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-white mb-6">Connect</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-[#FFC700] transition-colors duration-200 text-lg">Twitter</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#FFC700] transition-colors duration-200 text-lg">Discord</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#FFC700] transition-colors duration-200 text-lg">GitHub</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800/50 mt-12 pt-8 text-center">
          <p className="text-gray-400 text-lg">
            © 2024 <span className="text-[#FFC700] font-semibold">CTDHub</span>. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}