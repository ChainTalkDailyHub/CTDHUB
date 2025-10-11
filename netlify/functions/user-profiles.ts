import { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase with multiple fallback options
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 
                   process.env.SUPABASE_URL || 
                   'process.env.SUPABASE_URL'

const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                   process.env.SUPABASE_ANON_KEY || 
                   'process.env.SUPABASE_ANON_KEY'

let supabase: any = null

try {
  supabase = createClient(supabaseUrl, supabaseKey)
  console.log('✅ Supabase initialized successfully')
  console.log('📍 URL:', supabaseUrl.substring(0, 30) + '...')
} catch (error) {
  console.error('❌ Supabase initialization failed:', error)
  console.log('URL:', supabaseUrl ? 'Present' : 'Missing')
  console.log('KEY:', supabaseKey ? 'Present' : 'Missing')
}

interface UserProfile {
  id?: string
  wallet_address: string
  name?: string
  profession?: string
  web3_experience?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  project_name?: string
  bio?: string
  avatar_url?: string
  created_at?: string
  updated_at?: string
}

const handler: Handler = async (event, context) => {
  console.log('User Profiles Function - Method:', event.httpMethod)
  console.log('User Profiles Function - Headers:', JSON.stringify(event.headers, null, 2))
  console.log('User Profiles Function - Body:', event.body)

  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, x-user-address',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Content-Type': 'application/json',
  }

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    }
  }

  try {
    // GET - Fetch user profile
    if (event.httpMethod === 'GET') {
      const walletAddress = event.queryStringParameters?.walletAddress

      if (!walletAddress) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Wallet address is required' }),
        }
      }

      if (!supabase) {
        console.log('Supabase not configured, returning default profile')
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            wallet_address: walletAddress,
            name: null,
            profession: null,
            web3_experience: null,
            project_name: null,
            bio: null
          }),
        }
      }

      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('wallet_address', walletAddress.toLowerCase())
          .single()

        if (error && error.code !== 'PGRST116') {
          console.error('Supabase error:', error)
        }

        const profile = data || {
          wallet_address: walletAddress,
          name: null,
          profession: null,
          web3_experience: null,
          project_name: null,
          bio: null
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(profile),
        }
      } catch (supabaseError) {
        console.error('Supabase fetch error:', supabaseError)
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            wallet_address: walletAddress,
            name: null,
            profession: null,
            web3_experience: null,
            project_name: null,
            bio: null
          }),
        }
      }
    }

    // POST/PUT - Create or update user profile
    if (event.httpMethod === 'POST' || event.httpMethod === 'PUT') {
      const userAddress = event.headers['x-user-address']

      if (!userAddress || !userAddress.startsWith('0x')) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Valid wallet address required in x-user-address header' }),
        }
      }

      let body
      try {
        body = JSON.parse(event.body || '{}')
      } catch (parseError) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid JSON body' }),
        }
      }

      const { name, profession, web3_experience, project_name, bio, avatar_url } = body

      // Validate experience level
      const validExperiences = ['beginner', 'intermediate', 'advanced', 'expert']
      if (web3_experience && !validExperiences.includes(web3_experience)) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: 'Invalid experience level. Must be: beginner, intermediate, advanced, or expert'
          }),
        }
      }

      const profileData: Partial<UserProfile> = {}
      if (name !== undefined) profileData.name = name.trim()
      if (profession !== undefined) profileData.profession = profession.trim()
      if (web3_experience !== undefined) profileData.web3_experience = web3_experience
      if (project_name !== undefined) profileData.project_name = project_name.trim()
      if (bio !== undefined) profileData.bio = bio.trim()
      if (avatar_url !== undefined) profileData.avatar_url = avatar_url

      if (!supabase) {
        console.log('Supabase not configured, using local storage simulation')
        
        // Create a mock profile response
        const mockProfile = {
          id: `mock_${userAddress}`,
          wallet_address: userAddress,
          ...profileData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(mockProfile),
        }
      }

      try {
        const normalizedAddress = userAddress.toLowerCase()
        
        // Try to update first
        const { data: existingProfile } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('wallet_address', normalizedAddress)
          .single()

        const profilePayload = {
          ...profileData,
          wallet_address: normalizedAddress,
          updated_at: new Date().toISOString()
        }

        let result
        if (existingProfile) {
          // Update existing profile
          const { data, error } = await supabase
            .from('user_profiles')
            .update(profilePayload)
            .eq('wallet_address', normalizedAddress)
            .select()
            .single()

          if (error) {
            console.error('Error updating profile:', error)
            return {
              statusCode: 500,
              headers,
              body: JSON.stringify({ error: 'Failed to update profile', details: error.message }),
            }
          }

          result = data
        } else {
          // Create new profile
          const { data, error } = await supabase
            .from('user_profiles')
            .insert({
              ...profilePayload,
              created_at: new Date().toISOString()
            })
            .select()
            .single()

          if (error) {
            console.error('Error creating profile:', error)
            return {
              statusCode: 500,
              headers,
              body: JSON.stringify({ error: 'Failed to create profile', details: error.message }),
            }
          }

          result = data
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(result),
        }
      } catch (supabaseError) {
        console.error('Supabase operation error:', supabaseError)
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ 
            error: 'Database operation failed', 
            details: supabaseError instanceof Error ? supabaseError.message : 'Unknown error'
          }),
        }
      }
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  } catch (error) {
    console.error('Function error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
    }
  }
}

export { handler }