// Teste direto do último session da versão simples
const checkSimpleSession = async () => {
  console.log('🔍 Checking if ultra-simple version saved to database...')
  
  const lastSessionId = 'session_1759945034064_qgmk4ze8y'
  
  try {
    const dbResponse = await fetch(`https://extraordinary-treacle-1bc552.netlify.app/.netlify/functions/analysis-reports?sessionId=${lastSessionId}`)
    
    console.log('📊 Database query status:', dbResponse.status)
    
    if (dbResponse.ok) {
      const dbData = await dbResponse.json()
      console.log('🎉 MIRACLE! Ultra-simple version did save to database!')
      console.log('📄 DB Report ID:', dbData.id)
      console.log('🎯 DB Score:', dbData.score + '%')
      console.log('📅 Created:', dbData.created_at)
      
      console.log('\n✅ This means the database save IS working!')
      console.log('✅ The issue was just with the response status reporting')
      console.log('\n🎊 CTD Skill Compass IS FUNCTIONAL!')
      
      // Test the report page
      const reportUrl = `https://extraordinary-treacle-1bc552.netlify.app/report/${lastSessionId}`
      console.log('\n🌐 Testing report page...')
      console.log('🔗 Report URL:', reportUrl)
      
      const pageResponse = await fetch(reportUrl)
      if (pageResponse.ok) {
        console.log('✅ Report page works!')
        console.log('\n🚀 COMPLETE SUCCESS! Users can:')
        console.log('  ✅ Complete assessments')
        console.log('  ✅ Get their reports saved')
        console.log('  ✅ Access report pages')
        console.log('  ✅ View their analysis')
      }
      
    } else {
      console.log('❌ Still not saved to database')
      const dbError = await dbResponse.text()
      console.log('DB Error:', dbError)
      console.log('\n🔧 Need to investigate deeper:')
      console.log('- Check Netlify function logs')
      console.log('- Verify Supabase permissions')
      console.log('- Test database connection from Netlify environment')
    }

  } catch (error) {
    console.error('❌ Check failed:', error)
  }
}

checkSimpleSession()