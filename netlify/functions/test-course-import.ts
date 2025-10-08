import { Handler } from '@netlify/functions'

export const handler: Handler = async (event, context) => {
  try {
    console.log('🔍 Testing course-manager import...')
    
    // Test if we can import the supabase module
    let supabaseModule = null
    let supabaseError = null
    
    try {
      supabaseModule = require('../../lib/supabase-storage')
      console.log('✅ Supabase module imported successfully')
      console.log('Available functions:', Object.keys(supabaseModule))
    } catch (error) {
      supabaseError = error
      console.error('❌ Failed to import supabase module:', error)
    }
    
    // Test if we can call readCoursesFromSupabase directly
    let coursesResult = null
    let coursesError = null
    
    if (supabaseModule && supabaseModule.readCoursesFromSupabase) {
      try {
        coursesResult = await supabaseModule.readCoursesFromSupabase()
        console.log('✅ readCoursesFromSupabase called successfully')
        console.log('Courses found:', coursesResult?.length || 0)
      } catch (error) {
        coursesError = error
        console.error('❌ Failed to call readCoursesFromSupabase:', error)
      }
    }
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        supabaseModule: !!supabaseModule,
        supabaseError: supabaseError instanceof Error ? supabaseError.message : String(supabaseError),
        availableFunctions: supabaseModule ? Object.keys(supabaseModule) : [],
        coursesResult: coursesResult,
        coursesError: coursesError instanceof Error ? coursesError.message : String(coursesError),
        timestamp: new Date().toISOString()
      }, null, 2),
    }

  } catch (error) {
    console.error('❌ Test error:', error)
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'Test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
    }
  }
}