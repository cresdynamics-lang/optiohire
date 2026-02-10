const { Resend } = require('resend');

const resend = new Resend('re_a3ZF8uD6_FRk3Xo8ATzYKCNhFK2RLHTsP');

async function testResend() {
  try {
    console.log('🔍 Testing Resend API connection...');

    // Test API key validity by getting account info
    const account = await resend.domains.list();
    console.log('✅ Resend API Key is valid');
    console.log('📧 Account response:', JSON.stringify(account, null, 2));

    // Check the structure of the response
    if (account && account.data && account.data.data) {
      console.log('📧 Available domains:', account.data.data.map(d => d.name));

      // Check if optiohire.com domain exists
      const domainCheck = account.data.data.find(d => d.name === 'optiohire.com');

      if (domainCheck) {
        console.log('✅ optiohire.com domain found in Resend');
        console.log('📊 Domain status:', domainCheck.status);
        console.log('🆔 Domain ID:', domainCheck.id);
        console.log('📍 Region:', domainCheck.region);
        console.log('📧 Sending capability:', domainCheck.capabilities.sending);
        console.log('📨 Receiving capability:', domainCheck.capabilities.receiving);

        if (domainCheck.status === 'not_started') {
          console.log('⚠️  Domain needs verification. Please check your email for DNS records.');
        } else if (domainCheck.status === 'pending') {
          console.log('⏳ Domain verification in progress...');
        } else if (domainCheck.status === 'verified') {
          console.log('✅ Domain is fully verified and ready to send emails!');
        }

        // Test email sending (only if domain allows sending)
        if (domainCheck.capabilities.sending === 'enabled') {
          console.log('\n📤 Testing email sending...');
          try {
            const testEmail = await resend.emails.send({
              from: 'noreply@optiohire.com',
              to: 'nelsonochieng516@gmail.com', // Your email for testing
              subject: 'OptioHire Resend Test',
              html: '<h1>✅ Resend Email Test Successful!</h1><p>This confirms your Resend configuration is working properly.</p>'
            });

            console.log('✅ Test email sent successfully!');
            console.log('📧 Email ID:', testEmail.data?.id);

          } catch (emailError) {
            console.log('❌ Email sending failed:', emailError.message);
          }
        } else {
          console.log('❌ Domain sending capability is disabled');
        }

      } else {
        console.log('❌ optiohire.com domain NOT found in Resend account');
      }
    }

  } catch (error) {
    console.log('❌ Resend API test failed:', error.message);
    if (error.message.includes('401')) {
      console.log('💡 This usually means the API key is invalid or expired');
    }
  }
}

testResend();
