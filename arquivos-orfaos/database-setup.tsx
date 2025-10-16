import { useState, useEffect } from 'react'
import Head from 'next/head'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function DatabaseSetupPage() {
  const [isChecking, setIsChecking] = useState(false)
  const [setupResult, setSetupResult] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Check if user has admin access (connected wallet)
    const wallet = localStorage.getItem('ctdhub:wallet')
    setIsAdmin(!!wallet)
  }, [])

  const checkDatabaseSetup = async () => {
    setIsChecking(true)
    setSetupResult(null)

    try {
      const response = await fetch('/.netlify/functions/database-setup', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()
      setSetupResult(result)
      
      if (result.success) {
        console.log('✅ Database setup verification complete:', result)
      } else {
        console.error('❌ Database setup issues:', result)
      }
    } catch (error) {
      console.error('❌ Database setup check failed:', error)
      setSetupResult({
        success: false,
        error: 'Failed to connect to database setup endpoint',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsChecking(false)
    }
  }

  const initializeDatabase = async () => {
    setIsChecking(true)
    setSetupResult(null)

    try {
      const response = await fetch('/.netlify/functions/database-setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'initialize'
        })
      })

      const result = await response.json()
      setSetupResult(result)
      
      if (result.success) {
        console.log('✅ Database initialization complete:', result)
      } else {
        console.error('❌ Database initialization failed:', result)
      }
    } catch (error) {
      console.error('❌ Database initialization failed:', error)
      setSetupResult({
        success: false,
        error: 'Failed to initialize database',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <div className="min-h-screen bg-ctd-bg dark:bg-ctd-bg-dark">
      <Head>
        <title>Database Setup - CTDHUB</title>
        <meta name="description" content="CTDHUB Database Setup and Verification" />
      </Head>

      <Header />

      <main className="py-24 spotlight">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white drop-shadow-neon mb-6">
              🗄️ Database Setup
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Verify and initialize the CTDHUB database to ensure persistent data storage
            </p>
          </div>

          {!isAdmin && (
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 mb-8">
              <h3 className="text-red-400 font-semibold mb-2">⚠️ Admin Access Required</h3>
              <p className="text-red-300">
                Please connect your wallet to access database setup tools.
              </p>
            </div>
          )}

          <div className="grid gap-8">
            {/* Database Status Check */}
            <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <span className="mr-3">🔍</span>
                Database Status Check
              </h2>
              
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Verify if all database tables are properly configured and accessible.
              </p>

              <button
                onClick={checkDatabaseSetup}
                disabled={!isAdmin || isChecking}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  !isAdmin || isChecking
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isChecking ? '🔄 Checking...' : '🔍 Check Database Status'}
              </button>
            </div>

            {/* Database Initialization */}
            <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <span className="mr-3">🚀</span>
                Database Initialization
              </h2>
              
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Create missing tables and set up the database schema for data persistence.
              </p>

              <button
                onClick={initializeDatabase}
                disabled={!isAdmin || isChecking}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  !isAdmin || isChecking
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-ctd-yellow hover:bg-ctd-yellow-dark text-black'
                }`}
              >
                {isChecking ? '🔄 Initializing...' : '🚀 Initialize Database'}
              </button>
            </div>

            {/* Results */}
            {setupResult && (
              <div className={`rounded-2xl p-8 border ${
                setupResult.success 
                  ? 'bg-green-900/20 border-green-500' 
                  : 'bg-red-900/20 border-red-500'
              }`}>
                <h2 className={`text-2xl font-bold mb-6 flex items-center ${
                  setupResult.success ? 'text-green-400' : 'text-red-400'
                }`}>
                  <span className="mr-3">{setupResult.success ? '✅' : '❌'}</span>
                  {setupResult.success ? 'Setup Successful' : 'Setup Failed'}
                </h2>

                <div className="space-y-4">
                  {setupResult.message && (
                    <p className={setupResult.success ? 'text-green-300' : 'text-red-300'}>
                      <strong>Message:</strong> {setupResult.message}
                    </p>
                  )}

                  {setupResult.error && (
                    <p className="text-red-300">
                      <strong>Error:</strong> {setupResult.error}
                    </p>
                  )}

                  {setupResult.details && (
                    <div className="mt-4">
                      <p className="text-gray-600 dark:text-gray-300 font-medium mb-2">Details:</p>
                      <pre className="bg-ctd-bg dark:bg-ctd-bg-dark p-4 rounded-lg text-sm text-gray-900 dark:text-white overflow-x-auto">
                        {typeof setupResult.details === 'string' 
                          ? setupResult.details 
                          : JSON.stringify(setupResult.details, null, 2)
                        }
                      </pre>
                    </div>
                  )}

                  {setupResult.tables && (
                    <div className="mt-4">
                      <p className="text-gray-600 dark:text-gray-300 font-medium mb-2">Table Status:</p>
                      <div className="grid gap-2">
                        {Object.entries(setupResult.tables).map(([table, status]: [string, any]) => (
                          <div key={table} className="flex items-center justify-between p-3 bg-ctd-bg dark:bg-ctd-bg-dark rounded-lg">
                            <span className="font-mono text-gray-900 dark:text-white">{table}</span>
                            <span className={`px-2 py-1 rounded text-sm ${
                              status.exists ? 'bg-green-600 text-green-100' : 'bg-red-600 text-red-100'
                            }`}>
                              {status.exists ? '✅ Exists' : '❌ Missing'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {setupResult.success && (
                  <div className="mt-6 p-4 bg-ctd-yellow/10 border border-ctd-yellow rounded-lg">
                    <p className="text-ctd-yellow">
                      <strong>🎉 Success!</strong> Your database is now properly configured. 
                      User data and content will persist across deployments.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}