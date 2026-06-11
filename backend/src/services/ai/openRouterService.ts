import { logger } from '../../utils/logger.js'
import { query } from '../../db/index.js'
import { OpenRouter } from '@openrouter/sdk'
import crypto from 'crypto'

/**
 * OpenRouter AI Service
 * Drop-in replacement for groqService, using the OpenAI-compatible OpenRouter API.
 * Supports multiple models via a single paid API key.
 */

class OpenRouterService {
  private apiKey: string | null
  private primaryModel: string
  private fallbackModel: string
  private openrouter: OpenRouter | null = null

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || null
    this.primaryModel = process.env.PRIMARY_AI_MODEL || 'google/gemini-2.0-flash-001'
    this.fallbackModel = process.env.FALLBACK_AI_MODEL || 'openai/gpt-4o-mini'

    if (this.apiKey) {
      this.openrouter = new OpenRouter({ apiKey: this.apiKey })
      logger.info(`OpenRouter service initialized (primary: ${this.primaryModel}, fallback: ${this.fallbackModel})`)
    } else {
      logger.warn('OpenRouter API key not configured. Set OPENROUTER_API_KEY in .env')
    }
  }

  isAvailable(): boolean {
    return !!this.apiKey && !!this.openrouter
  }

  /**
   * Generate text using OpenRouter SDK
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
    if (!this.openrouter) throw new Error('OpenRouter API key not configured')

    const modelToUse = model || this.primaryModel
    const sessionId = `req_${crypto.randomUUID()}`
    const startTime = Date.now()

    try {
      const messages: any[] = []
      if (options.systemPrompt) {
        messages.push({ role: 'system', content: options.systemPrompt })
      }
      messages.push({ role: 'user', content: prompt })

      const completion = await this.openrouter.chat.send({
        chatRequest: {
          model: modelToUse,
          messages,
          temperature: options.temperature ?? 0.7,
          maxTokens: options.maxTokens ?? 1024,
          tools: options.tools && options.tools.length > 0 ? options.tools : undefined,
        }
      })

      const endTime = Date.now()
      const durationSec = (endTime - startTime) / 1000

      const choice = completion.choices?.[0]
      const content = choice?.message?.content
      if (!content) {
        throw new Error('OpenRouter returned empty response')
      }

      const usage = completion.usage
      const totalTokens = usage?.totalTokens || 0
      const promptTokens = usage?.promptTokens || 0
      const completionTokens = usage?.completionTokens || 0
      const speed = totalTokens > 0 && durationSec > 0 ? totalTokens / durationSec : 0

      // Try to extract provider info from the non-standard metadata if possible
      // OpenRouter often returns model and other details, but in SDK we just log model
      let provider = completion.model?.split('/')[0] || 'Unknown'
      if (completion.model === 'openai/gpt-4o') provider = 'OpenAI'

      logger.debug(`OpenRouter response via ${completion.model} (${totalTokens} tokens, ${speed.toFixed(1)} tok/s)`)
      
      // Async DB Logging
      this.logUsageAsync(
        completion.model || modelToUse, 
        promptTokens, 
        completionTokens, 
        totalTokens, 
        { 
          ...options.logContext,
          provider,
          finishReason: choice?.finishReason || 'stop',
          speed,
          sessionId
        }
      );

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
  ): Promise<any> {
    if (!this.openrouter) throw new Error('OpenRouter API key not configured')

    const modelToUse = model || this.primaryModel

    try {
      const messages: any[] = []
      if (options.systemPrompt) {
        messages.push({ role: 'system', content: options.systemPrompt })
      }
      messages.push({ role: 'user', content: prompt })

      // The openrouter SDK streaming return value depends on the interface
      const stream = await this.openrouter.chat.send({
        chatRequest: {
          model: modelToUse,
          messages,
          temperature: options.temperature ?? 0.7,
          maxTokens: options.maxTokens ?? 1024,
          stream: true,
        }
      } as any)

      return stream
    } catch (error: any) {
      logger.error(`OpenRouter Stream fallback failed: ${error.message}`)
      throw new Error(`OpenRouter: Stream request failed`)
    }
  }

  /**
   * Generate and parse JSON response from OpenRouter
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
  private logUsageAsync(
    model: string, 
    promptTokens: number, 
    completionTokens: number, 
    totalTokens: number, 
    context?: { 
      task?: string; 
      userEmail?: string; 
      jobPostingId?: string;
      provider?: string;
      finishReason?: string;
      speed?: number;
      sessionId?: string;
    }
  ) {
    setImmediate(() => {
      try {
        // Approximate cost calculation based on typical provider rates
        const costEstimate = (totalTokens / 1000) * 0.0003;
        
        query(
          `INSERT INTO ai_usage_logs (
            model, prompt_tokens, completion_tokens, total_tokens, cost_estimate, 
            task, user_email, job_posting_id, provider, finish_reason, speed, session_id, app_name
          )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
          [
            model, 
            promptTokens, 
            completionTokens, 
            totalTokens, 
            costEstimate,
            context?.task || null,
            context?.userEmail || null,
            context?.jobPostingId || null,
            context?.provider || null,
            context?.finishReason || null,
            context?.speed || null,
            context?.sessionId || null,
            'OptioHire Core'
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
