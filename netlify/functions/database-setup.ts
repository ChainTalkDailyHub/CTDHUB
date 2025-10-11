import { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase with direct credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 
                   process.env.SUPABASE_URL || 
                   'process.env.SUPABASE_URL'

const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                   process.env.SUPABASE_ANON_KEY || 
                   'process.env.SUPABASE_ANON_KEY'

const supabase = createClient(supabaseUrl, supabaseKey)

// Database tables to check/create
const REQUIRED_TABLES = [
  'user_profiles',
  'courses',
  'course_videos',
  'quiz_progress',
  'video_comments',
  'burn_transactions'
]

async function checkTableExists(tableName: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1)
    
    return !error
  } catch (error) {
    return false
  }
}

async function createUserProfilesTable(): Promise<void> {
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS user_profiles (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
      
      CREATE INDEX IF NOT EXISTS idx_user_profiles_wallet ON user_profiles(wallet_address);
    `
  })
  
  if (error) throw error
}

async function createCoursesTable(): Promise<void> {
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS courses (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        author TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        total_videos INTEGER DEFAULT 0
      );
      
      CREATE INDEX IF NOT EXISTS idx_courses_author ON courses(author);
    `
  })
  
  if (error) throw error
}

async function createCourseVideosTable(): Promise<void> {
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
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
      
      CREATE INDEX IF NOT EXISTS idx_course_videos_course_id ON course_videos(course_id);
    `
  })
  
  if (error) throw error
}

async function createQuizProgressTable(): Promise<void> {
  // Try to create by inserting and deleting a test record
  try {
    const { error } = await supabase
      .from('quiz_progress')
      .insert({
        user_address: 'test',
        module_id: 999,
        score: 0,
        answers: {}
      })
    
    if (!error) {
      // Table exists, delete test record
      await supabase
        .from('quiz_progress')
        .delete()
        .eq('user_address', 'test')
        .eq('module_id', 999)
    } else {
      throw new Error('Table does not exist')
    }
  } catch (error) {
    // Table doesn't exist, this is expected for missing tables
    console.log('Quiz progress table needs to be created manually in Supabase')
    throw new Error('quiz_progress table must be created manually in Supabase dashboard')
  }
}

async function createVideoCommentsTable(): Promise<void> {
  // Try to create by inserting and deleting a test record
  try {
    const { error } = await supabase
      .from('video_comments')
      .insert({
        video_id: 'test',
        user_address: 'test',
        comment: 'test'
      })
    
    if (!error) {
      // Table exists, delete test record
      await supabase
        .from('video_comments')
        .delete()
        .eq('video_id', 'test')
    } else {
      throw new Error('Table does not exist')
    }
  } catch (error) {
    // Table doesn't exist, this is expected for missing tables
    console.log('Video comments table needs to be created manually in Supabase')
    throw new Error('video_comments table must be created manually in Supabase dashboard')
  }
}

async function createBurnTransactionsTable(): Promise<void> {
  // Try to create by inserting and deleting a test record
  try {
    const { error } = await supabase
      .from('burn_transactions')
      .insert({
        user_address: 'test',
        tx_hash: 'test',
        amount: '0'
      })
    
    if (!error) {
      // Table exists, delete test record
      await supabase
        .from('burn_transactions')
        .delete()
        .eq('user_address', 'test')
    } else {
      throw new Error('Table does not exist')
    }
  } catch (error) {
    // Table doesn't exist, this is expected for missing tables
    console.log('Burn transactions table needs to be created manually in Supabase')
    throw new Error('burn_transactions table must be created manually in Supabase dashboard')
  }
}

const TABLE_CREATORS = {
  user_profiles: createUserProfilesTable,
  courses: createCoursesTable,
  course_videos: createCourseVideosTable,
  quiz_progress: createQuizProgressTable,
  video_comments: createVideoCommentsTable,
  burn_transactions: createBurnTransactionsTable
}

// SQL statements for manual creation
const CREATE_TABLE_SQL = {
  quiz_progress: `
CREATE TABLE IF NOT EXISTS quiz_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_address TEXT NOT NULL,
  module_id INTEGER NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  score INTEGER,
  answers JSONB,
  UNIQUE(user_address, module_id)
);
CREATE INDEX IF NOT EXISTS idx_quiz_progress_user ON quiz_progress(user_address);`,

  burn_transactions: `
CREATE TABLE IF NOT EXISTS burn_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_address TEXT UNIQUE NOT NULL,
  tx_hash TEXT NOT NULL,
  amount TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`,

  video_comments: `
CREATE TABLE IF NOT EXISTS video_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id TEXT NOT NULL,
  user_address TEXT NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_video_comments_video ON video_comments(video_id);`
}

export const handler: Handler = async (event, context) => {
  console.log('🔧 Database Setup Function - Method:', event.httpMethod)

  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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
    // GET - Check database status
    if (event.httpMethod === 'GET') {
      console.log('📊 Checking database status...')
      
      const tableStatus: Record<string, { exists: boolean; error?: string }> = {}
      
      for (const tableName of REQUIRED_TABLES) {
        try {
          const exists = await checkTableExists(tableName)
          tableStatus[tableName] = { exists }
          console.log(`📋 Table ${tableName}: ${exists ? '✅ Exists' : '❌ Missing'}`)
        } catch (error) {
          tableStatus[tableName] = { 
            exists: false, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          }
          console.log(`📋 Table ${tableName}: ❌ Error - ${error}`)
        }
      }

      const allTablesExist = Object.values(tableStatus).every(status => status.exists)

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: allTablesExist,
          message: allTablesExist 
            ? 'All required tables exist and are accessible' 
            : 'Some tables are missing or inaccessible',
          supabase_url: supabaseUrl.substring(0, 30) + '...',
          tables: tableStatus,
          timestamp: new Date().toISOString()
        }),
      }
    }

    // POST - Initialize database
    if (event.httpMethod === 'POST') {
      console.log('🚀 Analyzing database and providing setup instructions...')
      
      const tableStatus: Record<string, { exists: boolean; error?: string }> = {}
      const missingTables: string[] = []
      
      // Check which tables exist
      for (const tableName of REQUIRED_TABLES) {
        try {
          const exists = await checkTableExists(tableName)
          tableStatus[tableName] = { exists }
          if (!exists) {
            missingTables.push(tableName)
          }
          console.log(`📋 Table ${tableName}: ${exists ? '✅ Exists' : '❌ Missing'}`)
        } catch (error) {
          tableStatus[tableName] = { 
            exists: false, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          }
          missingTables.push(tableName)
          console.log(`📋 Table ${tableName}: ❌ Error - ${error}`)
        }
      }

      const allTablesExist = missingTables.length === 0

      // Generate SQL for missing tables
      let setupSQL = ''
      if (missingTables.length > 0) {
        setupSQL = missingTables
          .map(table => CREATE_TABLE_SQL[table as keyof typeof CREATE_TABLE_SQL])
          .filter(Boolean)
          .join('\n\n')
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: allTablesExist,
          message: allTablesExist 
            ? 'All required tables exist and are accessible' 
            : `Missing tables: ${missingTables.join(', ')}. Please run the provided SQL in your Supabase dashboard.`,
          missing_tables: missingTables,
          setup_sql: setupSQL,
          instructions: allTablesExist ? null : 
            'Go to your Supabase project dashboard → SQL Editor → Run the provided SQL statements',
          supabase_dashboard: 'https://app.supabase.com/project/srqgmflodlowmybgxxeu/editor',
          tables: tableStatus,
          timestamp: new Date().toISOString()
        }),
      }
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    }

  } catch (error) {
    console.error('❌ Database setup error:', error)
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Database setup failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }),
    }
  }
}