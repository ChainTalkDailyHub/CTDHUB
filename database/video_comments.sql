-- Tabela para armazenar comentários dos vídeos
CREATE TABLE IF NOT EXISTS video_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    video_id VARCHAR(255) NOT NULL,
    user_address VARCHAR(255) NOT NULL,
    user_name VARCHAR(255),
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_video_comments_video_id ON video_comments(video_id);
CREATE INDEX IF NOT EXISTS idx_video_comments_user_address ON video_comments(user_address);
CREATE INDEX IF NOT EXISTS idx_video_comments_created_at ON video_comments(created_at DESC);

-- RLS (Row Level Security) policies
ALTER TABLE video_comments ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura de todos os comentários
CREATE POLICY "Allow read access to all comments" ON video_comments
    FOR SELECT USING (true);

-- Política para permitir inserção de comentários (qualquer usuário autenticado pode comentar)
CREATE POLICY "Allow insert comments" ON video_comments
    FOR INSERT WITH CHECK (true);

-- Política para permitir que usuários editem/deletem apenas seus próprios comentários
CREATE POLICY "Allow users to update their own comments" ON video_comments
    FOR UPDATE USING (true);

CREATE POLICY "Allow users to delete their own comments" ON video_comments
    FOR DELETE USING (true);