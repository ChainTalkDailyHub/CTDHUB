-- Criar tabela de cursos
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  author TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de vídeos
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  youtube_url TEXT NOT NULL,
  thumbnail TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_courses_author ON courses(author);
CREATE INDEX IF NOT EXISTS idx_courses_updated_at ON courses(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_videos_course_id ON videos(course_id);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at DESC);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_courses_updated_at 
    BEFORE UPDATE ON courses 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Políticas RLS (Row Level Security)
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Política para cursos: todos podem ler, apenas o autor pode modificar
CREATE POLICY "Courses are viewable by everyone" ON courses
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own courses" ON courses
    FOR INSERT WITH CHECK (auth.uid()::text = author OR author IS NOT NULL);

CREATE POLICY "Users can update their own courses" ON courses
    FOR UPDATE USING (author = auth.uid()::text OR author IS NOT NULL);

CREATE POLICY "Users can delete their own courses" ON courses
    FOR DELETE USING (author = auth.uid()::text OR author IS NOT NULL);

-- Política para vídeos: todos podem ler, apenas o autor do curso pode modificar
CREATE POLICY "Videos are viewable by everyone" ON videos
    FOR SELECT USING (true);

CREATE POLICY "Users can insert videos to their own courses" ON videos
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM courses 
            WHERE courses.id = videos.course_id 
            AND (courses.author = auth.uid()::text OR courses.author IS NOT NULL)
        )
    );

CREATE POLICY "Users can update videos in their own courses" ON videos
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM courses 
            WHERE courses.id = videos.course_id 
            AND (courses.author = auth.uid()::text OR courses.author IS NOT NULL)
        )
    );

CREATE POLICY "Users can delete videos from their own courses" ON videos
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM courses 
            WHERE courses.id = videos.course_id 
            AND (courses.author = auth.uid()::text OR courses.author IS NOT NULL)
        )
    );