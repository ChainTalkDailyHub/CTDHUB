import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'process.env.SUPABASE_URL';
const SUPABASE_ANON_KEY = 'process.env.SUPABASE_ANON_KEY';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function handler(event: any, context: any) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Create user_analysis_reports table
    const { error: createTableError } = await supabase.rpc('exec_sql', {
      sql: `
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
        
        CREATE INDEX IF NOT EXISTS idx_user_analysis_reports_user ON user_analysis_reports(user_address);
        CREATE INDEX IF NOT EXISTS idx_user_analysis_reports_session ON user_analysis_reports(session_id);
      `
    });

    if (createTableError) {
      console.error('Error creating table:', createTableError);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to create table', details: createTableError })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true, 
        message: 'Schema updated successfully' 
      })
    };

  } catch (error) {
    console.error('Error updating schema:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error', details: error })
    };
  }
}