import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gxbqgidivppjsmpbomcj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4YnFnaWRpdnBwanNtcGJvbWNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjczODI0NzMsImV4cCI6MjA0Mjk1ODQ3M30.5F-e8UR6vhsRQCEWZFpY1uj4BF20k4PvbJXSA8Vto1M';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function handler(event: any, context: any) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    if (event.httpMethod === 'POST') {
      // Save new analysis report
      const { userAddress, sessionId, reportData, score } = JSON.parse(event.body);

      const { data, error } = await supabase
        .from('user_analysis_reports')
        .insert([{
          user_address: userAddress.toLowerCase(),
          session_id: sessionId,
          report_data: reportData,
          score: score,
          analysis_type: 'project_analysis'
        }])
        .select()
        .single();

      if (error) {
        console.error('Error saving report:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Failed to save report', details: error })
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, report: data })
      };

    } else if (event.httpMethod === 'GET') {
      // Get user reports
      const { userAddress, sessionId } = event.queryStringParameters || {};

      if (sessionId) {
        // Get specific report by session ID
        const { data, error } = await supabase
          .from('user_analysis_reports')
          .select('*')
          .eq('session_id', sessionId)
          .single();

        if (error) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Report not found' })
          };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(data)
        };
      }

      if (userAddress) {
        // Get all reports for user
        const { data, error } = await supabase
          .from('user_analysis_reports')
          .select('*')
          .eq('user_address', userAddress.toLowerCase())
          .order('created_at', { ascending: false });

        if (error) {
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to get reports', details: error })
          };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(data || [])
        };
      }

      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing userAddress or sessionId parameter' })
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error', details: error })
    };
  }
}