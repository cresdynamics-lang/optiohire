# Chatbot Groq Integration - Complete Guide

## Overview

The OptioHire chatbot is now fully integrated with Groq AI APIs to provide intelligent, context-aware responses to HR users' questions about the platform.

## ✅ Current Implementation

### Backend (`backend/src/api/hrChatController.ts`)

**Endpoint:** `POST /api/hr/chat`

**Features:**
- ✅ Uses Groq AI via `groqService.generateText()`
- ✅ Comprehensive system prompt with OptioHire platform context
- ✅ Conversation history support for context-aware responses
- ✅ Robust error handling with helpful error messages
- ✅ Fallback across multiple Groq API keys (primary → secondary → tertiary)

**System Prompt Includes:**
- OptioHire platform features (job postings, email routing, AI screening, etc.)
- AI scoring thresholds (SHORTLIST 80-100, FLAG 50-79, REJECT 0-49)
- Pricing tiers (KSH 2,500, 5,000, 10,000)
- Step-by-step guidance instructions
- Limitations and response style guidelines

**Configuration:**
- Model: `GROQ_CHAT_MODEL` or `GROQ_MODEL` (default: `llama-3.1-8b-instant`)
- Temperature: 0.7 (for natural conversation)
- Max Tokens: 1200 (for detailed responses)
- API Key: Uses 'secondary' key with fallback

### Frontend (`frontend/src/components/dashboard/chatbot-widget.tsx`)

**Features:**
- ✅ Sends conversation history to backend for context
- ✅ Maintains chat history across messages
- ✅ Error handling and loading states
- ✅ Responsive UI with smooth scrolling

**API Request:**
```typescript
POST /api/hr/chat
Body: {
  question: string,
  conversationHistory: Array<{ role: 'user' | 'assistant', content: string }>
}
```

## 🔧 Configuration

### Required Environment Variables

**Backend `.env`:**
```bash
# Primary Groq API Key (required)
GROQ_API_KEY=gsk_your_primary_key_here

# Secondary Groq API Key (recommended for chat)
GROQ_API_KEY_002=gsk_your_secondary_key_here

# Optional: Custom chat model
GROQ_CHAT_MODEL=llama-3.1-8b-instant

# Default model (fallback)
GROQ_MODEL=llama-3.1-8b-instant
```

### Groq API Keys Setup

1. **Get API Keys:**
   - Sign up at https://console.groq.com
   - Create API keys in the dashboard
   - Copy keys (format: `gsk_...`)

2. **Add to Backend `.env`:**
   ```bash
   GROQ_API_KEY=gsk_your_primary_key
   GROQ_API_KEY_002=gsk_your_secondary_key
   ```

3. **Restart Backend:**
   ```bash
   pm2 restart optiohire-backend
   # or
   npm run dev
   ```

## 📋 How It Works

### Request Flow

1. **User asks question** → Frontend chatbot widget
2. **Frontend sends request** → `POST /api/hr/chat` with question + history
3. **Backend processes** → `hrChatController.ts`
4. **Groq API call** → `groqService.generateText()` with system prompt
5. **Response returned** → Frontend displays answer

### Conversation Context

- **History Included:** Last 10 messages (5 exchanges)
- **Context Awareness:** Chatbot remembers previous questions/answers
- **Better Responses:** More accurate answers with conversation context

### Error Handling

**Backend Errors:**
- No API key: Returns 503 with helpful message
- API failure: Falls back to next available key
- Invalid request: Returns 400 with error details

**Frontend Errors:**
- Network errors: Shows user-friendly message
- API errors: Displays error from backend
- Timeout: Handles gracefully

## 🧪 Testing

### Test Chatbot

1. **Start Backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Open Dashboard:**
   - Navigate to `http://localhost:3000`
   - Login as HR user
   - Click chatbot icon (bottom right)

4. **Test Questions:**
   - "How does AI CV screening work?"
   - "What are the pricing tiers?"
   - "How do I create a job posting?"
   - "What happens when a CV is scored?"

### Verify Groq Integration

**Check Logs:**
```bash
# Backend logs should show:
# "HR chat question received"
# "HR chat response generated successfully"
```

**Test API Directly:**
```bash
curl -X POST http://localhost:3001/api/hr/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"question": "How does AI screening work?"}'
```

## 🎯 Chatbot Capabilities

### What It Can Do

✅ **Platform Guidance:**
- Explain OptioHire features
- Guide users through workflows
- Troubleshoot common issues
- Answer questions about AI screening

✅ **Recruitment Help:**
- Best practices for job postings
- Interview scheduling guidance
- Application management tips
- Report generation help

✅ **Context-Aware:**
- Remembers conversation history
- Follows up on previous questions
- Provides relevant examples

### What It Cannot Do

❌ **No Live Data Access:**
- Cannot see specific job postings
- Cannot view candidate applications
- Cannot access user accounts
- Cannot perform actions

❌ **No Sensitive Information:**
- Cannot provide API keys
- Cannot share credentials
- Cannot access database directly

## 🔍 Troubleshooting

### Chatbot Not Responding

**Check 1: Groq API Keys**
```bash
# Verify keys are set
echo $GROQ_API_KEY
echo $GROQ_API_KEY_002

# Check backend logs
tail -f backend/logs/app.log | grep -i groq
```

**Check 2: Backend Running**
```bash
# Verify backend is running
curl http://localhost:3001/health

# Check route is mounted
curl http://localhost:3001/api/hr/chat -X POST -H "Content-Type: application/json" -d '{"question":"test"}'
```

**Check 3: Frontend Connection**
```bash
# Verify NEXT_PUBLIC_BACKEND_URL
echo $NEXT_PUBLIC_BACKEND_URL

# Check browser console for errors
# Open DevTools → Console
```

### Error Messages

**"AI assistant is not available"**
- **Cause:** No Groq API keys configured
- **Fix:** Add `GROQ_API_KEY` to backend `.env`

**"Failed to process chat request"**
- **Cause:** Groq API error or network issue
- **Fix:** Check API keys, verify internet connection

**"Something went wrong while contacting"**
- **Cause:** Network error or backend down
- **Fix:** Check backend is running, verify CORS settings

## 📊 Performance

### Response Times
- **Average:** 1-3 seconds
- **With History:** 2-4 seconds
- **Error Fallback:** < 1 second

### Token Usage
- **Per Request:** ~500-1200 tokens
- **System Prompt:** ~400 tokens
- **History:** ~200-500 tokens per exchange

### Cost Optimization
- Uses fast `llama-3.1-8b-instant` model
- Efficient prompt engineering
- Conversation history limited to 10 messages
- Fallback keys prevent single point of failure

## 🚀 Future Enhancements

### Potential Improvements

1. **Streaming Responses:**
   - Real-time token streaming
   - Better UX for long responses

2. **Multi-language Support:**
   - Detect user language
   - Respond in preferred language

3. **Knowledge Base Integration:**
   - Connect to documentation
   - Provide links to relevant guides

4. **Voice Input:**
   - Speech-to-text integration
   - Voice responses

5. **Analytics:**
   - Track common questions
   - Improve system prompt based on usage

## 📝 Summary

✅ **Chatbot is fully integrated with Groq APIs**
✅ **Uses existing Groq service infrastructure**
✅ **Supports conversation history for context**
✅ **Comprehensive error handling**
✅ **User-friendly interface**

The chatbot is ready to use! Just ensure Groq API keys are configured in the backend `.env` file.
