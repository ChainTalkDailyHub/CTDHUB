// Teste de verificação direta do último session ID gerado
const checkLastSession = async () => {
  console.log('🔍 Checking if the last session was saved to database...')
  
  const lastSessionId = 'session_1759944448170_ckd26yz2j' // From the previous test
  
  try {
    console.log('📡 Checking session:', lastSessionId)
    
    const dbResponse = await fetch(`https://extraordinary-treacle-1bc552.netlify.app/.netlify/functions/analysis-reports?sessionId=${lastSessionId}`)
    
    console.log('📊 Database response status:', dbResponse.status)
    
    if (dbResponse.ok) {
      const dbData = await dbResponse.json()
      console.log('🎉 SUCCESS! Report was saved to database!')
      console.log('📄 DB Report ID:', dbData.id)
      console.log('🎯 DB Score:', dbData.score + '%')
      console.log('📅 Created:', dbData.created_at)
      console.log('👤 User:', dbData.user_address)
      
      // Test the report page
      const reportUrl = `https://extraordinary-treacle-1bc552.netlify.app/report/${lastSessionId}`
      console.log('\n🌐 Testing report page...')
      console.log('🔗 Report URL:', reportUrl)
      
      const pageResponse = await fetch(reportUrl)
      if (pageResponse.ok) {
        console.log('✅ Report page accessible!')
        console.log('\n🎊 COMPLETE SUCCESS! CTD Skill Compass is working!')
        console.log('✅ Users can complete assessments')
        console.log('✅ Reports are saved to database')
        console.log('✅ Report pages are accessible')
        console.log('\n🚀 The system is now fully functional!')
      } else {
        console.log('⚠️ Report page issue:', pageResponse.status)
      }
      
    } else {
      console.log('❌ Report not found in database')
      const dbError = await dbResponse.text()
      console.log('DB Error:', dbError)
      
      console.log('\n🔧 This means the database save is still not working')
      console.log('Need to check:')
      console.log('- Netlify environment variables')
      console.log('- Function deployment status')
      console.log('- Supabase connection in production')
    }

  } catch (error) {
    console.error('❌ Check failed:', error)
  }
}

checkLastSession()