import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative py-24 lg:py-32 overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900"></div>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FFC700]/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#FFC700]/3 rounded-full blur-3xl"></div>
          
          <div className="relative max-w-7xl mx-auto px-6 lg:px-8 text-center">
            <div className="max-w-5xl mx-auto">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight">
                Master <span className="text-[#FFC700]">Blockchain</span> Development
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed max-w-4xl mx-auto">
                Learn Web3, build decentralized applications, and shape the future of technology with our comprehensive courses and AI-powered learning experience.
              </p>
              
              {/* Primary CTA */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
                <Link 
                  href="/courses" 
                  className="btn-primary text-lg"
                  aria-label="Start learning blockchain development"
                >
                  🚀 Start Learning
                </Link>
                <Link 
                  href="/quiz" 
                  className="btn-ghost"
                  aria-label="Take a quick quiz to test your knowledge"
                >
                  Take Quiz
                </Link>
                <Link 
                  href="/binno-ai" 
                  className="btn-ghost"
                  aria-label="Chat with Binno AI assistant"
                >
                  Try AI Assistant
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Trusted by / BNB Smart Chain Strip */}
        <section className="py-12 border-y border-gray-800/50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center">
              <p className="text-gray-400 text-sm font-medium mb-8">Powered by</p>
              <div className="flex justify-center items-center space-x-12">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-[#FFC700] rounded-full flex items-center justify-center">
                    <span className="text-black font-bold text-sm">B</span>
                  </div>
                  <span className="text-white font-semibold">BNB Smart Chain</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">W3</span>
                  </div>
                  <span className="text-white font-semibold">Web3 Ecosystem</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="py-24 lg:py-32">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">How it Works</h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Start your blockchain journey in three simple steps
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
              {/* Step 1 */}
              <div className="text-center group">
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-[#FFC700] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                    <span className="text-black font-bold text-2xl">1</span>
                  </div>
                  <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-[#FFC700] to-transparent"></div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Choose Your Path</h3>
                <p className="text-gray-400 leading-relaxed">
                  Select from beginner to advanced courses tailored to your experience level and learning goals.
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center group">
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:bg-[#FFC700] transition-all duration-200">
                    <span className="text-white group-hover:text-black font-bold text-2xl">2</span>
                  </div>
                  <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-gray-700 to-transparent"></div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Learn & Practice</h3>
                <p className="text-gray-400 leading-relaxed">
                  Follow interactive video lessons, complete hands-on projects, and test your knowledge with quizzes.
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center group">
                <div className="mb-8">
                  <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:bg-[#FFC700] transition-all duration-200">
                    <span className="text-white group-hover:text-black font-bold text-2xl">3</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Build & Deploy</h3>
                <p className="text-gray-400 leading-relaxed">
                  Create real-world dApps, deploy smart contracts, and join our developer community.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 lg:py-32 bg-gray-900/30">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Why Choose CTDHUB?</h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                The most comprehensive blockchain learning platform
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
              <div className="card text-center group" role="article" aria-labelledby="feature-courses">
                <div className="w-16 h-16 bg-[#FFC700]/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-[#FFC700]/30 transition-colors duration-200">
                  <span className="text-3xl" role="img" aria-label="Books">📚</span>
                </div>
                <h3 id="feature-courses" className="text-2xl font-bold text-white mb-4">Interactive Courses</h3>
                <p className="text-gray-400 leading-relaxed">
                  Learn with hands-on video tutorials covering blockchain fundamentals to advanced DeFi concepts with real-world projects.
                </p>
              </div>
              
              <div className="card text-center group" role="article" aria-labelledby="feature-quiz">
                <div className="w-16 h-16 bg-[#FFC700]/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-[#FFC700]/30 transition-colors duration-200">
                  <span className="text-3xl" role="img" aria-label="Brain">🧠</span>
                </div>
                <h3 id="feature-quiz" className="text-2xl font-bold text-white mb-4">Knowledge Testing</h3>
                <p className="text-gray-400 leading-relaxed">
                  Test your understanding with our comprehensive quiz system featuring 10 progressive modules and instant feedback.
                </p>
              </div>
              
              <div className="card text-center group" role="article" aria-labelledby="feature-ai">
                <div className="w-16 h-16 bg-[#FFC700]/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-[#FFC700]/30 transition-colors duration-200">
                  <span className="text-3xl" role="img" aria-label="Robot">🤖</span>
                </div>
                <h3 id="feature-ai" className="text-2xl font-bold text-white mb-4">AI Assistant</h3>
                <p className="text-gray-400 leading-relaxed">
                  Get instant help from Binno AI for coding questions, blockchain concepts, and personalized learning paths.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-24 lg:py-32">
          <div className="max-w-5xl mx-auto px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-8">
              Ready to Start Your Blockchain Journey?
            </h2>
            <p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto">
              Join thousands of developers already building the future with Web3 technology.
            </p>
            <Link 
              href="/courses" 
              className="btn-primary text-lg inline-flex items-center"
              aria-label="Start your blockchain learning journey now"
            >
              🚀 Start Learning Now
            </Link>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
}