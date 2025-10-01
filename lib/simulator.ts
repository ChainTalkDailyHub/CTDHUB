import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Types for Web3 Project Launch Simulator
export interface SimulationDecision {
  id: string
  title: string
  description: string
  options: SimulationOption[]
  impact_areas: ImpactArea[]
  stage: SimulationStage
}

export interface SimulationOption {
  id: string
  text: string
  impact: Impact[]
  cost: number
  risk_level: RiskLevel
  bnb_relevance: number // 0-100, how relevant this choice is to BNB/BSC ecosystem
}

export interface Impact {
  area: ImpactArea
  value: number // -100 to +100
  explanation: string
}

export type ImpactArea = 
  | 'tokenomics'
  | 'community'
  | 'technology'
  | 'partnerships'
  | 'marketing'
  | 'legal_compliance'
  | 'bnb_integration'
  | 'defi_readiness'

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

export type SimulationStage = 
  | 'ideation'
  | 'development'
  | 'tokenomics'
  | 'community_building'
  | 'partnerships'
  | 'pre_launch'
  | 'launch'
  | 'post_launch'

export interface SimulationSession {
  id: string
  user_address: string
  project_name: string
  project_type: ProjectType
  current_stage: SimulationStage
  decisions_made: DecisionRecord[]
  current_score: ProjectScore
  session_status: 'active' | 'completed' | 'abandoned'
  created_at: string
  completed_at?: string
  final_outcome?: ProjectOutcome
}

export interface DecisionRecord {
  decision_id: string
  option_id: string
  stage: SimulationStage
  timestamp: string
  score_impact: Impact[]
}

export interface ProjectScore {
  overall: number // 0-100
  tokenomics: number
  community: number
  technology: number
  partnerships: number
  marketing: number
  legal_compliance: number
  bnb_integration: number
  defi_readiness: number
  risk_assessment: number
}

export type ProjectType = 
  | 'defi_protocol'
  | 'nft_marketplace'
  | 'gaming_dapp'
  | 'dao_governance'
  | 'yield_farming'
  | 'cross_chain_bridge'
  | 'metaverse_platform'
  | 'social_token'

export interface ProjectOutcome {
  success_probability: number // 0-100
  predicted_market_cap: string
  time_to_break_even: number // months
  main_strengths: string[]
  main_weaknesses: string[]
  bnb_ecosystem_fit: number // 0-100
  recommendations: string[]
  comparable_projects: string[]
}

export interface UserSimulatorStats {
  user_address: string
  total_simulations: number
  completed_simulations: number
  average_score: number
  best_score: number
  favorite_project_type: ProjectType
  total_time_spent: number // minutes
  achievements: Achievement[]
  bnb_expertise_level: number // 0-100
  created_at: string
  updated_at: string
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  unlocked_at: string
  bnb_related: boolean
}

export interface GlobalLeaderboard {
  user_address: string
  username?: string
  best_score: number
  total_simulations: number
  bnb_expertise: number
  achievements_count: number
  rank: number
}

// Simulator Service Class
export class SimulatorService {
  static async createSession(
    userAddress: string, 
    projectName: string, 
    projectType: ProjectType
  ): Promise<SimulationSession> {
    const session: Omit<SimulationSession, 'id'> = {
      user_address: userAddress.toLowerCase(),
      project_name: projectName,
      project_type: projectType,
      current_stage: 'ideation',
      decisions_made: [],
      current_score: this.getInitialScore(),
      session_status: 'active',
      created_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('simulation_sessions')
      .insert(session)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async getSession(sessionId: string): Promise<SimulationSession | null> {
    const { data, error } = await supabase
      .from('simulation_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (error) return null
    return data
  }

  static async updateSession(
    sessionId: string, 
    updates: Partial<SimulationSession>
  ): Promise<SimulationSession> {
    const { data, error } = await supabase
      .from('simulation_sessions')
      .update(updates)
      .eq('id', sessionId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async getUserSessions(userAddress: string): Promise<SimulationSession[]> {
    const { data, error } = await supabase
      .from('simulation_sessions')
      .select('*')
      .eq('user_address', userAddress.toLowerCase())
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  static async makeDecision(
    sessionId: string,
    decisionId: string,
    optionId: string,
    option: SimulationOption
  ): Promise<SimulationSession> {
    const session = await this.getSession(sessionId)
    if (!session) throw new Error('Session not found')

    // Record the decision
    const decisionRecord: DecisionRecord = {
      decision_id: decisionId,
      option_id: optionId,
      stage: session.current_stage,
      timestamp: new Date().toISOString(),
      score_impact: option.impact
    }

    // Update score based on decision impact
    const newScore = this.calculateNewScore(session.current_score, option.impact)

    // Update session
    const updatedSession = await this.updateSession(sessionId, {
      decisions_made: [...session.decisions_made, decisionRecord],
      current_score: newScore
    })

    return updatedSession
  }

  static async completeSimulation(
    sessionId: string
  ): Promise<{ session: SimulationSession; outcome: ProjectOutcome }> {
    const session = await this.getSession(sessionId)
    if (!session) throw new Error('Session not found')

    const outcome = this.calculateFinalOutcome(session)
    
    const completedSession = await this.updateSession(sessionId, {
      session_status: 'completed',
      completed_at: new Date().toISOString(),
      final_outcome: outcome
    })

    // Update user stats
    await this.updateUserStats(session.user_address, completedSession, outcome)

    return { session: completedSession, outcome }
  }

  static async getUserStats(userAddress: string): Promise<UserSimulatorStats | null> {
    const { data, error } = await supabase
      .from('user_simulator_stats')
      .select('*')
      .eq('user_address', userAddress.toLowerCase())
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  static async getGlobalLeaderboard(limit: number = 10): Promise<GlobalLeaderboard[]> {
    const { data, error } = await supabase
      .from('user_simulator_stats')
      .select(`
        user_address,
        best_score,
        total_simulations,
        bnb_expertise_level,
        achievements
      `)
      .order('best_score', { ascending: false })
      .limit(limit)

    if (error) throw error

    return (data || []).map((user, index) => ({
      user_address: user.user_address,
      best_score: user.best_score,
      total_simulations: user.total_simulations,
      bnb_expertise: user.bnb_expertise_level,
      achievements_count: user.achievements?.length || 0,
      rank: index + 1
    }))
  }

  private static getInitialScore(): ProjectScore {
    return {
      overall: 50,
      tokenomics: 50,
      community: 50,
      technology: 50,
      partnerships: 50,
      marketing: 50,
      legal_compliance: 50,
      bnb_integration: 60, // Slightly higher start for BNB focus
      defi_readiness: 50,
      risk_assessment: 50
    }
  }

  private static calculateNewScore(currentScore: ProjectScore, impacts: Impact[]): ProjectScore {
    const newScore = { ...currentScore }

    impacts.forEach(impact => {
      const currentValue = newScore[impact.area as keyof ProjectScore] as number
      const newValue = Math.max(0, Math.min(100, currentValue + impact.value))
      
      // Type-safe assignment
      switch(impact.area) {
        case 'tokenomics':
          newScore.tokenomics = newValue
          break
        case 'community':
          newScore.community = newValue
          break
        case 'technology':
          newScore.technology = newValue
          break
        case 'partnerships':
          newScore.partnerships = newValue
          break
        case 'marketing':
          newScore.marketing = newValue
          break
        case 'legal_compliance':
          newScore.legal_compliance = newValue
          break
        case 'bnb_integration':
          newScore.bnb_integration = newValue
          break
        case 'defi_readiness':
          newScore.defi_readiness = newValue
          break
      }
    })

    // Calculate overall score (weighted average with BNB integration having higher weight)
    newScore.overall = Math.round(
      (newScore.tokenomics * 0.15 +
       newScore.community * 0.12 +
       newScore.technology * 0.15 +
       newScore.partnerships * 0.10 +
       newScore.marketing * 0.10 +
       newScore.legal_compliance * 0.08 +
       newScore.bnb_integration * 0.20 + // Higher weight for BNB
       newScore.defi_readiness * 0.10)
    )

    // Risk assessment based on overall balance
    const scores = [
      newScore.tokenomics, newScore.community, newScore.technology,
      newScore.partnerships, newScore.marketing, newScore.legal_compliance,
      newScore.bnb_integration, newScore.defi_readiness
    ]
    const variance = this.calculateVariance(scores)
    newScore.risk_assessment = Math.max(0, Math.min(100, 100 - variance))

    return newScore
  }

  private static calculateVariance(scores: number[]): number {
    const mean = scores.reduce((a, b) => a + b) / scores.length
    const variance = scores.reduce((acc, score) => acc + Math.pow(score - mean, 2), 0) / scores.length
    return Math.sqrt(variance)
  }

  private static calculateFinalOutcome(session: SimulationSession): ProjectOutcome {
    const score = session.current_score
    const bnbBonus = score.bnb_integration > 80 ? 15 : score.bnb_integration > 60 ? 10 : 5

    const successProbability = Math.min(95, Math.max(5, score.overall + bnbBonus))
    
    // Market cap prediction based on score and BNB integration
    const baseMarketCap = this.getBaseMarketCap(session.project_type)
    const multiplier = (score.overall + score.bnb_integration) / 100
    const predictedMarketCap = `$${(baseMarketCap * multiplier).toFixed(1)}M`

    return {
      success_probability: successProbability,
      predicted_market_cap: predictedMarketCap,
      time_to_break_even: Math.max(3, Math.round(24 - (score.overall / 5))),
      main_strengths: this.getMainStrengths(score),
      main_weaknesses: this.getMainWeaknesses(score),
      bnb_ecosystem_fit: score.bnb_integration,
      recommendations: this.getRecommendations(score, session.project_type),
      comparable_projects: this.getComparableProjects(session.project_type, score.bnb_integration)
    }
  }

  private static getBaseMarketCap(projectType: ProjectType): number {
    const marketCaps = {
      defi_protocol: 100,
      nft_marketplace: 50,
      gaming_dapp: 200,
      dao_governance: 75,
      yield_farming: 150,
      cross_chain_bridge: 300,
      metaverse_platform: 500,
      social_token: 25
    }
    return marketCaps[projectType] || 100
  }

  private static getMainStrengths(score: ProjectScore): string[] {
    const strengths: string[] = []
    if (score.bnb_integration >= 80) strengths.push("Excellent BNB Chain integration")
    if (score.tokenomics >= 75) strengths.push("Solid tokenomics model")
    if (score.community >= 75) strengths.push("Strong community foundation")
    if (score.technology >= 75) strengths.push("Robust technical architecture")
    if (score.defi_readiness >= 75) strengths.push("DeFi ecosystem ready")
    return strengths.slice(0, 3)
  }

  private static getMainWeaknesses(score: ProjectScore): string[] {
    const weaknesses: string[] = []
    if (score.bnb_integration < 50) weaknesses.push("Limited BNB Chain utilization")
    if (score.tokenomics < 50) weaknesses.push("Tokenomics needs improvement")
    if (score.community < 50) weaknesses.push("Community building required")
    if (score.legal_compliance < 50) weaknesses.push("Regulatory compliance gaps")
    if (score.risk_assessment < 50) weaknesses.push("High risk profile")
    return weaknesses.slice(0, 3)
  }

  private static getRecommendations(score: ProjectScore, projectType: ProjectType): string[] {
    const recommendations: string[] = []
    
    // Always recommend BNB optimization if not at max
    if (score.bnb_integration < 90) {
      recommendations.push("Leverage more BNB Chain features like fast transactions and low fees")
    }

    if (score.community < 70) {
      recommendations.push("Focus on community building through BNB-based incentives")
    }

    if (score.partnerships < 70) {
      recommendations.push("Partner with established BNB ecosystem projects")
    }

    return recommendations.slice(0, 3)
  }

  private static getComparableProjects(projectType: ProjectType, bnbIntegration: number): string[] {
    const bnbProjects = {
      defi_protocol: ["PancakeSwap", "Venus Protocol", "Alpaca Finance"],
      nft_marketplace: ["Treasureland", "AirNFTs", "Venly Market"],
      gaming_dapp: ["Mobox", "CryptoBlades", "My Neighbor Alice"],
      dao_governance: ["SafePal", "Impossible Finance", "Burrow"],
      yield_farming: ["Beefy Finance", "AutoFarm", "Belt Finance"],
      cross_chain_bridge: ["Multichain", "Stargate", "Synapse"],
      metaverse_platform: ["SecondLive", "X World Games", "Alien Worlds"],
      social_token: ["STEPN", "Hooked Protocol", "BinaryX"]
    }

    return bnbProjects[projectType] || ["BNB Chain Projects"]
  }

  private static async updateUserStats(
    userAddress: string, 
    session: SimulationSession, 
    outcome: ProjectOutcome
  ): Promise<void> {
    const existingStats = await this.getUserStats(userAddress)
    
    if (existingStats) {
      // Update existing stats
      const newStats = {
        total_simulations: existingStats.total_simulations + 1,
        completed_simulations: existingStats.completed_simulations + 1,
        average_score: Math.round(
          (existingStats.average_score * existingStats.completed_simulations + session.current_score.overall) / 
          (existingStats.completed_simulations + 1)
        ),
        best_score: Math.max(existingStats.best_score, session.current_score.overall),
        bnb_expertise_level: Math.min(100, existingStats.bnb_expertise_level + 
          (session.current_score.bnb_integration > 80 ? 5 : 2)),
        updated_at: new Date().toISOString()
      }

      await supabase
        .from('user_simulator_stats')
        .update(newStats)
        .eq('user_address', userAddress.toLowerCase())
    } else {
      // Create new stats
      const newStats: Omit<UserSimulatorStats, 'achievements'> = {
        user_address: userAddress.toLowerCase(),
        total_simulations: 1,
        completed_simulations: 1,
        average_score: session.current_score.overall,
        best_score: session.current_score.overall,
        favorite_project_type: session.project_type,
        total_time_spent: 0,
        bnb_expertise_level: session.current_score.bnb_integration > 80 ? 10 : 5,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      await supabase
        .from('user_simulator_stats')
        .insert({ ...newStats, achievements: [] })
    }
  }
}