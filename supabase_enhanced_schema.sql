-- Enhanced Web3 Project Launch Simulator Database Schema
-- Updated with advanced difficulty system for intelligent developers
-- + Binno AI Conversational System

-- Simulation Sessions Table (Enhanced)
CREATE TABLE IF NOT EXISTS simulation_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_address TEXT NOT NULL,
    project_name TEXT NOT NULL,
    project_type TEXT NOT NULL CHECK (project_type IN (
        'defi_protocol', 'nft_marketplace', 'gaming_dapp', 
        'dao_governance', 'yield_farming', 'cross_chain_bridge',
        'metaverse_platform', 'social_token'
    )),
    current_stage TEXT NOT NULL DEFAULT 'ideation' CHECK (current_stage IN (
        'ideation', 'development', 'tokenomics', 'community_building',
        'partnerships', 'pre_launch', 'launch', 'post_launch'
    )),
    
    -- Advanced scoring system
    current_score JSONB NOT NULL DEFAULT '{"overall": 50, "tokenomics": 50, "community": 50, "technology": 50, "partnerships": 50, "marketing": 50, "legal_compliance": 50, "bnb_integration": 60, "defi_readiness": 50, "risk_assessment": 50}',
    decisions_made JSONB[] DEFAULT '{}',
    
    -- Session status
    session_status TEXT NOT NULL DEFAULT 'active' CHECK (session_status IN ('active', 'completed', 'abandoned', 'failed')),
    
    -- Simulator type
    simulator_type TEXT DEFAULT 'traditional' CHECK (simulator_type IN ('traditional', 'binno_ai')),
    
    -- Difficulty system fields
    total_budget INTEGER NOT NULL DEFAULT 800,
    remaining_budget INTEGER NOT NULL DEFAULT 800,
    accumulated_risks TEXT[] DEFAULT '{}',
    failed_decisions TEXT[] DEFAULT '{}',
    market_sentiment INTEGER DEFAULT 0 CHECK (market_sentiment >= -100 AND market_sentiment <= 100),
    reputation_score INTEGER DEFAULT 50 CHECK (reputation_score >= 0 AND reputation_score <= 100),
    crisis_points INTEGER DEFAULT 0,
    is_failed BOOLEAN DEFAULT FALSE,
    failure_reason TEXT,
    cascading_consequences TEXT[] DEFAULT '{}',
    team_morale INTEGER DEFAULT 80 CHECK (team_morale >= 0 AND team_morale <= 100),
    time_pressure INTEGER DEFAULT 365, -- Days remaining
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    
    -- Final outcome (populated when completed)
    final_outcome JSONB
);

-- Binno AI Conversations Table (New)
CREATE TABLE IF NOT EXISTS binno_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES simulation_sessions(id) ON DELETE CASCADE,
    stage TEXT NOT NULL,
    scenario_id TEXT NOT NULL,
    scenario_title TEXT NOT NULL,
    scenario_description TEXT NOT NULL,
    scenario_context TEXT NOT NULL,
    user_response TEXT NOT NULL,
    response_length INTEGER GENERATED ALWAYS AS (char_length(user_response)) STORED,
    
    -- AI Analysis Results
    binno_analysis JSONB NOT NULL,
    overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
    strengths_identified TEXT[] DEFAULT '{}',
    weaknesses_identified TEXT[] DEFAULT '{}',
    improvement_suggestions TEXT[] DEFAULT '{}',
    
    -- Impact and Consequences
    score_impact INTEGER NOT NULL,
    reputation_impact INTEGER NOT NULL,
    consequence_description TEXT NOT NULL,
    
    -- Metadata
    difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    bnb_relevance INTEGER NOT NULL CHECK (bnb_relevance >= 0 AND bnb_relevance <= 100),
    analysis_time_ms INTEGER, -- Time taken for AI analysis
    
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Binno Mentor Sessions Table (New)
CREATE TABLE IF NOT EXISTS binno_mentor_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES simulation_sessions(id) ON DELETE CASCADE,
    final_score INTEGER NOT NULL,
    bnb_expertise_level INTEGER NOT NULL CHECK (bnb_expertise_level >= 0 AND bnb_expertise_level <= 100),
    
    -- Mentoring Data
    mentor_data JSONB NOT NULL,
    overall_assessment TEXT NOT NULL,
    major_mistakes JSONB[] DEFAULT '{}',
    key_successes JSONB[] DEFAULT '{}',
    personalized_roadmap TEXT[] DEFAULT '{}',
    next_learning_steps TEXT[] DEFAULT '{}',
    
    -- Session Metrics
    total_conversations INTEGER DEFAULT 0,
    avg_response_quality DECIMAL(3,1) DEFAULT 0,
    strongest_area TEXT,
    weakest_area TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enhanced User Simulator Stats Table
CREATE TABLE IF NOT EXISTS user_simulator_stats (
    user_address TEXT PRIMARY KEY,
    total_simulations INTEGER DEFAULT 0,
    completed_simulations INTEGER DEFAULT 0,
    failed_simulations INTEGER DEFAULT 0,
    
    -- Traditional Simulator Stats
    traditional_simulations INTEGER DEFAULT 0,
    traditional_avg_score DECIMAL(5,2) DEFAULT 0,
    traditional_best_score DECIMAL(5,2) DEFAULT 0,
    
    -- Binno AI Simulator Stats
    binno_simulations INTEGER DEFAULT 0,
    binno_avg_score DECIMAL(5,2) DEFAULT 0,
    binno_best_score DECIMAL(5,2) DEFAULT 0,
    binno_avg_response_length INTEGER DEFAULT 0,
    binno_best_expertise_level INTEGER DEFAULT 0,
    
    -- Overall Stats
    average_score DECIMAL(5,2) DEFAULT 0,
    best_score DECIMAL(5,2) DEFAULT 0,
    worst_score DECIMAL(5,2) DEFAULT 100,
    favorite_project_type TEXT,
    total_time_spent INTEGER DEFAULT 0, -- minutes
    total_budget_managed BIGINT DEFAULT 0,
    total_crises_survived INTEGER DEFAULT 0,
    total_market_events_experienced INTEGER DEFAULT 0,
    
    -- Learning Progress
    total_mentor_sessions INTEGER DEFAULT 0,
    learning_areas_improved TEXT[] DEFAULT '{}',
    achievements JSONB[] DEFAULT '{}',
    
    -- Expertise Levels
    bnb_expertise_level INTEGER DEFAULT 0 CHECK (bnb_expertise_level >= 0 AND bnb_expertise_level <= 100),
    difficulty_preference TEXT DEFAULT 'normal' CHECK (difficulty_preference IN ('easy', 'normal', 'hard', 'expert')),
    preferred_simulator TEXT DEFAULT 'traditional' CHECK (preferred_simulator IN ('traditional', 'binno_ai', 'both')),
    
    -- Performance Metrics
    survival_rate DECIMAL(5,2) DEFAULT 0, -- Percentage of simulations that didn't fail
    improvement_rate DECIMAL(5,2) DEFAULT 0, -- Rate of score improvement over time
    consistency_score DECIMAL(5,2) DEFAULT 0, -- How consistent performance is
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Learning Analytics Table (New)
CREATE TABLE IF NOT EXISTS binno_learning_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_address TEXT NOT NULL,
    session_id UUID REFERENCES simulation_sessions(id) ON DELETE CASCADE,
    
    -- Learning Metrics
    decision_quality_trend DECIMAL(3,1)[] DEFAULT '{}', -- Track improvement over stages
    response_depth_scores INTEGER[] DEFAULT '{}', -- Track response quality
    bnb_understanding_progression INTEGER[] DEFAULT '{}', -- Track BNB expertise growth
    weak_areas_identified TEXT[] DEFAULT '{}',
    strong_areas_identified TEXT[] DEFAULT '{}',
    
    -- Behavioral Patterns
    risk_tolerance TEXT CHECK (risk_tolerance IN ('low', 'medium', 'high', 'extreme')),
    decision_speed_avg INTEGER, -- Average time to respond in seconds
    strategic_thinking_level INTEGER CHECK (strategic_thinking_level >= 1 AND strategic_thinking_level <= 10),
    innovation_score INTEGER CHECK (innovation_score >= 1 AND innovation_score <= 10),
    
    -- Improvement Recommendations (AI Generated)
    recommended_focus_areas TEXT[] DEFAULT '{}',
    suggested_next_scenarios TEXT[] DEFAULT '{}',
    learning_resources_suggested TEXT[] DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Market Events Log Table (Enhanced)
CREATE TABLE IF NOT EXISTS market_events_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES simulation_sessions(id) ON DELETE CASCADE,
    event_id TEXT NOT NULL,
    event_title TEXT NOT NULL,
    event_description TEXT NOT NULL,
    event_type TEXT DEFAULT 'system' CHECK (event_type IN ('system', 'ai_generated')),
    impact JSONB NOT NULL,
    triggered_at TIMESTAMPTZ DEFAULT NOW(),
    stage_when_triggered TEXT NOT NULL
);

-- Crisis Events Log Table (Enhanced)
CREATE TABLE IF NOT EXISTS crisis_events_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES simulation_sessions(id) ON DELETE CASCADE,
    crisis_id TEXT NOT NULL,
    crisis_title TEXT NOT NULL,
    crisis_type TEXT DEFAULT 'scenario' CHECK (crisis_type IN ('scenario', 'ai_generated')),
    solution_chosen TEXT,
    success BOOLEAN,
    consequences TEXT[] DEFAULT '{}',
    budget_impact INTEGER DEFAULT 0,
    triggered_at TIMESTAMPTZ DEFAULT NOW()
);

-- Global Leaderboard View (Enhanced for Binno)
CREATE OR REPLACE VIEW global_leaderboard AS
SELECT 
    user_address,
    total_simulations,
    completed_simulations,
    failed_simulations,
    best_score,
    average_score,
    survival_rate,
    bnb_expertise_level,
    total_crises_survived,
    total_budget_managed,
    
    -- Binno-specific metrics
    binno_simulations,
    binno_best_score,
    binno_best_expertise_level,
    total_mentor_sessions,
    
    ARRAY_LENGTH(achievements, 1) as achievements_count,
    RANK() OVER (ORDER BY best_score DESC, survival_rate DESC, bnb_expertise_level DESC) as global_rank,
    RANK() OVER (ORDER BY binno_best_score DESC, binno_best_expertise_level DESC) as binno_rank
FROM user_simulator_stats
WHERE total_simulations > 0
ORDER BY global_rank;

-- Binno Learning Leaderboard (New)
CREATE OR REPLACE VIEW binno_learning_leaderboard AS
SELECT 
    u.user_address,
    u.binno_simulations,
    u.binno_best_score,
    u.binno_best_expertise_level,
    u.binno_avg_response_length,
    u.total_mentor_sessions,
    COALESCE(AVG(c.overall_score), 0) as avg_conversation_score,
    COUNT(DISTINCT c.scenario_id) as unique_scenarios_completed,
    RANK() OVER (ORDER BY u.binno_best_expertise_level DESC, u.binno_best_score DESC, u.total_mentor_sessions DESC) as learning_rank
FROM user_simulator_stats u
LEFT JOIN binno_conversations c ON u.user_address = (
    SELECT user_address FROM simulation_sessions WHERE id = c.session_id
)
WHERE u.binno_simulations > 0
GROUP BY u.user_address, u.binno_simulations, u.binno_best_score, u.binno_best_expertise_level, u.binno_avg_response_length, u.total_mentor_sessions
ORDER BY learning_rank;

-- Scenario Difficulty Analysis View (New)
CREATE OR REPLACE VIEW scenario_difficulty_analysis AS
SELECT 
    stage,
    scenario_id,
    scenario_title,
    difficulty_level,
    bnb_relevance,
    COUNT(*) as total_attempts,
    ROUND(AVG(overall_score), 1) as avg_score,
    ROUND(AVG(response_length), 0) as avg_response_length,
    COUNT(*) FILTER (WHERE overall_score >= 80) as excellent_responses,
    COUNT(*) FILTER (WHERE overall_score < 40) as poor_responses,
    ROUND(
        (COUNT(*) FILTER (WHERE overall_score >= 80)::DECIMAL / COUNT(*)) * 100, 1
    ) as success_rate
FROM binno_conversations
GROUP BY stage, scenario_id, scenario_title, difficulty_level, bnb_relevance
ORDER BY stage, avg_score DESC;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sessions_user_address ON simulation_sessions(user_address);
CREATE INDEX IF NOT EXISTS idx_sessions_project_type ON simulation_sessions(project_type);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON simulation_sessions(session_status);
CREATE INDEX IF NOT EXISTS idx_sessions_simulator_type ON simulation_sessions(simulator_type);
CREATE INDEX IF NOT EXISTS idx_sessions_score ON simulation_sessions USING GIN (current_score);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON simulation_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_sessions_failed ON simulation_sessions(is_failed) WHERE is_failed = TRUE;

-- Binno-specific indexes
CREATE INDEX IF NOT EXISTS idx_binno_conversations_session ON binno_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_binno_conversations_stage ON binno_conversations(stage);
CREATE INDEX IF NOT EXISTS idx_binno_conversations_scenario ON binno_conversations(scenario_id);
CREATE INDEX IF NOT EXISTS idx_binno_conversations_score ON binno_conversations(overall_score);
CREATE INDEX IF NOT EXISTS idx_binno_conversations_timestamp ON binno_conversations(timestamp);

CREATE INDEX IF NOT EXISTS idx_binno_mentor_sessions_session ON binno_mentor_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_binno_mentor_sessions_score ON binno_mentor_sessions(final_score);
CREATE INDEX IF NOT EXISTS idx_binno_mentor_sessions_expertise ON binno_mentor_sessions(bnb_expertise_level);

CREATE INDEX IF NOT EXISTS idx_binno_analytics_user ON binno_learning_analytics(user_address);
CREATE INDEX IF NOT EXISTS idx_binno_analytics_session ON binno_learning_analytics(session_id);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_simulation_sessions_updated_at 
    BEFORE UPDATE ON simulation_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_simulator_stats_updated_at 
    BEFORE UPDATE ON user_simulator_stats 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enhanced Achievement Unlock Function
CREATE OR REPLACE FUNCTION check_and_unlock_achievements(p_user_address TEXT)
RETURNS TABLE(new_achievement JSONB) AS $$
DECLARE
    user_stats RECORD;
    latest_session RECORD;
    latest_binno_session RECORD;
    achievement JSONB;
BEGIN
    -- Get user stats
    SELECT * INTO user_stats FROM user_simulator_stats WHERE user_address = p_user_address;
    
    -- Get latest sessions
    SELECT * INTO latest_session FROM simulation_sessions 
    WHERE user_address = p_user_address 
    ORDER BY created_at DESC LIMIT 1;
    
    SELECT * INTO latest_binno_session FROM binno_mentor_sessions bms
    JOIN simulation_sessions ss ON bms.session_id = ss.id
    WHERE ss.user_address = p_user_address
    ORDER BY bms.created_at DESC LIMIT 1;
    
    -- Traditional achievements
    IF user_stats.total_crises_survived >= 10 AND NOT EXISTS (
        SELECT 1 FROM UNNEST(user_stats.achievements) AS a WHERE a->>'id' = 'crisis_survivor'
    ) THEN
        achievement := '{"id": "crisis_survivor", "name": "Crisis Survivor", "description": "Survived 10+ critical crises", "icon": "🛡️", "rarity": "rare", "bnb_related": true}'::JSONB;
        RETURN QUERY SELECT achievement;
    END IF;
    
    -- Binno-specific achievements
    IF user_stats.binno_simulations >= 1 AND NOT EXISTS (
        SELECT 1 FROM UNNEST(user_stats.achievements) AS a WHERE a->>'id' = 'binno_first_chat'
    ) THEN
        achievement := '{"id": "binno_first_chat", "name": "AI Mentee", "description": "Completed first Binno AI simulation", "icon": "🤖", "rarity": "common", "bnb_related": false}'::JSONB;
        RETURN QUERY SELECT achievement;
    END IF;
    
    IF user_stats.binno_best_expertise_level >= 90 AND NOT EXISTS (
        SELECT 1 FROM UNNEST(user_stats.achievements) AS a WHERE a->>'id' = 'binno_master'
    ) THEN
        achievement := '{"id": "binno_master", "name": "Binno Master", "description": "Achieved 90+ expertise with AI mentoring", "icon": "🧠", "rarity": "legendary", "bnb_related": true}'::JSONB;
        RETURN QUERY SELECT achievement;
    END IF;
    
    IF user_stats.total_mentor_sessions >= 5 AND NOT EXISTS (
        SELECT 1 FROM UNNEST(user_stats.achievements) AS a WHERE a->>'id' = 'learning_enthusiast'
    ) THEN
        achievement := '{"id": "learning_enthusiast", "name": "Learning Enthusiast", "description": "Completed 5+ AI mentoring sessions", "icon": "📚", "rarity": "rare", "bnb_related": false}'::JSONB;
        RETURN QUERY SELECT achievement;
    END IF;
    
    IF user_stats.binno_avg_response_length >= 500 AND NOT EXISTS (
        SELECT 1 FROM UNNEST(user_stats.achievements) AS a WHERE a->>'id' = 'detailed_thinker'
    ) THEN
        achievement := '{"id": "detailed_thinker", "name": "Detailed Thinker", "description": "Average 500+ characters per response", "icon": "🎯", "rarity": "epic", "bnb_related": false}'::JSONB;
        RETURN QUERY SELECT achievement;
    END IF;

    RETURN;
END;
$$ LANGUAGE plpgsql;

-- Sample data for testing Binno system
INSERT INTO simulation_sessions (
    user_address, 
    project_name, 
    project_type,
    simulator_type,
    total_budget,
    remaining_budget,
    reputation_score,
    team_morale,
    market_sentiment
) VALUES 
('0x1234...binno_expert', 'AI-Powered DeFi Protocol', 'defi_protocol', 'binno_ai', 1200, 800, 75, 90, 25),
('0x5678...learning', 'Binno Test Project', 'nft_marketplace', 'binno_ai', 600, 400, 60, 70, 10)
ON CONFLICT (id) DO NOTHING;

-- Enhanced User Simulator Stats Table
CREATE TABLE IF NOT EXISTS user_simulator_stats (
    user_address TEXT PRIMARY KEY,
    total_simulations INTEGER DEFAULT 0,
    completed_simulations INTEGER DEFAULT 0,
    failed_simulations INTEGER DEFAULT 0,
    average_score DECIMAL(5,2) DEFAULT 0,
    best_score DECIMAL(5,2) DEFAULT 0,
    worst_score DECIMAL(5,2) DEFAULT 100,
    favorite_project_type TEXT,
    total_time_spent INTEGER DEFAULT 0, -- minutes
    total_budget_managed BIGINT DEFAULT 0,
    total_crises_survived INTEGER DEFAULT 0,
    total_market_events_experienced INTEGER DEFAULT 0,
    achievements JSONB[] DEFAULT '{}',
    bnb_expertise_level INTEGER DEFAULT 0 CHECK (bnb_expertise_level >= 0 AND bnb_expertise_level <= 100),
    difficulty_preference TEXT DEFAULT 'normal' CHECK (difficulty_preference IN ('easy', 'normal', 'hard', 'expert')),
    survival_rate DECIMAL(5,2) DEFAULT 0, -- Percentage of simulations that didn't fail
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Market Events Log Table (New)
CREATE TABLE IF NOT EXISTS market_events_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES simulation_sessions(id) ON DELETE CASCADE,
    event_id TEXT NOT NULL,
    event_title TEXT NOT NULL,
    event_description TEXT NOT NULL,
    impact JSONB NOT NULL,
    triggered_at TIMESTAMPTZ DEFAULT NOW(),
    stage_when_triggered TEXT NOT NULL
);

-- Crisis Events Log Table (New)
CREATE TABLE IF NOT EXISTS crisis_events_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES simulation_sessions(id) ON DELETE CASCADE,
    crisis_id TEXT NOT NULL,
    crisis_title TEXT NOT NULL,
    solution_chosen TEXT,
    success BOOLEAN,
    consequences TEXT[] DEFAULT '{}',
    budget_impact INTEGER DEFAULT 0,
    triggered_at TIMESTAMPTZ DEFAULT NOW()
);

-- Decision Impact Analysis Table (New)
CREATE TABLE IF NOT EXISTS decision_impacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES simulation_sessions(id) ON DELETE CASCADE,
    decision_id TEXT NOT NULL,
    option_id TEXT NOT NULL,
    stage TEXT NOT NULL,
    risk_level TEXT NOT NULL,
    budget_cost INTEGER NOT NULL,
    reputation_impact INTEGER NOT NULL,
    score_impact JSONB NOT NULL,
    consequences TEXT[] DEFAULT '{}',
    cascading_effects TEXT[] DEFAULT '{}',
    success BOOLEAN NOT NULL,
    execution_quality DECIMAL(3,2) DEFAULT 1.0, -- 0.0 to 1.0
    decided_at TIMESTAMPTZ DEFAULT NOW()
);

-- Global Leaderboard View (Enhanced)
CREATE OR REPLACE VIEW global_leaderboard AS
SELECT 
    user_address,
    total_simulations,
    completed_simulations,
    failed_simulations,
    best_score,
    average_score,
    survival_rate,
    bnb_expertise_level,
    total_crises_survived,
    total_budget_managed,
    ARRAY_LENGTH(achievements, 1) as achievements_count,
    RANK() OVER (ORDER BY best_score DESC, survival_rate DESC, bnb_expertise_level DESC) as global_rank
FROM user_simulator_stats
WHERE total_simulations > 0
ORDER BY global_rank;

-- BNB Chain Mastery Leaderboard (New)
CREATE OR REPLACE VIEW bnb_mastery_leaderboard AS
SELECT 
    user_address,
    bnb_expertise_level,
    survival_rate,
    total_crises_survived,
    best_score,
    completed_simulations,
    RANK() OVER (ORDER BY bnb_expertise_level DESC, survival_rate DESC, best_score DESC) as bnb_rank
FROM user_simulator_stats
WHERE total_simulations >= 3 AND bnb_expertise_level > 0
ORDER BY bnb_rank;

-- Failure Analysis View (New)
CREATE OR REPLACE VIEW failure_analysis AS
SELECT 
    failure_reason,
    COUNT(*) as failure_count,
    AVG(remaining_budget) as avg_budget_at_failure,
    AVG(reputation_score) as avg_reputation_at_failure,
    AVG(crisis_points) as avg_crisis_points_at_failure,
    AVG(team_morale) as avg_morale_at_failure,
    ROUND(AVG(ARRAY_LENGTH(failed_decisions, 1))) as avg_failed_decisions
FROM simulation_sessions
WHERE is_failed = TRUE AND failure_reason IS NOT NULL
GROUP BY failure_reason
ORDER BY failure_count DESC;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sessions_user_address ON simulation_sessions(user_address);
CREATE INDEX IF NOT EXISTS idx_sessions_project_type ON simulation_sessions(project_type);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON simulation_sessions(session_status);
CREATE INDEX IF NOT EXISTS idx_sessions_score ON simulation_sessions USING GIN (current_score);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON simulation_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_sessions_failed ON simulation_sessions(is_failed) WHERE is_failed = TRUE;
CREATE INDEX IF NOT EXISTS idx_market_events_session ON market_events_log(session_id);
CREATE INDEX IF NOT EXISTS idx_crisis_events_session ON crisis_events_log(session_id);
CREATE INDEX IF NOT EXISTS idx_decision_impacts_session ON decision_impacts(session_id);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_simulation_sessions_updated_at 
    BEFORE UPDATE ON simulation_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_simulator_stats_updated_at 
    BEFORE UPDATE ON user_simulator_stats 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Achievement Unlock Function (Enhanced)
CREATE OR REPLACE FUNCTION check_and_unlock_achievements(p_user_address TEXT)
RETURNS TABLE(new_achievement JSONB) AS $$
DECLARE
    user_stats RECORD;
    latest_session RECORD;
    achievement JSONB;
BEGIN
    -- Get user stats
    SELECT * INTO user_stats FROM user_simulator_stats WHERE user_address = p_user_address;
    
    -- Get latest session
    SELECT * INTO latest_session FROM simulation_sessions 
    WHERE user_address = p_user_address 
    ORDER BY created_at DESC LIMIT 1;
    
    -- Check for new achievements
    
    -- Crisis Survivor
    IF user_stats.total_crises_survived >= 10 AND NOT EXISTS (
        SELECT 1 FROM UNNEST(user_stats.achievements) AS a WHERE a->>'id' = 'crisis_survivor'
    ) THEN
        achievement := '{"id": "crisis_survivor", "name": "Crisis Survivor", "description": "Survived 10+ critical crises", "icon": "🛡️", "rarity": "rare", "bnb_related": true}'::JSONB;
        RETURN QUERY SELECT achievement;
    END IF;
    
    -- BNB Chain Master
    IF user_stats.bnb_expertise_level >= 90 AND NOT EXISTS (
        SELECT 1 FROM UNNEST(user_stats.achievements) AS a WHERE a->>'id' = 'bnb_master'
    ) THEN
        achievement := '{"id": "bnb_master", "name": "BNB Chain Master", "description": "Achieved 90+ BNB expertise", "icon": "⚡", "rarity": "legendary", "bnb_related": true}'::JSONB;
        RETURN QUERY SELECT achievement;
    END IF;
    
    -- Perfect Run
    IF latest_session.session_status = 'completed' AND latest_session.is_failed = FALSE 
       AND (latest_session.current_score->>'overall')::INTEGER >= 95
       AND NOT EXISTS (
        SELECT 1 FROM UNNEST(user_stats.achievements) AS a WHERE a->>'id' = 'perfect_run'
    ) THEN
        achievement := '{"id": "perfect_run", "name": "Perfect Run", "description": "Completed simulation with 95+ score", "icon": "💎", "rarity": "epic", "bnb_related": false}'::JSONB;
        RETURN QUERY SELECT achievement;
    END IF;
    
    -- Budget Master
    IF latest_session.session_status = 'completed' AND latest_session.remaining_budget >= latest_session.total_budget * 0.8
       AND NOT EXISTS (
        SELECT 1 FROM UNNEST(user_stats.achievements) AS a WHERE a->>'id' = 'budget_master'
    ) THEN
        achievement := '{"id": "budget_master", "name": "Budget Master", "description": "Completed with 80%+ budget remaining", "icon": "💰", "rarity": "rare", "bnb_related": false}'::JSONB;
        RETURN QUERY SELECT achievement;
    END IF;

    RETURN;
END;
$$ LANGUAGE plpgsql;

-- Sample data for testing (Enhanced difficulty scenarios)
INSERT INTO simulation_sessions (
    user_address, 
    project_name, 
    project_type, 
    total_budget,
    remaining_budget,
    reputation_score,
    team_morale,
    market_sentiment
) VALUES 
('0x1234...expert', 'BNB Chain DeFi Master', 'defi_protocol', 1200, 800, 75, 90, 25),
('0x5678...newbie', 'Failed Startup', 'nft_marketplace', 600, 50, 20, 30, -40)
ON CONFLICT (id) DO NOTHING;