const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY || 're_your_resend_api_key_here');

async function testResend() {
  try {
    console.log('🔍 Testing Resend API connection...');

    // Test API key validity by getting account info
    const account = await resend.domains.list();
    console.log('✅ Resend API Key is valid');
    console.log('📧 Available domains:', account.data?.map(d => d.name));

    // Check if optiohire.com domain exists
    const domainCheck = account.data?.find(d => d.name === 'optiohire.com');
    if (domainCheck) {
      console.log('✅ optiohire.com domain found in Resend');
      console.log('📊 Domain status:', domainCheck.status);
    } else {
      console.log('❌ optiohire.com domain NOT found in Resend account');
    }

  } catch (error) {
    console.log('❌ Resend API test failed:', error.message);
    if (error.message.includes('401')) {
      console.log('💡 This usually means the API key is invalid or expired');
    }
  }
}

testResend();
