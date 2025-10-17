import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { CTDTokenCard } from '@/components/ContractCard'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'

export default function Home() {
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Verificar se a wallet está conectada
    const checkWalletConnection = () => {
      const wallet = localStorage.getItem('ctdhub:wallet')
      setIsConnected(!!wallet)
    }

    checkWalletConnection()

    // Escutar mudanças na conexão da wallet
    const handleStorageChange = () => {
      checkWalletConnection()
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <style jsx>{`
        @keyframes floatAndSlide {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          25% {
            transform: translateY(-15px) translateX(10px);
          }
          50% {
            transform: translateY(-25px) translateX(-5px);
          }
          75% {
            transform: translateY(-10px) translateX(15px);
          }
        }
        
        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative py-16 lg:py-24 overflow-hidden">
          {/* Floating Shapes Background */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Círculos */}
            <div className="absolute top-20 left-10 w-16 h-16 bg-blue-300 dark:bg-blue-800 rounded-full opacity-80 dark:opacity-60" 
                 style={{
                   animation: 'floatAndSlide 8s ease-in-out infinite',
                   animationDelay: '0s'
                 }}></div>
            <div className="absolute top-40 right-20 w-12 h-12 bg-purple-300 dark:bg-purple-800 rounded-full opacity-70 dark:opacity-50" 
                 style={{
                   animation: 'floatAndSlide 10s ease-in-out infinite',
                   animationDelay: '1s'
                 }}></div>
            <div className="absolute bottom-40 left-20 w-20 h-20 bg-yellow-300 dark:bg-yellow-800 rounded-full opacity-60 dark:opacity-40" 
                 style={{
                   animation: 'floatAndSlide 12s ease-in-out infinite',
                   animationDelay: '2s'
                 }}></div>
            <div className="absolute bottom-20 right-40 w-8 h-8 bg-green-300 dark:bg-green-800 rounded-full opacity-90 dark:opacity-70" 
                 style={{
                   animation: 'floatAndSlide 7s ease-in-out infinite',
                   animationDelay: '0.5s'
                 }}></div>
            <div className="absolute top-60 left-1/3 w-14 h-14 bg-pink-300 dark:bg-pink-800 rounded-full opacity-65 dark:opacity-45" 
                 style={{
                   animation: 'floatAndSlide 9s ease-in-out infinite',
                   animationDelay: '3s'
                 }}></div>
            <div className="absolute top-32 right-1/4 w-10 h-10 bg-orange-300 dark:bg-orange-800 rounded-full opacity-75 dark:opacity-55" 
                 style={{
                   animation: 'floatAndSlide 11s ease-in-out infinite',
                   animationDelay: '4s'
                 }}></div>
            <div className="absolute bottom-60 right-1/3 w-18 h-18 bg-cyan-300 dark:bg-cyan-800 rounded-full opacity-55 dark:opacity-35" 
                 style={{
                   animation: 'floatAndSlide 13s ease-in-out infinite',
                   animationDelay: '1.5s'
                 }}></div>
            
            {/* Triângulos */}
            <div className="absolute top-16 right-10 w-0 h-0 opacity-70 dark:opacity-50" style={{
              borderLeft: '15px solid transparent',
              borderRight: '15px solid transparent',
              borderBottom: '25px solid rgb(147 197 253)', // blue-300
              animation: 'floatAndSlide 9s ease-in-out infinite',
              animationDelay: '2.5s'
            }}></div>
            <div className="absolute top-52 left-1/4 w-0 h-0 opacity-80 dark:opacity-60" style={{
              borderLeft: '12px solid transparent',
              borderRight: '12px solid transparent',
              borderBottom: '20px solid rgb(196 181 253)', // purple-300
              animation: 'floatAndSlide 11s ease-in-out infinite',
              animationDelay: '1.8s'
            }}></div>
            <div className="absolute bottom-32 left-16 w-0 h-0 opacity-65 dark:opacity-45" style={{
              borderLeft: '18px solid transparent',
              borderRight: '18px solid transparent',
              borderBottom: '30px solid rgb(254 240 138)', // yellow-300
              animation: 'floatAndSlide 8s ease-in-out infinite',
              animationDelay: '3.2s'
            }}></div>
            <div className="absolute top-80 right-1/4 w-0 h-0 opacity-75 dark:opacity-55" style={{
              borderLeft: '10px solid transparent',
              borderRight: '10px solid transparent',
              borderBottom: '16px solid rgb(134 239 172)', // green-300
              animation: 'floatAndSlide 10s ease-in-out infinite',
              animationDelay: '0.8s'
            }}></div>
            <div className="absolute bottom-16 right-20 w-0 h-0 opacity-85 dark:opacity-65" style={{
              borderLeft: '14px solid transparent',
              borderRight: '14px solid transparent',
              borderBottom: '22px solid rgb(248 180 217)', // pink-300
              animation: 'floatAndSlide 12s ease-in-out infinite',
              animationDelay: '4.5s'
            }}></div>
            <div className="absolute top-44 left-1/2 w-0 h-0 opacity-60 dark:opacity-40" style={{
              borderLeft: '16px solid transparent',
              borderRight: '16px solid transparent',
              borderBottom: '26px solid rgb(253 186 116)', // orange-300
              animation: 'floatAndSlide 14s ease-in-out infinite',
              animationDelay: '2.8s'
            }}></div>
            
            {/* Triângulos invertidos (apontando para baixo) */}
            <div className="absolute top-24 left-1/3 w-0 h-0 opacity-70 dark:opacity-50" style={{
              borderLeft: '13px solid transparent',
              borderRight: '13px solid transparent',
              borderTop: '21px solid rgb(165 243 252)', // cyan-300
              animation: 'floatAndSlide 9s ease-in-out infinite',
              animationDelay: '3.5s'
            }}></div>
            <div className="absolute bottom-48 right-16 w-0 h-0 opacity-65 dark:opacity-45" style={{
              borderLeft: '11px solid transparent',
              borderRight: '11px solid transparent',
              borderTop: '18px solid rgb(191 219 254)', // blue-300
              animation: 'floatAndSlide 13s ease-in-out infinite',
              animationDelay: '1.2s'
            }}></div>
            <div className="absolute top-72 right-1/3 w-0 h-0 opacity-80 dark:opacity-60" style={{
              borderLeft: '17px solid transparent',
              borderRight: '17px solid transparent',
              borderTop: '28px solid rgb(217 119 6)', // amber-600 for dark mode visibility
              animation: 'floatAndSlide 11s ease-in-out infinite',
              animationDelay: '4.8s'
            }}></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-6 z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Side - Content */}
              <div className="text-left">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-tight text-gray-900 dark:text-white">
                  Learn <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Web3</span>.
                  <br />
                  Ship real things.
                </h1>
                <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-lg">
                  Videos, quizzes, and an AI copilot to take you from "what is a wallet?" to shipping your first dApp.
                </p>
                
                {/* CTA Buttons Grid */}
                <div className={`grid gap-4 max-w-md ${isConnected ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  {/* Sempre mostrar - Courses */}
                  <Link 
                    href="/courses" 
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold py-4 px-6 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 text-center"
                    aria-label="Start Learning"
                  >
                    📚 Start Learning
                  </Link>
                  
                  {/* Sempre mostrar - Binno AI */}
                  <Link 
                    href="/binno-ai" 
                    className="bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white font-bold py-4 px-6 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 text-center"
                    aria-label="Try Binno AI"
                  >
                    � Try Binno AI
                  </Link>
                  
                  {/* Mostrar apenas quando conectado */}
                  {isConnected && (
                    <>
                      <Link 
                        href="/quiz" 
                        className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 text-center"
                        aria-label="Take the Quiz"
                      >
                        � Take the Quiz
                      </Link>
                      
                      <Link 
                        href="/dev" 
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 text-center"
                        aria-label="Creator Studio"
                      >
                        ⚙️ Creator Studio
                      </Link>
                      
                      <Link 
                        href="/questionnaire" 
                        className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-bold py-4 px-6 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 text-center"
                        aria-label="Skill Compass"
                      >
                        🧭 Skill Compass
                      </Link>
                      
                      <Link 
                        href="/courses" 
                        className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-bold py-4 px-6 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 text-center"
                        aria-label="My Modules"
                      >
                        📚 My Modules
                      </Link>
                    </>
                  )}
                </div>
              </div>
              
              {/* Right Side - Mascot */}
              <div className="relative hidden lg:flex justify-center items-center">
                <div className="relative">
                  <Image 
                    src="/images/BINNO-home.png" 
                    alt="Binno Mascot" 
                    width={400} 
                    height={500}
                    className="drop-shadow-2xl animate-float"
                    priority
                    style={{
                      filter: 'drop-shadow(0 0 8px rgba(255, 217, 61, 0.6)) drop-shadow(0 0 12px rgba(155, 89, 182, 0.4)) drop-shadow(0 0 16px rgba(74, 144, 226, 0.3))'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BNB Smart Chain Badge Section */}
        <section className="py-12 border-y border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <span className="text-gray-600 dark:text-gray-400 font-medium">Built on</span>
              <a 
                href="https://www.bnbchain.org/en" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bnb-badge hover:scale-105 transition-transform duration-200 cursor-pointer"
              >
                <Image src="/bnb-logo.png" alt="BNB Smart Chain" width={24} height={24} />
                <span>BNB Smart Chain</span>
              </a>
              <span className="text-gray-600 dark:text-gray-400 font-medium">· Part of the Web3 ecosystem</span>
              <span className="text-gray-600 dark:text-gray-400 font-medium">·</span>
              <a 
                href="https://dappbay.bnbchain.org/detail/chain-talk-daily-hub" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bnb-badge hover:scale-105 transition-transform duration-200 cursor-pointer"
              >
                <Image src="/bnb-logo.png" alt="BNB Chain" width={24} height={24} />
                <span>View on DappBay</span>
              </a>
            </div>
          </div>
        </section>

        {/* How it Works Section - 3 Steps */}
        <section className="py-24 lg:py-32 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Start building in three simple steps
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative">
              {/* Connection Line */}
              <div className="hidden md:block absolute top-16 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-purple-500 to-green-500 opacity-30" style={{width: '66%', left: '17%'}}></div>
              
              {/* Step 1 */}
              <div className="card card-interactive text-center p-8 animate-fade-in-up">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-gray-900 shadow-xl">
                  1
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Pick your path</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Choose a track that fits your level—from fundamentals to DeFi and smart contracts.
                </p>
              </div>

              {/* Step 2 */}
              <div className="card card-interactive text-center p-8 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white shadow-xl">
                  2
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Learn & practice</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Watch short videos, follow along, and test yourself with quick quizzes.
                </p>
              </div>

              {/* Step 3 */}
              <div className="card card-interactive text-center p-8 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white shadow-xl">
                  3
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Ship it</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Deploy contracts, publish your dApp, and share your work with the community.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 lg:py-32 bg-white dark:bg-gray-900 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                What makes CTD HUB different
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
              {/* Feature 1 - Courses */}
              <div className="card card-interactive text-center p-8 group">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                  <span className="text-4xl">📚</span>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Courses</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Learn by doing with guided, real-world projects.
                </p>
              </div>
              
              {/* Feature 2 - Quiz */}
              <div className="card card-interactive text-center p-8 group">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                  <span className="text-4xl">🧠</span>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Quiz</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  10 progressive modules with instant feedback and retry.
                </p>
              </div>
              
              {/* Feature 3 - Binno AI */}
              <div className="card card-interactive text-center p-8 group">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                  <span className="text-4xl">🤖</span>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Binno AI</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Ask anything. Get code hints, explanations, and next steps.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTD Token Info Section */}
        <section className="py-16 lg:py-20 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 transition-colors duration-300">
          <div className="max-w-4xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                CTD Token Contract
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
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
        <section className="py-24 lg:py-32 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 dark:from-purple-900 dark:via-blue-900 dark:to-cyan-900 text-white transition-colors duration-300">
          <div className="max-w-5xl mx-auto px-6 lg:px-8 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-8 drop-shadow-lg">
              Ready? Let's build.
            </h2>
            <p className="text-xl mb-12 max-w-3xl mx-auto opacity-90">
              Join a growing community of builders and ship your next idea.
            </p>
            <Link 
              href="/courses" 
              className="inline-flex items-center gap-2 bg-white text-purple-600 font-bold text-lg px-8 py-4 rounded-lg shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-200"
              aria-label="Start Learning Now"
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

