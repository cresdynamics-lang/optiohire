import { logger } from '../../utils/logger.js'
import { query } from '../../db/index.js'
/**
 * OpenRouter AI Service
 * Drop-in replacement for groqService, using the OpenAI-compatible OpenRouter API.
 * Supports multiple models via a single paid API key.
 */

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface OpenRouterChoice {
  message: { role: string; content: string }
  finish_reason: string
  index: number
}

interface OpenRouterResponse {
  choices: OpenRouterChoice[]
  model: string
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number }
}

class OpenRouterService {
  private apiKey: string | null
  private baseUrl: string = 'https://openrouter.ai/api/v1'
  private primaryModel: string
  private fallbackModel: string

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || null
    this.primaryModel = process.env.PRIMARY_AI_MODEL || 'google/gemini-2.0-flash-001'
    this.fallbackModel = process.env.FALLBACK_AI_MODEL || 'openai/gpt-4o-mini'

    if (this.apiKey) {
      logger.info(`OpenRouter service initialized (primary: ${this.primaryModel}, fallback: ${this.fallbackModel})`)
    } else {
      logger.warn('OpenRouter API key not configured. Set OPENROUTER_API_KEY in .env')
    }
  }

  isAvailable(): boolean {
    return !!this.apiKey
  }

  /**
   * Generate text using OpenRouter API
   */
  async generateText(
    prompt: string,
    model?: string,
    options: {
      temperature?: number
      maxTokens?: number
      systemPrompt?: string
      tools?: any[]
      logContext?: { task?: string; userEmail?: string; jobPostingId?: string }
    } = {}
  ): Promise<string> {
    if (!this.apiKey) throw new Error('OpenRouter API key not configured')

    const modelsToTry = [model || this.primaryModel, this.fallbackModel]

    try {
      const messages: ChatMessage[] = []
      if (options.systemPrompt) {
        messages.push({ role: 'system', content: options.systemPrompt })
      }
      messages.push({ role: 'user', content: prompt })

      const bodyPayload: any = {
        models: modelsToTry,
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 1024,
      }
      if (options.tools && options.tools.length > 0) {
        bodyPayload.tools = options.tools
        bodyPayload.tool_choice = 'auto'
      }

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://optiohire.com',
          'X-Title': 'OptioHire AI Scoring',
        },
        body: JSON.stringify(bodyPayload),
      })

      if (!response.ok) {
        const errBody = await response.text()
        throw new Error(`OpenRouter API error (${response.status}): ${errBody.substring(0, 300)}`)
      }

      const data = (await response.json()) as OpenRouterResponse

      const content = data.choices?.[0]?.message?.content
      if (!content) {
        throw new Error('OpenRouter returned empty response')
      }

      logger.debug(`OpenRouter response via ${data.model} (${data.usage?.total_tokens || '?'} tokens)`)
      
      // Async DB Logging
      this.logUsageAsync(data.model, data.usage?.prompt_tokens || 0, data.usage?.completion_tokens || 0, data.usage?.total_tokens || 0, options.logContext);

      return content
    } catch (error: any) {
      logger.error(`OpenRouter native fallback failed: ${error.message}`)
      throw new Error(`OpenRouter: API request failed`)
    }
  }

  /**
   * Generate text using OpenRouter API with Server-Sent Events (SSE) streaming
   */
  async generateStream(
    prompt: string,
    model?: string,
    options: {
      temperature?: number
      maxTokens?: number
      systemPrompt?: string
      tools?: any[]
      logContext?: { task?: string; userEmail?: string; jobPostingId?: string }
    } = {}
  ): Promise<ReadableStream> {
    if (!this.apiKey) throw new Error('OpenRouter API key not configured')

    const modelsToTry = [model || this.primaryModel, this.fallbackModel]

    try {
      const messages: ChatMessage[] = []
      if (options.systemPrompt) {
        messages.push({ role: 'system', content: options.systemPrompt })
      }
      messages.push({ role: 'user', content: prompt })

      const bodyPayload: any = {
        models: modelsToTry,
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 1024,
        stream: true,
      }
      if (options.tools && options.tools.length > 0) {
        bodyPayload.tools = options.tools
        bodyPayload.tool_choice = 'auto'
      }

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://optiohire.com',
          'X-Title': 'OptioHire AI Agent',
        },
        body: JSON.stringify(bodyPayload),
      })

      if (!response.ok || !response.body) {
        const errBody = await response.text()
        throw new Error(`OpenRouter API error (${response.status}): ${errBody.substring(0, 300)}`)
      }

      return response.body
    } catch (error: any) {
      logger.error(`OpenRouter Stream fallback failed: ${error.message}`)
      throw new Error(`OpenRouter: Stream request failed`)
    }
  }

  /**
   * Generate and parse JSON response from OpenRouter
   * Drop-in replacement for groqService.generateJSON()
   */
  async generateJSON<T = any>(
    prompt: string,
    model?: string,
    options: {
      temperature?: number
      maxTokens?: number
      systemPrompt?: string
      logContext?: { task?: string; userEmail?: string; jobPostingId?: string }
    } = {}
  ): Promise<T> {
    const systemPrompt =
      options.systemPrompt ||
      'You are a helpful assistant that returns valid JSON responses. Always respond with properly formatted JSON.'

    const response = await this.generateText(prompt, model, {
      ...options,
      systemPrompt,
      temperature: 0.1,
      maxTokens: options.maxTokens ?? 1536,
    })

    try {
      // Try to extract JSON from the response (handle markdown code blocks)
      let cleaned = response.trim()
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '')
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '')
      }

      const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
      if (jsonMatch) return JSON.parse(jsonMatch[0]) as T
      return JSON.parse(cleaned) as T
    } catch (error) {
      logger.error('Failed to parse JSON from OpenRouter response:', { responseSnippet: response.substring(0, 200) })
      throw new Error('Invalid JSON response from OpenRouter')
    }
  }

  /**
   * Log AI token usage to the database asynchronously
   */
  private logUsageAsync(model: string, promptTokens: number, completionTokens: number, totalTokens: number, context?: { task?: string; userEmail?: string; jobPostingId?: string }) {
    setImmediate(() => {
      try {
        // Approximate cost calculation based on typical provider rates
        const costEstimate = (totalTokens / 1000) * 0.0003;
        
        query(
          `INSERT INTO ai_usage_logs (model, prompt_tokens, completion_tokens, total_tokens, cost_estimate, task, user_email, job_posting_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            model, 
            promptTokens, 
            completionTokens, 
            totalTokens, 
            costEstimate,
            context?.task || null,
            context?.userEmail || null,
            context?.jobPostingId || null
          ]
        ).catch(err => {
          logger.error('Failed to log AI usage to database', { error: err.message });
        });
      } catch (err) {
        logger.error('Error in async AI usage logging', { error: err });
      }
    });
  }
}

// Export singleton instance
export const openRouterService = new OpenRouterService()
export default openRouterService
