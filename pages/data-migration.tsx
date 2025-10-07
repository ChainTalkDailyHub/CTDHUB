import { useState, useEffect } from 'react'
import Head from 'next/head'
import Header from '../components/Header'
import Footer from '../components/Footer'

interface DataStatus {
  courses: { count: number; samples: any[]; error: string | null }
  course_videos: { count: number; samples: any[]; error: string | null }
  video_comments: { count: number; samples: any[]; error: string | null }
  user_profiles: { count: number; samples: any[]; error: string | null }
}

export default function DataMigrationPage() {
  const [dataStatus, setDataStatus] = useState<DataStatus | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [migrationResults, setMigrationResults] = useState<any>(null)
  const [userAddress, setUserAddress] = useState('')

  useEffect(() => {
    // Check if user is connected
    if (typeof window !== 'undefined') {
      const address = localStorage.getItem('userWalletAddress')
      if (address) {
        setUserAddress(address)
      }
    }
  }, [])

  const checkDataStatus = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/.netlify/functions/data-migration', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (response.ok) {
        const data = await response.json()
        setDataStatus(data.data_status)
      } else {
        console.error('Failed to check data status')
      }
    } catch (error) {
      console.error('Error checking data status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const migrateLocalData = async () => {
    if (!userAddress) {
      alert('Please connect your wallet first')
      return
    }

    setIsLoading(true)
    try {
      // Get local data from localStorage
      const localCourses = JSON.parse(localStorage.getItem('courses') || '[]')
      const localComments = JSON.parse(localStorage.getItem('video_comments') || '[]')
      const localProfiles = JSON.parse(localStorage.getItem('user_profiles') || '[]')

      const response = await fetch('/.netlify/functions/data-migration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-address': userAddress
        },
        body: JSON.stringify({
          localCourses,
          localComments,
          localProfiles
        })
      })

      if (response.ok) {
        const data = await response.json()
        setMigrationResults(data.migration_results)
        // Refresh data status
        await checkDataStatus()
      } else {
        console.error('Failed to migrate data')
      }
    } catch (error) {
      console.error('Error migrating data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkDataStatus()
  }, [])

  return (
    <>
      <Head>
        <title>Data Migration - CTDHUB</title>
        <meta name="description" content="Check and migrate data to ensure no content is lost during updates" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-ctd-bg">
        <Header />
        
        <main className="pt-24 pb-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                  Data Migration Center
                </span>
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Verificação e migração de dados para garantir que nenhum conteúdo seja perdido durante atualizações
              </p>
            </div>

            {/* Connection Status */}
            <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">Status da Conexão</h2>
              <div className="flex items-center gap-4">
                <div className={`w-4 h-4 rounded-full ${userAddress ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-gray-300">
                  {userAddress ? `Conectado: ${userAddress.slice(0, 6)}...${userAddress.slice(-4)}` : 'Não conectado'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={checkDataStatus}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                {isLoading ? 'Verificando...' : 'Verificar Status dos Dados'}
              </button>
              
              <button
                onClick={migrateLocalData}
                disabled={isLoading || !userAddress}
                className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 text-black font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                {isLoading ? 'Migrando...' : 'Migrar Dados Locais'}
              </button>
            </div>

            {/* Data Status */}
            {dataStatus && (
              <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 mb-8">
                <h2 className="text-2xl font-bold text-white mb-6">Status dos Dados no Supabase</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {Object.entries(dataStatus).map(([table, status]) => (
                    <div key={table} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-white capitalize">
                          {table.replace('_', ' ')}
                        </h3>
                        <div className={`w-3 h-3 rounded-full ${status.error ? 'bg-red-500' : 'bg-green-500'}`}></div>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-gray-300">
                          <span className="font-medium">Registros:</span> {status.count}
                        </p>
                        
                        {status.error && (
                          <p className="text-red-400 text-sm">
                            <span className="font-medium">Erro:</span> {status.error}
                          </p>
                        )}
                        
                        {status.samples.length > 0 && (
                          <div className="mt-3">
                            <p className="text-gray-400 text-sm mb-2">Exemplos:</p>
                            <div className="bg-gray-800 rounded p-2 max-h-32 overflow-y-auto">
                              <pre className="text-xs text-gray-300">
                                {JSON.stringify(status.samples[0], null, 2)}
                              </pre>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Migration Results */}
            {migrationResults && (
              <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 mb-8">
                <h2 className="text-2xl font-bold text-white mb-6">Resultados da Migração</h2>
                
                <div className="space-y-4">
                  {migrationResults.courses_migrated && (
                    <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                      <p className="text-green-400">
                        ✅ {migrationResults.courses_migrated} cursos migrados com sucesso
                      </p>
                    </div>
                  )}
                  
                  {migrationResults.comments_migrated && (
                    <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                      <p className="text-green-400">
                        ✅ {migrationResults.comments_migrated} comentários migrados com sucesso
                      </p>
                    </div>
                  )}
                  
                  {migrationResults.profiles_migrated && (
                    <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                      <p className="text-green-400">
                        ✅ {migrationResults.profiles_migrated} perfis migrados com sucesso
                      </p>
                    </div>
                  )}

                  {(migrationResults.courses_error || migrationResults.comments_error || migrationResults.profiles_error) && (
                    <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                      <p className="text-red-400 mb-2">⚠️ Erros durante a migração:</p>
                      {migrationResults.courses_error && <p className="text-red-300 text-sm">Cursos: {migrationResults.courses_error}</p>}
                      {migrationResults.comments_error && <p className="text-red-300 text-sm">Comentários: {migrationResults.comments_error}</p>}
                      {migrationResults.profiles_error && <p className="text-red-300 text-sm">Perfis: {migrationResults.profiles_error}</p>}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Information */}
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">ℹ️ Informações Importantes</h2>
              <div className="space-y-3 text-gray-300">
                <p>
                  • Esta ferramenta permite verificar se seus dados estão salvos no Supabase de forma segura.
                </p>
                <p>
                  • A migração move dados do localStorage para o banco de dados permanente, evitando perdas em atualizações.
                </p>
                <p>
                  • Todos os dados são preservados e sincronizados entre dispositivos após a migração.
                </p>
                <p>
                  • É recomendado executar a migração sempre que atualizar a plataforma.
                </p>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  )
}