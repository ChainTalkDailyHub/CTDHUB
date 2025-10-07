import { useState, useEffect } from "react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { AdminSystem, ADMIN_CONFIG } from "@/lib/adminSystem"

export default function DeveloperPage() {
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Estados para criação de curso admin
  const [showAdminForm, setShowAdminForm] = useState(false)
  const [adminCourseData, setAdminCourseData] = useState({
    title: '',
    description: '',
    youtubeUrl: '',
    category: 'Blockchain',
    difficulty: 'Beginner'
  })

  useEffect(() => {
    checkWalletConnection()
  }, [])

  const checkWalletConnection = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({ method: 'eth_accounts' })
        if (accounts.length > 0) {
          setIsConnected(true)
          setWalletAddress(accounts[0])
          setIsAdmin(AdminSystem.isAdmin(accounts[0]))
        }
      } catch (error) {
        console.error('Erro ao verificar carteira:', error)
      }
    }
  }

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' })
        if (accounts.length > 0) {
          setIsConnected(true)
          setWalletAddress(accounts[0])
          setIsAdmin(AdminSystem.isAdmin(accounts[0]))
        }
      } catch (error) {
        console.error('Erro ao conectar carteira:', error)
        alert('Erro ao conectar carteira')
      }
    }
  }

  const handleAdminCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const adminCourse = {
        id: Date.now().toString(),
        slug: adminCourseData.title.toLowerCase().replace(/\s+/g, '-'),
        title: adminCourseData.title,
        description: adminCourseData.description,
        thumbnail: AdminSystem.getYouTubeThumbnail(adminCourseData.youtubeUrl),
        youtubeUrl: adminCourseData.youtubeUrl,
        creator: ADMIN_CONFIG.ADMIN_NAME,
        creatorAddress: walletAddress,
        isAdminCourse: true,
        createdAt: new Date().toISOString(),
        category: adminCourseData.category,
        difficulty: adminCourseData.difficulty
      }

      const success = await AdminSystem.saveAdminCourse(adminCourse)
      
      if (success) {
        alert('✅ Curso CTDHUB oficial criado e sincronizado globalmente!')
        setAdminCourseData({
          title: '',
          description: '',
          youtubeUrl: '',
          category: 'Blockchain',
          difficulty: 'Beginner'
        })
        setShowAdminForm(false)
      } else {
        alert('⚠️ Curso salvo localmente (problemas de conexão)')
      }
    } catch (error) {
      console.error('Erro ao salvar curso admin:', error)
      alert('❌ Erro ao criar curso')
    } finally {
      setIsLoading(false)
    }
  }

  const syncCourses = async () => {
    setIsLoading(true)
    try {
      await AdminSystem.syncCourses()
      alert('✅ Sincronização concluída!')
    } catch (error) {
      console.error('Erro na sincronização:', error)
      alert('❌ Erro na sincronização')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ctd-bg">
      <Header />
      <section className="pt-20 pb-8 px-4 spotlight">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-ctd-text drop-shadow-neon mb-4">
              Dev <span className="text-ctd-yellow">Area</span>
            </h1>
            <p className="text-xl text-ctd-mute">
              Administrative area for official CTDHUB course creation
            </p>
          </div>

          {!isConnected ? (
            <div className="text-center">
              <div className="card max-w-md mx-auto relative">
                <div className="corner corner--tl"></div>
                <div className="corner corner--tr"></div>
                <div className="corner corner--bl"></div>
                <div className="corner corner--br"></div>
                
                <div className="relative z-10 p-1 text-center">
                  <h3 className="text-xl font-semibold text-ctd-text mb-4">Connect Your Wallet</h3>
                  <p className="text-ctd-mute mb-6">Connect your wallet to access the developer area</p>
                  <button
                    onClick={connectWallet}
                    className="btn-primary"
                  >
                    Connect Wallet
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Admin Badge */}
              {isAdmin && (
                <div className="card relative border-ctd-yellow">
                  <div className="corner corner--tl"></div>
                  <div className="corner corner--tr"></div>
                  <div className="corner corner--bl"></div>
                  <div className="corner corner--br"></div>
                  
                  <div className="relative z-10 p-1 text-center">
                    <h2 className="text-2xl font-bold text-ctd-yellow mb-2">🔥 CTDHUB Admin</h2>
                    <p className="text-lg text-ctd-text">You have exclusive access to create official CTDHUB courses!</p>
                    <p className="text-sm text-ctd-mute mt-2">Wallet: {walletAddress}</p>
                  </div>
                </div>
              )}

              {/* Admin Course Creation */}
              {isAdmin && (
                <div className="card relative">
                  <div className="corner corner--tl"></div>
                  <div className="corner corner--tr"></div>
                  <div className="corner corner--bl"></div>
                  <div className="corner corner--br"></div>
                  
                  <div className="relative z-10 p-1">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-ctd-text">Create Official CTDHUB Course</h3>
                      <button
                        onClick={() => setShowAdminForm(!showAdminForm)}
                        className="btn-primary"
                      >
                        {showAdminForm ? 'Close' : 'New Course'}
                      </button>
                    </div>

                    <div className="flex gap-4 mb-6">
                      <button
                        onClick={syncCourses}
                        disabled={isLoading}
                        className="btn-ghost disabled:opacity-50"
                      >
                        {isLoading ? '🔄 Syncing...' : '🔄 Sync Courses'}
                      </button>
                    </div>

                    {showAdminForm && (
                      <form onSubmit={handleAdminCourseSubmit} className="space-y-4">
                        <div>
                          <label className="block text-ctd-text mb-2 font-medium">Course Title</label>
                          <input
                            type="text"
                            required
                            value={adminCourseData.title}
                            onChange={(e) => setAdminCourseData(prev => ({ ...prev, title: e.target.value }))}
                            className="w-full px-4 py-3 bg-ctd-panel border border-ctd-border rounded-lg text-ctd-text placeholder-ctd-mute focus:outline-none focus:ring-2 focus:ring-ctd-yellow"
                            placeholder="Ex: Blockchain Fundamentals"
                          />
                        </div>

                        <div>
                          <label className="block text-ctd-text mb-2 font-medium">Description</label>
                          <textarea
                            required
                            value={adminCourseData.description}
                            onChange={(e) => setAdminCourseData(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full px-4 py-3 bg-ctd-panel border border-ctd-border rounded-lg text-ctd-text placeholder-ctd-mute focus:outline-none focus:ring-2 focus:ring-ctd-yellow h-24 resize-none"
                            placeholder="Detailed course description..."
                          />
                        </div>

                        <div>
                          <label className="block text-ctd-text mb-2 font-medium">YouTube URL</label>
                          <input
                            type="url"
                            required
                            value={adminCourseData.youtubeUrl}
                            onChange={(e) => setAdminCourseData(prev => ({ ...prev, youtubeUrl: e.target.value }))}
                            className="w-full px-4 py-3 bg-ctd-panel border border-ctd-border rounded-lg text-ctd-text placeholder-ctd-mute focus:outline-none focus:ring-2 focus:ring-ctd-yellow"
                            placeholder="https://youtube.com/watch?v=..."
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-ctd-text mb-2 font-medium">Category</label>
                            <select
                              value={adminCourseData.category}
                              onChange={(e) => setAdminCourseData(prev => ({ ...prev, category: e.target.value }))}
                              className="w-full px-4 py-3 bg-ctd-panel border border-ctd-border rounded-lg text-ctd-text focus:outline-none focus:ring-2 focus:ring-ctd-yellow"
                            >
                              <option value="Blockchain">Blockchain</option>
                              <option value="DeFi">DeFi</option>
                              <option value="NFT">NFT</option>
                              <option value="Web3">Web3</option>
                              <option value="Trading">Trading</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-ctd-text mb-2 font-medium">Difficulty</label>
                            <select
                              value={adminCourseData.difficulty}
                              onChange={(e) => setAdminCourseData(prev => ({ ...prev, difficulty: e.target.value }))}
                              className="w-full px-4 py-3 bg-ctd-panel border border-ctd-border rounded-lg text-ctd-text focus:outline-none focus:ring-2 focus:ring-ctd-yellow"
                            >
                              <option value="Beginner">Beginner</option>
                              <option value="Intermediate">Intermediate</option>
                              <option value="Advanced">Advanced</option>
                            </select>
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full btn-primary disabled:opacity-50"
                        >
                          {isLoading ? '⏳ Creating Course...' : '🚀 Create CTDHUB Course'}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              )}

              {/* Non-admin message */}
              {!isAdmin && (
                <div className="card relative">
                  <div className="corner corner--tl"></div>
                  <div className="corner corner--tr"></div>
                  <div className="corner corner--bl"></div>
                  <div className="corner corner--br"></div>
                  
                  <div className="relative z-10 p-1 text-center">
                    <h2 className="text-xl font-bold text-ctd-text mb-4">Development Area</h2>
                    <p className="text-ctd-mute mb-4">
                      This area is reserved for CTDHUB administrators.
                      <br />
                      Only the ChainTalkDaily wallet can create official courses.
                    </p>
                    <p className="text-sm text-ctd-mute">
                      Your wallet: {walletAddress}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  )
}