import Head from 'next/head'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Header from '../components/Header'
import Footer from '../components/Footer'

  const [isCreating, setIsCreating] = useState(false)
  const router = useRouter()

  // Protege rota: só acessa se wallet conectada
  useEffect(() => {
    if (typeof window === 'undefined') return
    const walletAddress = localStorage.getItem('ctdhub:wallet')
    if (!walletAddress) {
      router.replace('/')
    }
  }, [])
  
  const createNewSession = async () => {
    setIsCreating(true)
    
    try {
      // Generate a unique session ID
      const sessionId = `binno_questionnaire_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Save basic context for the session
      const basicContext = {
        user_id: sessionId,
        experience_level: 'intermediate',
        interests: ['DeFi', 'Smart Contracts', 'Web3'],
        goal: 'Learn and improve blockchain development skills'
      }
      
      localStorage.setItem(`questionnaire_context_${sessionId}`, JSON.stringify(basicContext))
      
      // Redirect to questionnaire using Next.js router
      await router.push(`/binno/questionnaire/${sessionId}`)
    } catch (error) {
      console.error('Error creating session:', error)
      setIsCreating(false)
    }
  }

  return (
    <>
      <Head>
        <title>CTD Skill Compass - AI-driven Web3 Assessment | CTDHUB</title>
        <meta name="description" content="Discover your Web3 skill level and get a personalized learning route with our AI-driven assessment platform." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-ctd-bg">
        <Header />
        
        <main className="pt-20 pb-20">
          {/* Hero Section */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center spotlight">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-ctd-yellow/20 to-ctd-holo/20 px-6 py-3 rounded-full border border-ctd-yellow/30 mb-8">
              <span className="w-3 h-3 bg-ctd-holo rounded-full animate-pulse"></span>
              <span className="text-ctd-yellow font-semibold">AI-driven Web3 assessment</span>
            </div>

            {/* Main Title */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-ctd-yellow via-ctd-holo to-ctd-yellow bg-clip-text text-transparent">
                CTD Skill Compass
              </span>
            </h1>

            <p className="text-xl text-ctd-mute mb-12 max-w-3xl mx-auto leading-relaxed">
              Discover your level and get a personalized learning route in minutes.
            </p>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="card p-6 relative">
                <div className="corner corner--tl"></div>
                <div className="corner corner--tr"></div>
                <div className="text-3xl mb-4">🧠</div>
                <h3 className="text-xl font-semibold text-ctd-text mb-2">Adaptive by Design</h3>
                <p className="text-ctd-mute text-sm">
                  Questions evolve based on your responses, ensuring personalized difficulty and relevance
                </p>
              </div>
              
              <div className="card p-6 relative">
                <div className="corner corner--tl"></div>
                <div className="corner corner--tr"></div>
                <div className="text-3xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-ctd-text mb-2">Actionable Insights</h3>
                <p className="text-ctd-mute text-sm">
                  Receive specific skill gaps, strengths, and next learning steps tailored to your profile
                </p>
              </div>
              
              <div className="card p-6 relative">
                <div className="corner corner--tl"></div>
                <div className="corner corner--tr"></div>
                <div className="text-3xl mb-4">📄</div>
                <h3 className="text-xl font-semibold text-ctd-text mb-2">Shareable Report</h3>
                <p className="text-ctd-mute text-sm">
                  Export your complete assessment as a professional PDF for portfolios or team reviews
                </p>
              </div>
            </div>

            {/* How it Works */}
            <div className="card p-8 mb-12 relative">
              <div className="corner corner--tl"></div>
              <div className="corner corner--tr"></div>
              <div className="corner corner--bl"></div>
              <div className="corner corner--br"></div>
              <h2 className="text-2xl font-bold text-ctd-text mb-6">How It Works</h2>
              <div className="grid md:grid-cols-4 gap-4 text-left">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-ctd-yellow to-ctd-holo rounded-full flex items-center justify-center text-black font-bold text-lg mx-auto mb-3">1</div>
                  <h4 className="font-semibold text-ctd-text mb-2">Answer Questions</h4>
                  <p className="text-ctd-mute text-sm">Respond to BINNO AI questions that adapt to your level</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-ctd-holo to-ctd-yellow rounded-full flex items-center justify-center text-black font-bold text-lg mx-auto mb-3">2</div>
                  <h4 className="font-semibold text-ctd-text mb-2">AI Analysis</h4>
                  <p className="text-ctd-mute text-sm">Our AI analyzes your responses and identifies patterns</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-ctd-yellow to-ctd-holo rounded-full flex items-center justify-center text-black font-bold text-lg mx-auto mb-3">3</div>
                  <h4 className="font-semibold text-ctd-text mb-2">Get Insights</h4>
                  <p className="text-ctd-mute text-sm">Receive personalized skill assessment and recommendations</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-ctd-holo to-ctd-yellow rounded-full flex items-center justify-center text-black font-bold text-lg mx-auto mb-3">4</div>
                  <h4 className="font-semibold text-ctd-text mb-2">Plan Learning</h4>
                  <p className="text-ctd-mute text-sm">Follow your customized learning path to level up</p>
                </div>
              </div>
            </div>

            {/* Start Button */}
            <div className="text-center">
              <button
                onClick={createNewSession}
                disabled={isCreating}
                className="btn-primary text-xl px-12 py-4 transform hover:scale-105 shadow-glow"
              >
                {isCreating ? (
                  <div className="flex items-center space-x-3">
                    <div className="animate-spin w-6 h-6 border-2 border-black border-t-transparent rounded-full"></div>
                    <span>Creating Session...</span>
                  </div>
                ) : (
                  <>
                    🚀 Start Assessment
                  </>
                )}
              </button>
              
              <p className="text-ctd-mute text-sm mt-4">
                ⏱️ Takes ~15–30 minutes. Adapts as you go.
              </p>
            </div>

            {/* Additional Info */}
            <div className="mt-16 text-center">
              <h3 className="text-xl font-semibold text-ctd-text mb-4">What you'll learn about</h3>
              <div className="flex flex-wrap justify-center gap-3">
                {[
                  'Smart Contract Development', 'DeFi Protocol Understanding', 'Blockchain Security Practices', 
                  'Gas Optimization Strategies', 'Web3 Integration Skills', 'Token Standards & Economics',
                  'Consensus Mechanisms', 'Layer 2 Scaling Solutions', 'Cross-chain Architecture',
                  'Development Tooling', 'Testing & Deployment', 'Community & Governance'
                ].map((topic) => (
                  <span 
                    key={topic}
                    className="chip"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  )
}