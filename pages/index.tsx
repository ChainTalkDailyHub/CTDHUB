import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { CTDTokenCard } from '@/components/ContractCard'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative py-24 lg:py-32 overflow-hidden spotlight">
          <div className="relative max-w-6xl mx-auto px-6 text-center">
            <div className="max-w-5xl mx-auto">
              <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight drop-shadow-neon mb-8 leading-tight text-ctd-text">
                Learn <span className="text-ctd-yellow">Web3</span>. Ship real things.
                {/* alt: Build on Web3. Learn by shipping. */}
                {/* alt: Web3 skills, real-world builds. */}
              </h1>
              <p className="mt-5 text-lg text-ctd-text/80 max-w-3xl mx-auto">
                Videos, quizzes, and an AI copilot to take you from "what is a wallet?" to shipping your first dApp.
              </p>
              
              {/* Primary CTA */}
              <div className="mt-10 flex flex-wrap justify-center gap-4">
                <Link 
                  href="/courses" 
                  className="btn-primary"
                  aria-label="Start learning blockchain development"
                  data-animate="pulse"
                >
                  Start Learning
                </Link>
                <Link 
                  href="/quiz" 
                  className="btn-ghost"
                  aria-label="Take the Quiz"
                >
                  Take the Quiz
                </Link>
                <Link 
                  href="/binno-ai" 
                  className="btn-ghost"
                  aria-label="Try Binno AI"
                >
                  Try Binno AI
                </Link>
                <Link 
                  href="/dev" 
                  className="btn-ghost"
                  aria-label="Dev Area"
                >
                  Dev Area
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Trusted by / BNB Smart Chain Strip */}
        <section className="py-12 border-y border-ctd-border/50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center">
              <p className="text-ctd-mute text-sm font-medium mb-8">Built on BNB Smart Chain · Part of the Web3 ecosystem.</p>
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="py-24 lg:py-32 spotlight">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-5xl font-bold text-ctd-text drop-shadow-neon mb-6">Start building in three simple steps</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
              {/* Step 1 */}
              <div className="text-center group">
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-ctd-yellow rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200 shadow-outline">
                    <span className="text-black font-bold text-2xl">1</span>
                  </div>
                  <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-ctd-yellow to-transparent"></div>
                </div>
                <h3 className="text-2xl font-bold text-ctd-text mb-4">Pick your path</h3>
                <p className="text-ctd-mute leading-relaxed">
                  Choose a track that fits your level—from fundamentals to DeFi and smart contracts.
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center group">
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-ctd-panel rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:bg-ctd-yellow transition-all duration-200 border border-ctd-border">
                    <span className="text-ctd-text group-hover:text-black font-bold text-2xl">2</span>
                  </div>
                  <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-ctd-border to-transparent"></div>
                </div>
                <h3 className="text-2xl font-bold text-ctd-text mb-4">Learn & practice</h3>
                <p className="text-ctd-mute leading-relaxed">
                  Watch short videos, follow along, and test yourself with quick quizzes.
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center group">
                <div className="mb-8">
                  <div className="w-20 h-20 bg-ctd-panel rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:bg-ctd-yellow transition-all duration-200 border border-ctd-border">
                    <span className="text-ctd-text group-hover:text-black font-bold text-2xl">3</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-ctd-text mb-4">Ship it</h3>
                <p className="text-ctd-mute leading-relaxed">
                  Deploy contracts, publish your dApp, and share your work with the community.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 lg:py-32 bg-ctd-panel/30 spotlight">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-5xl font-bold text-ctd-text drop-shadow-neon mb-6">What makes CTDHub different</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
              <div className="card text-center group relative" role="article" aria-labelledby="feature-courses">
                <div className="corner corner--tl"></div>
                <div className="corner corner--tr"></div>
                <div className="corner corner--bl"></div>
                <div className="corner corner--br"></div>
                <div className="p-8">
                  <div className="w-16 h-16 bg-ctd-yellow/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-ctd-yellow/30 transition-colors duration-200">
                    <span className="text-3xl" role="img" aria-label="Books">📚</span>
                  </div>
                  <h3 id="feature-courses" className="text-2xl font-bold text-ctd-text mb-4">Interactive courses</h3>
                  <p className="text-ctd-mute leading-relaxed">
                    Learn by doing with guided, real-world projects.
                  </p>
                </div>
              </div>
              
              <div className="card text-center group relative" role="article" aria-labelledby="feature-quiz">
                <div className="corner corner--tl"></div>
                <div className="corner corner--tr"></div>
                <div className="corner corner--bl"></div>
                <div className="corner corner--br"></div>
                <div className="p-8">
                  <div className="w-16 h-16 bg-ctd-yellow/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-ctd-yellow/30 transition-colors duration-200">
                    <span className="text-3xl" role="img" aria-label="Brain">🧠</span>
                  </div>
                  <h3 id="feature-quiz" className="text-2xl font-bold text-ctd-text mb-4">Smart quizzes</h3>
                  <p className="text-ctd-mute leading-relaxed">
                    10 progressive modules with instant feedback and retry.
                  </p>
                </div>
              </div>
              
              <div className="card text-center group relative" role="article" aria-labelledby="feature-ai">
                <div className="corner corner--tl"></div>
                <div className="corner corner--tr"></div>
                <div className="corner corner--bl"></div>
                <div className="corner corner--br"></div>
                <div className="p-8">
                  <div className="w-16 h-16 bg-ctd-yellow/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-ctd-yellow/30 transition-colors duration-200">
                    <span className="text-3xl" role="img" aria-label="Robot">🤖</span>
                  </div>
                  <h3 id="feature-ai" className="text-2xl font-bold text-ctd-text mb-4">Binno AI</h3>
                  <p className="text-ctd-mute leading-relaxed">
                    Ask anything. Get code hints, explanations, and next steps.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTD Token Info Section */}
        <section className="py-16 lg:py-20">
          <div className="max-w-4xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-ctd-text mb-6">
                CTD Token Contract
              </h2>
              <p className="text-lg text-ctd-mute max-w-2xl mx-auto">
                The official CTD token contract address on Binance Smart Chain. 
                Copy the address to add CTD to your wallet or verify transactions.
              </p>
            </div>
            
            <div className="max-w-lg mx-auto">
              <CTDTokenCard />
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-24 lg:py-32 spotlight">
          <div className="max-w-5xl mx-auto px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-ctd-text drop-shadow-neon mb-8">
              Ready? Let's build.
            </h2>
            <p className="text-xl text-ctd-mute mb-12 max-w-3xl mx-auto">
              Join a growing community of builders and ship your next idea.
            </p>
            <Link 
              href="/courses" 
              className="btn-primary text-lg inline-flex items-center"
              aria-label="Start Learning Now"
            >
              Start Learning Now
            </Link>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
}