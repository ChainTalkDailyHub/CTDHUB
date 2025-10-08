-- CTDHUB Database Schema
-- Run this SQL in your Supabase SQL Editor to create all necessary tables

-- Enable Row Level Security (RLS)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    wallet_address TEXT UNIQUE NOT NULL,
    name TEXT,
    profession TEXT,
    web3_experience TEXT CHECK (web3_experience IN ('beginner', 'intermediate', 'advanced', 'expert')),
    project_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Courses Table
CREATE TABLE IF NOT EXISTS courses (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    author TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    total_videos INTEGER DEFAULT 0
);

-- 3. Course Videos Table
CREATE TABLE IF NOT EXISTS course_videos (
    id TEXT PRIMARY KEY,
    course_id TEXT REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    youtube_url TEXT NOT NULL,
    youtube_id TEXT NOT NULL,
    thumbnail_url TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Quiz Progress Table
CREATE TABLE IF NOT EXISTS quiz_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_address TEXT NOT NULL,
    module_id INTEGER NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    score INTEGER,
    answers JSONB,
    UNIQUE(user_address, module_id)
);

-- 5. Video Comments Table (for future use)
CREATE TABLE IF NOT EXISTS video_comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    video_id TEXT NOT NULL,
    user_address TEXT NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. User Analysis Reports Table
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

-- 7. Burn Transactions Table
CREATE TABLE IF NOT EXISTS burn_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_address TEXT UNIQUE NOT NULL,
    tx_hash TEXT NOT NULL,
    amount TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_wallet ON user_profiles(wallet_address);
CREATE INDEX IF NOT EXISTS idx_courses_author ON courses(author);
CREATE INDEX IF NOT EXISTS idx_course_videos_course_id ON course_videos(course_id);
CREATE INDEX IF NOT EXISTS idx_quiz_progress_user ON quiz_progress(user_address);
CREATE INDEX IF NOT EXISTS idx_video_comments_video ON video_comments(video_id);
CREATE INDEX IF NOT EXISTS idx_user_analysis_reports_user ON user_analysis_reports(user_address);
CREATE INDEX IF NOT EXISTS idx_user_analysis_reports_session ON user_analysis_reports(session_id);

-- Enable Row Level Security (optional, for public access)
-- ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE course_videos ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE quiz_progress ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE video_comments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE burn_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed)
-- CREATE POLICY "Public access" ON user_profiles FOR ALL USING (true);
-- CREATE POLICY "Public access" ON courses FOR ALL USING (true);
-- CREATE POLICY "Public access" ON course_videos FOR ALL USING (true);
-- CREATE POLICY "Public access" ON quiz_progress FOR ALL USING (true);
-- CREATE POLICY "Public access" ON video_comments FOR ALL USING (true);
-- CREATE POLICY "Public access" ON burn_transactions FOR ALL USING (true);

-- Update function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for auto-updating timestamps
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_courses_updated_at ON courses;
CREATE TRIGGER update_courses_updated_at 
    BEFORE UPDATE ON courses 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();