import { supabase } from './supabase'

export interface UserProfile {
  id: string
  wallet_address: string
  name?: string
  profession?: string
  web3_experience?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  project_name?: string
  bio?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export async function getUserProfile(walletAddress: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('wallet_address', walletAddress.toLowerCase())
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // Profile doesn't exist
        return null
      }
      console.error('Error fetching user profile:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in getUserProfile:', error)
    return null
  }
}

export async function createOrUpdateUserProfile(
  walletAddress: string, 
  profileData: Partial<UserProfile>
): Promise<UserProfile | null> {
  try {
    const normalizedAddress = walletAddress.toLowerCase()
    
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
        return null
      }

      return data
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
        return null
      }

      return data
    }
  } catch (error) {
    console.error('Error in createOrUpdateUserProfile:', error)
    return null
  }
}

export async function getAllUserProfiles(): Promise<UserProfile[]> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching all profiles:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getAllUserProfiles:', error)
    return []
  }
}