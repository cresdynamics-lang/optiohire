import { AIScoringEngine, type ScoringInput, type ScoringResult } from '../../lib/ai-scoring.js'
import { logger } from '../../utils/logger.js'

interface BatchScoringRequest {
  id: string // Unique identifier for this scoring request
  input: ScoringInput
}

interface BatchScoringResponse {
  id: string
  result: ScoringResult
  error?: string
}

/**
 * Batch AI Scoring Service
 * Processes multiple scoring requests efficiently by batching API calls
 */
export class BatchScoringService {
  private scoringEngine: AIScoringEngine
  private batchSize: number
  private batchDelay: number
  private pendingBatch: BatchScoringRequest[] = []
  private batchTimeout: NodeJS.Timeout | null = null

  constructor(batchSize: number = 5, batchDelay: number = 1000) {
    this.scoringEngine = new AIScoringEngine()
    this.batchSize = batchSize
    this.batchDelay = batchDelay // Wait up to 1 second to collect requests
  }

  /**
   * Add a scoring request to the batch queue
   */
  async scoreCandidate(input: ScoringInput, requestId?: string): Promise<ScoringResult> {
    const id = requestId || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    return new Promise((resolve, reject) => {
      this.pendingBatch.push({
        id,
        input
      })

      // Set timeout to process batch if it reaches batchSize or after delay
      if (this.batchTimeout) {
        clearTimeout(this.batchTimeout)
      }

      this.batchTimeout = setTimeout(() => {
        this.processBatch().catch(err => {
          logger.error('Batch processing error:', err)
        })
      }, this.batchDelay)

      // Process immediately if batch is full
      if (this.pendingBatch.length >= this.batchSize) {
        if (this.batchTimeout) {
          clearTimeout(this.batchTimeout)
          this.batchTimeout = null
        }
        this.processBatch().catch(err => {
          logger.error('Batch processing error:', err)
        })
      }

      // Store promise resolvers (simplified - in production use a proper queue)
      // For now, process immediately if batch is small
      if (this.pendingBatch.length === 1) {
        setTimeout(async () => {
          if (this.pendingBatch.length > 0) {
            await this.processBatch()
          }
        }, this.batchDelay)
      }
    })
  }

  /**
   * Process a batch of scoring requests
   */
  private async processBatch(): Promise<void> {
    if (this.pendingBatch.length === 0) return

    const batch = [...this.pendingBatch]
    this.pendingBatch = []
    this.batchTimeout = null

    logger.info(`Processing batch of ${batch.length} scoring requests`)

    // Process requests in parallel (but limit concurrency)
    const concurrency = Math.min(3, batch.length) // Process max 3 at a time
    const results: BatchScoringResponse[] = []

    for (let i = 0; i < batch.length; i += concurrency) {
      const chunk = batch.slice(i, i + concurrency)
      const chunkResults = await Promise.allSettled(
        chunk.map(async (req) => {
          try {
            const result = await this.scoringEngine.scoreCandidate(req.input)
            return {
              id: req.id,
              result
            } as BatchScoringResponse
          } catch (error: any) {
            logger.error(`Scoring failed for request ${req.id}:`, error)
            return {
              id: req.id,
              result: {
                score: 0,
                status: 'REJECTED',
                reasoning: `Scoring error: ${error.message}`
              },
              error: error.message
            } as BatchScoringResponse
          }
        })
      )

      results.push(...chunkResults.map(r => 
        r.status === 'fulfilled' ? r.value : {
          id: batch[i].id,
          result: {
            score: 0,
            status: 'REJECTED',
            reasoning: 'Batch processing error'
          },
          error: r.reason?.message || 'Unknown error'
        }
      ))

      // Small delay between chunks to avoid rate limiting
      if (i + concurrency < batch.length) {
        await new Promise(resolve => setTimeout(resolve, 200))
      }
    }

    logger.info(`Batch processing complete: ${results.length} results`)
  }

  /**
   * Process all pending requests immediately (flush queue)
   */
  async flush(): Promise<void> {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout)
      this.batchTimeout = null
    }
    await this.processBatch()
  }
}

// Singleton instance
let batchScoringService: BatchScoringService | null = null

export function getBatchScoringService(): BatchScoringService {
  if (!batchScoringService) {
    const batchSize = parseInt(process.env.AI_BATCH_SIZE || '5', 10)
    const batchDelay = parseInt(process.env.AI_BATCH_DELAY_MS || '1000', 10)
    batchScoringService = new BatchScoringService(batchSize, batchDelay)
  }
  return batchScoringService
}
