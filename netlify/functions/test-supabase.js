const { createClient } = require('@supabase/supabase-js')

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  try {
    console.log('🔍 Testing Supabase connection from Netlify...')
    
    // Test 1: Environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://srqgmflodlowmybgxxeu.supabase.co'
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNycWdtZmxvZGxvd215Ymd4eGV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwMDM2MjgsImV4cCI6MjA3NDU3OTYyOH0.yI4PQXcmd96JVMoG46gh85G3hFVr0L3L7jBHWlJzAlQ'
    
    console.log('Environment check:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey,
      urlStart: supabaseUrl?.substring(0, 30),
      keyStart: supabaseKey?.substring(0, 30)
    })
    
    // Test 2: Create client
    console.log('Creating Supabase client...')
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Test 3: Simple query
    console.log('Testing table access...')
    const { data: testQuery, error: queryError } = await supabase
      .from('user_analysis_reports')
      .select('id, created_at')
      .limit(1)
    
    if (queryError) {
      console.error('Query error:', queryError)
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Database query failed',
          details: queryError,
          supabaseUrl,
          hasEnvVars: {
            url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
          }
        })
      }
    }
    
    // Test 4: Insert test record
    console.log('Testing insert operation...')
    const testRecord = {
      user_address: 'netlify_test',
      session_id: `test_${Date.now()}`,
      report_data: { test: true },
      score: 100,
      analysis_type: 'test',
      created_at: new Date().toISOString()
    }
    
    const { data: insertData, error: insertError } = await supabase
      .from('user_analysis_reports')
      .insert([testRecord])
      .select()
      .single()
    
    if (insertError) {
      console.error('Insert error:', insertError)
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Database insert failed',
          details: insertError,
          testRecord
        })
      }
    }
    
    // Test 5: Clean up
    console.log('Cleaning up test record...')
    await supabase
      .from('user_analysis_reports')
      .delete()
      .eq('session_id', testRecord.session_id)
    
    console.log('✅ All tests passed!')
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Supabase connection working perfectly!',
        testResults: {
          queryWorked: true,
          insertWorked: true,
          insertedId: insertData.id
        },
        environment: {
          supabaseUrl,
          hasEnvVars: {
            url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
          }
        }
      })
    }

  } catch (error) {
    console.error('Test function error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Test function failed',
        message: error.message,
        stack: error.stack
      })
    }
  }
}