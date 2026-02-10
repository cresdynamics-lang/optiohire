const Groq = require('groq-sdk')

// API Keys for testing
// NOTE: Replace these with your actual Groq API keys from environment variables
const API_KEYS = {
  primary: process.env.GROQ_API_KEY || 'your_groq_api_key',
  secondary: process.env.GROQ_API_KEY_002 || 'your_groq_api_key_002',
  tertiary: process.env.GROQ_API_KEY_003 || 'your_groq_api_key_003'
}

async function testGroqKey(apiKey, keyName) {
  console.log(`\n🔑 Testing ${keyName.toUpperCase()} API Key:`)
  console.log(`   Key: ${apiKey.substring(0, 20)}...`)

  try {
    const groq = new Groq({
      apiKey: apiKey
    })

    // First, let's list available models
    console.log('   📋 Checking available models...')
    const models = await groq.models.list()
    const availableModels = models.data.map(m => m.id)
    console.log(`   🤖 Available models: ${availableModels.join(', ')}`)

    // Try the first available model
    if (availableModels.length === 0) {
      throw new Error('No models available')
    }

    const testModel = availableModels[0] // Use the first available model
    console.log(`   🧪 Testing with model: ${testModel}`)

    const completion = await groq.chat.completions.create({
      model: testModel,
      messages: [
        {
          role: 'user',
          content: `Hello! You are the ${keyName} API key for OptioHire. Confirm you're working by saying "API key ${keyName} is active" in exactly those words.`
        }
      ],
      max_tokens: 50,
      temperature: 0.1
    })

    const response = completion.choices[0]?.message?.content || ''
    console.log(`✅ ${keyName} API key works:`, response.trim())

    return true
  } catch (error) {
    console.log(`❌ ${keyName} API key failed:`, error.message)
    return false
  }
}

async function testGroq() {
  console.log('🔍 Testing Groq AI Service with Multiple API Keys...\n')
  console.log('📋 Testing all three OptioHire Groq API keys:\n')

  let workingKeys = 0
  const results = {}

  // Test Primary Key (General tasks, scoring)
  console.log('🎯 Primary Key: General tasks, candidate scoring')
  results.primary = await testGroqKey(API_KEYS.primary, 'primary')
  if (results.primary) workingKeys++

  // Test Secondary Key (Reports, complex analysis)
  console.log('\n📊 Secondary Key: Report generation, complex analysis')
  results.secondary = await testGroqKey(API_KEYS.secondary, 'secondary')
  if (results.secondary) workingKeys++

  // Test Tertiary Key (Resume parsing, structured data)
  console.log('\n📄 Tertiary Key: Resume parsing, CV analysis')
  results.tertiary = await testGroqKey(API_KEYS.tertiary, 'tertiary')
  if (results.tertiary) workingKeys++

  // Summary
  console.log('\n' + '='.repeat(50))
  console.log('📊 TEST RESULTS SUMMARY:')
  console.log('='.repeat(50))
  console.log(`✅ Working API keys: ${workingKeys}/3`)
  console.log(`❌ Failed API keys: ${3 - workingKeys}/3`)

  console.log('\n🔄 API Key Assignments:')
  console.log('   🏆 Primary (gsk_fuxdpzp4dvDC...): General tasks, AI scoring')
  console.log('   📊 Secondary (gsk_toyt4mMpFO33...): Report generation')
  console.log('   📄 Tertiary (gsk_6szZ6nCv1CKr...): Resume parsing')

  console.log('\n🤖 Current Working Groq Models:')
  const models = ['llama-3.1-8b-instant', 'llama-3.3-70b-versatile', 'moonshotai/kimi-k2-instruct', 'groq/compound']
  models.forEach((model, index) => {
    console.log(`   ${index + 1}. ${model}`)
  })

  if (workingKeys === 3) {
    console.log('\n🎉 ALL API KEYS ARE WORKING! Ready for OptioHire AI features.')
  } else if (workingKeys >= 1) {
    console.log(`\n⚠️  ${workingKeys} API key(s) working. Some features may be limited.`)
  } else {
    console.log('\n❌ No API keys working. Check your keys and try again.')
  }
}

testGroq().catch(console.error)
