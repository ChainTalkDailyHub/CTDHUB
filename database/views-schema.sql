-- Tabela para tracking de views dos vídeos
CREATE TABLE IF NOT EXISTS video_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id TEXT NOT NULL,
  course_id TEXT NOT NULL,
  viewer_address TEXT,
  ip_address TEXT,
  user_agent TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  view_duration INTEGER DEFAULT 0, -- segundos assistidos
  completed BOOLEAN DEFAULT FALSE
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_video_views_video_id ON video_views(video_id);
CREATE INDEX IF NOT EXISTS idx_video_views_course_id ON video_views(course_id);
CREATE INDEX IF NOT EXISTS idx_video_views_viewer ON video_views(viewer_address);
CREATE INDEX IF NOT EXISTS idx_video_views_date ON video_views(viewed_at);

-- Tabela para analytics dos cursos
CREATE TABLE IF NOT EXISTS course_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id TEXT UNIQUE NOT NULL,
  total_views INTEGER DEFAULT 0,
  unique_viewers INTEGER DEFAULT 0,
  total_watch_time INTEGER DEFAULT 0, -- em segundos
  completion_rate DECIMAL(5,2) DEFAULT 0.00,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Políticas RLS
ALTER TABLE video_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_analytics ENABLE ROW LEVEL SECURITY;

-- Apenas service_role pode acessar (suas funções Netlify)
CREATE POLICY "Service role only video_views" ON video_views
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role only course_analytics" ON course_analytics
    FOR ALL USING (auth.role() = 'service_role');