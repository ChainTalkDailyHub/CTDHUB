const { default: fetch } = require('node-fetch');

async function quickTest() {
  try {
    const response = await fetch('https://ctdhub.netlify.app/');
    console.log(`Site Status: ${response.status}`);
    
    if (response.status === 200) {
      console.log('✅ Site is back online!');
      return true;
    } else {
      console.log('❌ Site still offline');
      return false;
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return false;
  }
}

quickTest();