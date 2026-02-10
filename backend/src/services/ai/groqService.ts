import Groq from 'groq-sdk'

/**
 * Groq AI Service for testing and development
 * Provides fast, cost-effective AI inference as an alternative to Gemini
 */

class GroqService {
  private clients: { [key: string]: Groq } = {}
  private apiKeys: { [key: string]: string | null } = {}

  constructor() {
    // Primary API key for general tasks
    this.apiKeys.primary = process.env.GROQ_API_KEY || null
    if (this.apiKeys.primary) {
      this.clients.primary = new Groq({
        apiKey: this.apiKeys.primary
      })
    }

    // Secondary API key for advanced tasks (reports)
    this.apiKeys.secondary = process.env.GROQ_API_KEY_002 || null
    if (this.apiKeys.secondary) {
      this.clients.secondary = new Groq({
        apiKey: this.apiKeys.secondary
      })
    }

    // Tertiary API key for premium tasks (parsing)
    this.apiKeys.tertiary = process.env.GROQ_API_KEY_003 || null
    if (this.apiKeys.tertiary) {
      this.clients.tertiary = new Groq({
        apiKey: this.apiKeys.tertiary
      })
    }
  }

  /**
   * Check if Groq is available (any API key)
   */
  isAvailable(): boolean {
    return Object.values(this.clients).length > 0
  }

  /**
   * Check if specific API key is available
   */
  isAvailableFor(key: 'primary' | 'secondary' | 'tertiary'): boolean {
    return this.clients[key] !== undefined
  }

  /**
   * Generate text using Groq
   */
  async generateText(
    prompt: string,
    model: string = process.env.GROQ_MODEL || 'gemma2-9b-it',
    options: {
      temperature?: number
      maxTokens?: number
      systemPrompt?: string
      apiKey?: 'primary' | 'secondary' | 'tertiary'
    } = {}
  ): Promise<string> {
    const clientKey = options.apiKey || 'primary'
    const client = this.clients[clientKey]

    if (!client) {
      throw new Error(`Groq ${clientKey} API key not configured`)
    }

    try {
      const messages: Groq.Chat.ChatCompletionMessageParam[] = []

      if (options.systemPrompt) {
        messages.push({
          role: 'system',
          content: options.systemPrompt
        })
      }

      messages.push({
        role: 'user',
        content: prompt
      })

      const completion = await client.chat.completions.create({
        model: model,
        messages: messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 1024,
      })

      return completion.choices[0]?.message?.content || ''
    } catch (error) {
      console.error(`Groq ${clientKey} API error:`, error)
      throw new Error(`Groq ${clientKey} generation failed: ${error}`)
    }
  }

  /**
   * Parse JSON response from Groq
   */
  async generateJSON<T = any>(
    prompt: string,
    model: string = process.env.GROQ_MODEL || 'gemma2-9b-it',
    options: {
      temperature?: number
      systemPrompt?: string
      apiKey?: 'primary' | 'secondary' | 'tertiary'
    } = {}
  ): Promise<T> {
    const systemPrompt = options.systemPrompt || 'You are a helpful assistant that returns valid JSON responses. Always respond with properly formatted JSON.'

    const response = await this.generateText(prompt, model, {
      ...options,
      systemPrompt,
      temperature: 0.1 // Lower temperature for more consistent JSON
    })

    try {
      // Clean the response to extract JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      return JSON.parse(response)
    } catch (error) {
      console.error('Failed to parse JSON from Groq response:', response)
      throw new Error('Invalid JSON response from Groq')
    }
  }

  /**
   * Get available models (for reference)
   */
  getAvailableModels(): string[] {
    return [
      'gemma2-9b-it',           // Fast and good for general tasks
      'llama3.1-8b-instant',    // Good for complex reasoning
      'llama3.1-70b-versatile', // Best for complex tasks (slower)
      'mixtral-8x7b-32768',    // Good for coding and analysis
    ]
  }
}

// Export singleton instance
export const groqService = new GroqService()
export default groqService
