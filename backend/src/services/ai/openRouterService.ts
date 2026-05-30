import { logger } from '../../utils/logger.js'

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
    this.fallbackModel = process.env.FALLBACK_AI_MODEL || 'meta-llama/llama-3-8b-instruct'

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
    } = {}
  ): Promise<string> {
    if (!this.apiKey) throw new Error('OpenRouter API key not configured')

    const modelsToTry = [model || this.primaryModel, this.fallbackModel]
    let lastError: Error | null = null

    for (const m of modelsToTry) {
      try {
        const messages: ChatMessage[] = []
        if (options.systemPrompt) {
          messages.push({ role: 'system', content: options.systemPrompt })
        }
        messages.push({ role: 'user', content: prompt })

        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://optiohire.com',
            'X-Title': 'OptioHire AI Scoring',
          },
          body: JSON.stringify({
            model: m,
            messages,
            temperature: options.temperature ?? 0.7,
            max_tokens: options.maxTokens ?? 1024,
          }),
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

        logger.debug(`OpenRouter response via ${m} (${data.usage?.total_tokens || '?'} tokens)`)
        return content
      } catch (error: any) {
        lastError = error
        logger.warn(`OpenRouter ${m} failed: ${error.message}`)
        // If this is the primary model, try the fallback
        if (m !== this.fallbackModel) {
          logger.info(`Trying fallback model: ${this.fallbackModel}`)
          continue
        }
      }
    }

    throw lastError || new Error('OpenRouter: all models failed')
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
}

// Export singleton instance
export const openRouterService = new OpenRouterService()
export default openRouterService
