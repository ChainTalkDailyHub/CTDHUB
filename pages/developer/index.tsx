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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Header />
      <section className="pt-20 pb-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white text-center mb-8">
            Dev Area
          </h1>

          {!isConnected ? (
            <div className="text-center">
              <button
                onClick={connectWallet}
                className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-lg font-semibold"
              >
                Conectar Carteira
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Admin Badge */}
              {isAdmin && (
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black p-6 rounded-lg text-center">
                  <h2 className="text-2xl font-bold mb-2">🔥 Admin CTDHUB</h2>
                  <p className="text-lg">Você tem acesso exclusivo para criar Cursos CTDHUB oficiais!</p>
                  <p className="text-sm mt-2">Wallet: {walletAddress}</p>
                </div>
              )}

              {/* Admin Course Creation */}
              {isAdmin && (
                <div className="bg-gray-800 p-6 rounded-lg">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">Criar Curso CTDHUB Oficial</h3>
                    <button
                      onClick={() => setShowAdminForm(!showAdminForm)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg font-semibold"
                    >
                      {showAdminForm ? 'Fechar' : 'Novo Curso'}
                    </button>
                  </div>

                  <div className="flex gap-4 mb-6">
                    <button
                      onClick={syncCourses}
                      disabled={isLoading}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                    >
                      {isLoading ? '🔄 Sincronizando...' : '🔄 Sincronizar Cursos'}
                    </button>
                  </div>

                  {showAdminForm && (
                    <form onSubmit={handleAdminCourseSubmit} className="space-y-4">
                      <div>
                        <label className="block text-white mb-2">Título do Curso</label>
                        <input
                          type="text"
                          required
                          value={adminCourseData.title}
                          onChange={(e) => setAdminCourseData(prev => ({ ...prev, title: e.target.value }))}
                          className="w-full p-3 bg-gray-700 text-white rounded-lg"
                          placeholder="Ex: Fundamentos do Blockchain"
                        />
                      </div>

                      <div>
                        <label className="block text-white mb-2">Descrição</label>
                        <textarea
                          required
                          value={adminCourseData.description}
                          onChange={(e) => setAdminCourseData(prev => ({ ...prev, description: e.target.value }))}
                          className="w-full p-3 bg-gray-700 text-white rounded-lg h-24"
                          placeholder="Descrição detalhada do curso..."
                        />
                      </div>

                      <div>
                        <label className="block text-white mb-2">URL do YouTube</label>
                        <input
                          type="url"
                          required
                          value={adminCourseData.youtubeUrl}
                          onChange={(e) => setAdminCourseData(prev => ({ ...prev, youtubeUrl: e.target.value }))}
                          className="w-full p-3 bg-gray-700 text-white rounded-lg"
                          placeholder="https://youtube.com/watch?v=..."
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-white mb-2">Categoria</label>
                          <select
                            value={adminCourseData.category}
                            onChange={(e) => setAdminCourseData(prev => ({ ...prev, category: e.target.value }))}
                            className="w-full p-3 bg-gray-700 text-white rounded-lg"
                          >
                            <option value="Blockchain">Blockchain</option>
                            <option value="DeFi">DeFi</option>
                            <option value="NFT">NFT</option>
                            <option value="Web3">Web3</option>
                            <option value="Trading">Trading</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-white mb-2">Dificuldade</label>
                          <select
                            value={adminCourseData.difficulty}
                            onChange={(e) => setAdminCourseData(prev => ({ ...prev, difficulty: e.target.value }))}
                            className="w-full p-3 bg-gray-700 text-white rounded-lg"
                          >
                            <option value="Beginner">Iniciante</option>
                            <option value="Intermediate">Intermediário</option>
                            <option value="Advanced">Avançado</option>
                          </select>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-black py-3 rounded-lg font-semibold disabled:opacity-50"
                      >
                        {isLoading ? '⏳ Criando Curso...' : '🚀 Criar Curso CTDHUB'}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* Non-admin message */}
              {!isAdmin && (
                <div className="bg-gray-800 p-6 rounded-lg text-center">
                  <h2 className="text-xl font-bold text-white mb-4">Área de Desenvolvimento</h2>
                  <p className="text-gray-300">
                    Esta área é reservada para administradores do CTDHUB.
                    <br />
                    Somente a carteira ChainTalkDaily pode criar cursos oficiais.
                  </p>
                  <p className="text-sm text-gray-400 mt-4">
                    Sua carteira: {walletAddress}
                  </p>
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