-- Web3 Project Launch Simulator Database Schema
-- Execute este SQL no Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Simulation Sessions Table
CREATE TABLE IF NOT EXISTS simulation_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_address TEXT NOT NULL,
    project_name TEXT NOT NULL,
    project_type TEXT NOT NULL CHECK (project_type IN (
        'defi_protocol',
        'nft_marketplace', 
        'gaming_dapp',
        'dao_governance',
        'yield_farming',
        'cross_chain_bridge',
        'metaverse_platform',
        'social_token'
    )),
    current_stage TEXT NOT NULL DEFAULT 'ideation' CHECK (current_stage IN (
        'ideation',
        'development',
        'tokenomics',
        'community_building',
        'partnerships',
        'pre_launch',
        'launch',
        'post_launch'
    )),
    decisions_made JSONB DEFAULT '[]'::jsonb,
    current_score JSONB NOT NULL DEFAULT '{
        "overall": 50,
        "tokenomics": 50,
        "community": 50,
        "technology": 50,
        "partnerships": 50,
        "marketing": 50,
        "legal_compliance": 50,
        "bnb_integration": 60,
        "defi_readiness": 50,
        "risk_assessment": 50
    }'::jsonb,
    session_status TEXT NOT NULL DEFAULT 'active' CHECK (session_status IN ('active', 'completed', 'abandoned')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    final_outcome JSONB,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Simulator Stats Table
CREATE TABLE IF NOT EXISTS user_simulator_stats (
    user_address TEXT PRIMARY KEY,
    total_simulations INTEGER DEFAULT 0,
    completed_simulations INTEGER DEFAULT 0,
    average_score INTEGER DEFAULT 0,
    best_score INTEGER DEFAULT 0,
    favorite_project_type TEXT,
    total_time_spent INTEGER DEFAULT 0, -- minutes
    achievements JSONB DEFAULT '[]'::jsonb,
    bnb_expertise_level INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_simulation_sessions_user_address ON simulation_sessions(user_address);
CREATE INDEX IF NOT EXISTS idx_simulation_sessions_status ON simulation_sessions(session_status);
CREATE INDEX IF NOT EXISTS idx_simulation_sessions_created_at ON simulation_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_user_simulator_stats_best_score ON user_simulator_stats(best_score DESC);
CREATE INDEX IF NOT EXISTS idx_user_simulator_stats_bnb_expertise ON user_simulator_stats(bnb_expertise_level DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_simulation_sessions_updated_at ON simulation_sessions;
CREATE TRIGGER update_simulation_sessions_updated_at
    BEFORE UPDATE ON simulation_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_simulator_stats_updated_at ON user_simulator_stats;
CREATE TRIGGER update_user_simulator_stats_updated_at
    BEFORE UPDATE ON user_simulator_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE simulation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_simulator_stats ENABLE ROW LEVEL SECURITY;

-- Allow read access to all authenticated users
CREATE POLICY "Allow read access to all users" ON simulation_sessions
    FOR SELECT USING (true);

CREATE POLICY "Allow read access to all users" ON user_simulator_stats
    FOR SELECT USING (true);

-- Allow users to insert their own sessions
CREATE POLICY "Users can insert their own sessions" ON simulation_sessions
    FOR INSERT WITH CHECK (true);

-- Allow users to update their own sessions
CREATE POLICY "Users can update their own sessions" ON simulation_sessions
    FOR UPDATE USING (true);

-- Allow users to insert their own stats
CREATE POLICY "Users can insert their own stats" ON user_simulator_stats
    FOR INSERT WITH CHECK (true);

-- Allow users to update their own stats
CREATE POLICY "Users can update their own stats" ON user_simulator_stats
    FOR UPDATE USING (true);

-- Sample data for testing (optional)
INSERT INTO simulation_sessions (
    user_address,
    project_name,
    project_type,
    current_stage,
    session_status,
    current_score,
    completed_at,
    final_outcome
) VALUES 
(
    '0x742d35Cc6e1A4e60ce0bc093b7bB4b3E9E9A5B7A',
    'BNB DeFi Pro',
    'defi_protocol',
    'post_launch',
    'completed',
    '{
        "overall": 92,
        "tokenomics": 95,
        "community": 88,
        "technology": 94,
        "partnerships": 90,
        "marketing": 85,
        "legal_compliance": 87,
        "bnb_integration": 98,
        "defi_readiness": 96,
        "risk_assessment": 89
    }'::jsonb,
    NOW(),
    '{
        "success_probability": 92,
        "predicted_market_cap": "$184.0M",
        "time_to_break_even": 6,
        "main_strengths": ["Excellent BNB Chain integration", "Solid tokenomics model", "Robust technical architecture"],
        "main_weaknesses": [],
        "bnb_ecosystem_fit": 98,
        "recommendations": ["Consider expanding to other BNB ecosystem features"],
        "comparable_projects": ["PancakeSwap", "Venus Protocol", "Alpaca Finance"]
    }'::jsonb
),
(
    '0x8ba1f109551bD432803012645Hac136c40692745',
    'GameFi Arena',
    'gaming_dapp',
    'post_launch', 
    'completed',
    '{
        "overall": 78,
        "tokenomics": 80,
        "community": 85,
        "technology": 75,
        "partnerships": 70,
        "marketing": 90,
        "legal_compliance": 65,
        "bnb_integration": 85,
        "defi_readiness": 70,
        "risk_assessment": 75
    }'::jsonb,
    NOW(),
    '{
        "success_probability": 78,
        "predicted_market_cap": "$156.0M",
        "time_to_break_even": 12,
        "main_strengths": ["Strong community foundation", "BNB Chain integration"],
        "main_weaknesses": ["Regulatory compliance gaps"],
        "bnb_ecosystem_fit": 85,
        "recommendations": ["Focus on community building through BNB-based incentives", "Partner with established BNB ecosystem projects"],
        "comparable_projects": ["Mobox", "CryptoBlades", "My Neighbor Alice"]
    }'::jsonb
);

-- Insert corresponding user stats
INSERT INTO user_simulator_stats (
    user_address,
    total_simulations,
    completed_simulations,
    average_score,
    best_score,
    favorite_project_type,
    bnb_expertise_level,
    achievements
) VALUES 
(
    '0x742d35Cc6e1A4e60ce0bc093b7bB4b3E9E9A5B7A',
    3,
    3,
    88,
    92,
    'defi_protocol',
    95,
    '[
        {
            "id": "bnb_master",
            "name": "BNB Master",
            "description": "Achieved 95+ BNB integration score",
            "icon": "🏆",
            "rarity": "legendary",
            "unlocked_at": "2025-10-01T10:00:00Z",
            "bnb_related": true
        },
        {
            "id": "defi_expert",
            "name": "DeFi Expert", 
            "description": "Completed 3 DeFi protocol simulations",
            "icon": "⚡",
            "rarity": "epic",
            "unlocked_at": "2025-10-01T10:00:00Z",
            "bnb_related": true
        }
    ]'::jsonb
),
(
    '0x8ba1f109551bD432803012645Hac136c40692745',
    2,
    2,
    76,
    78,
    'gaming_dapp',
    80,
    '[
        {
            "id": "gaming_pioneer",
            "name": "Gaming Pioneer",
            "description": "First GameFi simulation completed",
            "icon": "🎮",
            "rarity": "rare",
            "unlocked_at": "2025-10-01T11:00:00Z",
            "bnb_related": true
        }
    ]'::jsonb
);

-- Verification queries
SELECT 'Simulation Sessions Count:' as info, COUNT(*) as count FROM simulation_sessions;
SELECT 'User Stats Count:' as info, COUNT(*) as count FROM user_simulator_stats;
SELECT 'Sample Leaderboard:' as info, user_address, best_score, bnb_expertise_level FROM user_simulator_stats ORDER BY best_score DESC;

COMMENT ON TABLE simulation_sessions IS 'Stores Web3 project launch simulation sessions with decisions and scoring';
COMMENT ON TABLE user_simulator_stats IS 'Tracks user statistics and achievements in the simulator';
COMMENT ON COLUMN simulation_sessions.bnb_integration IS 'Score for BNB Chain ecosystem integration (weighted higher in overall score)';
COMMENT ON COLUMN user_simulator_stats.bnb_expertise_level IS 'User expertise level with BNB Chain ecosystem (0-100)';