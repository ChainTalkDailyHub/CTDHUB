-- SQL para criar a tabela de relatórios de análise
-- Execute este SQL no Supabase SQL Editor

CREATE TABLE IF NOT EXISTS user_analysis_reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_address TEXT NOT NULL,
    session_id TEXT NOT NULL,
    report_data JSONB NOT NULL,
    score INTEGER,
    analysis_type TEXT DEFAULT 'project_analysis',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_user_analysis_reports_user ON user_analysis_reports(user_address);
CREATE INDEX IF NOT EXISTS idx_user_analysis_reports_session ON user_analysis_reports(session_id);

-- Exemplo de como inserir um relatório
-- INSERT INTO user_analysis_reports (user_address, session_id, report_data, score) 
-- VALUES ('0x123...', 'session_123', '{"analysis": "example"}', 85);