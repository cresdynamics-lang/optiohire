const { Resend } = require('resend');

const resend = new Resend('re_a3ZF8uD6_FRk3Xo8ATzYKCNhFK2RLHTsP');

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
