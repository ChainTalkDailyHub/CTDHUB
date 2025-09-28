import { useState, useEffect, useRef } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  id: string
  favorite?: boolean
}

interface ChatSession {
  id: string
  title: string
  messages: Message[]
  timestamp: number
}

interface AIFeatures {
  contractAnalysis: boolean
  transactionExplainer: boolean
  priceAnalysis: boolean
  gasOptimizer: boolean
}

export default function BinnoAI() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentSession, setCurrentSession] = useState<string>('')
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [showSidebar, setShowSidebar] = useState(false)
  const [activeFeature, setActiveFeature] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load chat history from localStorage
  useEffect(() => {
    const savedSessions = localStorage.getItem('binno-chat-sessions')
    if (savedSessions) {
      const sessions = JSON.parse(savedSessions)
      setChatSessions(sessions)
    }
  }, [])

  // Save current session
  useEffect(() => {
    if (messages.length > 0 && currentSession) {
      const updatedSessions = chatSessions.map(session => 
        session.id === currentSession 
          ? { ...session, messages, timestamp: Date.now() }
          : session
      )
      setChatSessions(updatedSessions)
      localStorage.setItem('binno-chat-sessions', JSON.stringify(updatedSessions))
    }
  }, [messages, currentSession, chatSessions])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const generateMessageId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: generateMessageId(),
      role: 'user',
      content: inputValue,
      timestamp: Date.now()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      // Detect if running on Netlify and use appropriate endpoint
      const isNetlify = typeof window !== 'undefined' && window.location.hostname.includes('netlify')
      const apiEndpoint = isNetlify ? '/.netlify/functions/ai-chat' : '/api/ai/chat'
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          }))
        }),
      })

      const data = await response.json()

      if (response.ok && data.message) {
        const assistantMessage: Message = {
          id: generateMessageId(),
          role: 'assistant',
          content: data.message,
          timestamp: Date.now()
        }
        setMessages(prev => [...prev, assistantMessage])
      } else {
        throw new Error(data.error || data.message || 'Failed to get response')
      }
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: Message = {
        id: generateMessageId(),
        role: 'assistant',
        content: '❌ **Sorry, I encountered an error.** Please try again. If the problem persists, make sure your internet connection is stable.',
        timestamp: Date.now()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const startNewChat = () => {
    const newSessionId = `session_${Date.now()}`
    const newSession: ChatSession = {
      id: newSessionId,
      title: 'New Chat',
      messages: [],
      timestamp: Date.now()
    }
    
    setChatSessions(prev => [newSession, ...prev])
    setCurrentSession(newSessionId)
    setMessages([])
    setActiveFeature(null)
  }

  const loadSession = (sessionId: string) => {
    const session = chatSessions.find(s => s.id === sessionId)
    if (session) {
      setCurrentSession(sessionId)
      setMessages(session.messages)
      setShowSidebar(false)
    }
  }

  const toggleFavorite = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, favorite: !msg.favorite } : msg
    ))
  }

  const useQuickPrompt = (prompt: string) => {
    setInputValue(prompt)
    setActiveFeature(null)
  }

  const clearChat = () => {
    setMessages([])
    setActiveFeature(null)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const quickPrompts = [
    { category: 'DeFi', prompts: [
      'How does yield farming work?',
      'Explain impermanent loss',
      'What are flash loans?',
      'How to use DEXs safely?'
    ]},
    { category: 'Trading', prompts: [
      'Arbitrage strategies',
      'How to analyze crypto charts?',
      'What is MEV?',
      'Trading best practices'
    ]},
    { category: 'Security', prompts: [
      'How to identify scams?',
      'Wallet best practices',
      'What are audits?',
      'How to protect private keys?'
    ]},
    { category: 'Development', prompts: [
      'How to write smart contracts?',
      'Development tools',
      'Solidity security patterns',
      'How to deploy to mainnet?'
    ]}
  ]

  return (
    <div className="min-h-screen bg-black flex">
      {/* Sidebar */}
      {showSidebar && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:relative lg:bg-transparent">
          <div className="fixed left-0 top-0 h-full w-80 bg-gray-900/95 backdrop-blur-md border-r border-gray-800 z-50 lg:relative lg:w-64">
            <div className="p-4 border-b border-gray-700">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white">Conversations</h3>
                <button
                  onClick={() => setShowSidebar(false)}
                  className="lg:hidden text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
              <button
                onClick={startNewChat}
                className="btn-primary w-full text-sm py-3"
              >
                + New Chat
              </button>
            </div>
            
            <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
              {chatSessions.map(session => (
                <div
                  key={session.id}
                  onClick={() => loadSession(session.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    currentSession === session.id 
                      ? 'bg-[#FFC700] text-black' 
                      : 'bg-gray-800/50 hover:bg-gray-700/50 text-white'
                  }`}
                >
                  <p className="font-medium truncate">{session.title}</p>
                  <p className="text-xs opacity-70">
                    {new Date(session.timestamp).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 py-24">
          <div className="max-w-6xl mx-auto px-6 lg:px-8 h-full flex flex-col">
            {/* Header with Controls */}
            <div className="flex justify-between items-center mb-12">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowSidebar(!showSidebar)}
                  className="lg:hidden btn-ghost px-4 py-2"
                >
                  ☰
                </button>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                    <span className="text-[#FFC700]">Binno</span> AI Assistant
                  </h1>
                  <p className="text-xl text-gray-400">Your blockchain and Web3 specialist assistant</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setActiveFeature(activeFeature === 'prompts' ? null : 'prompts')}
                  className="btn-ghost"
                >
                  💡 Quick Prompts
                </button>
              </div>
            </div>

            {/* Quick Prompts Panel */}
            {activeFeature === 'prompts' && (
              <div className="mb-8 card">
                <h3 className="text-xl font-semibold text-white mb-6">🚀 Quick Prompts</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {quickPrompts.map(category => (
                    <div key={category.category} className="space-y-3">
                      <h4 className="font-medium text-[#FFC700]">{category.category}</h4>
                      {category.prompts.map((prompt, idx) => (
                        <button
                          key={idx}
                          onClick={() => useQuickPrompt(prompt)}
                          className="w-full text-left text-sm p-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg text-white transition-all duration-200 hover:scale-105"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Container */}
            <div className="flex-1 card flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto mb-6 space-y-4 min-h-0">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="mb-8">
                      <img 
                        src="/images/binno-avatar.png" 
                        alt="Binno AI" 
                        className="w-32 h-32 mx-auto rounded-full"
                      />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-4">Hello! I'm <span className="text-[#FFC700]">Binno AI</span></h2>
                    <p className="max-w-lg text-gray-400 leading-relaxed mb-8">Your specialist assistant in blockchain, DeFi, Web3 and crypto development. Ask me anything!</p>
                    <div className="flex flex-wrap gap-3 justify-center max-w-2xl">
                      {['How does DeFi work?', 'Explain smart contracts', 'Yield farming strategies', 'Crypto security'].map(prompt => (
                        <button
                          key={prompt}
                          onClick={() => useQuickPrompt(prompt)}
                          className="btn-ghost text-sm"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className="group relative max-w-xs lg:max-w-2xl">
                          <div
                            className={`px-6 py-4 rounded-2xl ${
                              message.role === 'user'
                                ? 'bg-[#FFC700] text-black'
                                : 'bg-gray-800/80 backdrop-blur-sm text-white border border-gray-700/50'
                            }`}
                          >
                            <div 
                              className="whitespace-pre-wrap prose prose-invert max-w-none"
                              dangerouslySetInnerHTML={{
                                __html: message.content
                                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                  .replace(/\*(.*?)\*/g, '<em>$1</em>')
                                  .replace(/`(.*?)`/g, '<code class="bg-gray-600 px-1 rounded">$1</code>')
                              }}
                            />
                            <div className="flex justify-between items-center mt-2">
                              <p className="text-xs opacity-70">
                                {new Date(message.timestamp).toLocaleTimeString()}
                              </p>
                              {message.role === 'assistant' && (
                                <button
                                  onClick={() => toggleFavorite(message.id)}
                                  className={`text-xs opacity-0 group-hover:opacity-100 transition-opacity ${
                                    message.favorite ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'
                                  }`}
                                >
                                  {message.favorite ? '★' : '☆'}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-gray-700 text-white px-4 py-3 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
                            </div>
                            <span className="text-sm text-gray-400">Binno is thinking...</span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input Container */}
              <div className="border-t border-gray-600 pt-4">
                <div className="flex gap-3">
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask Binno anything: &quot;why does my tx keep reverting?&quot;"
                    className="flex-1 bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 resize-none focus:outline-none focus:border-primary min-h-[60px]"
                    rows={2}
                  />
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={sendMessage}
                      disabled={!inputValue.trim() || isLoading}
                      className={`btn-primary px-6 py-3 ${
                        !inputValue.trim() || isLoading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {isLoading ? '...' : 'Send'}
                    </button>
                    <button
                      onClick={clearChat}
                      className="btn-secondary px-6 py-3 text-sm"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  )
}