import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

async function runTest() {
  console.log("🚀 Starting E2E Webhook Test...");

  // 1. Create a dummy CV text file just for testing
  const dummyCvPath = path.join(process.cwd(), 'dummy_cv.txt');
  fs.writeFileSync(dummyCvPath, `
    Name: John Doe
    Email: john.doe.test@example.com
    Experience: 5 years as a Senior Frontend Developer at TechCorp.
    Skills: React, Node.js, TypeScript, Next.js
    Summary: Highly motivated frontend engineer looking for a new challenge.
  `);

  // Base64 encode it like Resend would
  const fileContent = fs.readFileSync(dummyCvPath).toString('base64');

  // 2. Build the Resend Webhook Payload
  const payload = {
    type: 'email.received',
    data: {
      subject: 'Application for Software Engineer',
      from: 'John Doe <john.doe.test@example.com>',
      attachments: [
        {
          filename: 'resume.txt',
          content: fileContent
        }
      ]
    }
  };

  console.log("📫 Sending mock email payload to local webhook...");

  // 3. Send it to our local webhook endpoint
  try {
    const response = await fetch('http://localhost:3001/api/webhooks/resend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    console.log("✅ Webhook Response:", result);

    if (result.success) {
      console.log(`\n🎉 Success! The system created Application ID: ${result.application_id}`);
      console.log("👀 Check your backend terminal logs! You should see the AI Worker:");
      console.log("  1. Pick up the job from the Redis queue");
      console.log("  2. Generate the Gemini 1536-dimension embedding");
      console.log("  3. Score the candidate based on the job requirements");
      console.log("  4. Send the outcome email!");
    } else {
      console.log("❌ Something went wrong:", result);
    }
  } catch (error) {
    console.error("❌ Failed to hit webhook. Is the backend running on port 3001?", error.message);
  }

  // Cleanup
  if (fs.existsSync(dummyCvPath)) {
    fs.unlinkSync(dummyCvPath);
  }
}

runTest();
