import { vi } from 'vitest';

// Set test environment variables
process.env.JWT_SECRET = 'test-secret-key-for-unit-tests';
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
process.env.RESEND_API_KEY = 'test_123';
process.env.OPENROUTER_API_KEY = 'sk-or-123';

// Mock BullMQ globally since it requires a real Redis connection
vi.mock('bullmq', () => ({
  Queue: class { 
    add = vi.fn().mockResolvedValue({ id: 'job_id' }); 
    addBulk = vi.fn(); 
    on = vi.fn();
  },
  Worker: class { 
    on = vi.fn(); 
    close = vi.fn();
  }
}));

// Mock Redis connection
vi.mock('../queues/connection.js', () => ({
  redisConnection: {},
  isRedisEnabled: () => true
}));

// Mock AI Queue specifically
vi.mock('../queues/aiQueue.js', () => ({
  aiQueue: { 
    add: vi.fn().mockResolvedValue({ id: 'job_id' }) 
  },
  AI_QUEUE_NAME: 'ai-processing'
}));

// Mock logger to keep test output clean
vi.mock('../utils/logger.js', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }
}));

// Mock Resend to avoid API calls
vi.mock('resend', () => ({
  Resend: class {
    emails = {
      send: vi.fn().mockResolvedValue({ data: { id: 'email_id' }, error: null }),
      get: vi.fn().mockResolvedValue({ data: { id: 'email_id', subject: 'Test' }, error: null })
    }
  }
}));
