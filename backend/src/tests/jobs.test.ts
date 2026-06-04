import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as jobPostingsController from '../api/jobPostingsController.js';

// Mock DB
vi.mock('../db/index.js', () => ({
  query: vi.fn(),
  pool: {
    connect: vi.fn(() => ({
      query: vi.fn(),
      release: vi.fn(),
    })),
  },
}));

// Mock Logger
vi.mock('../utils/logger.js', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

// Mock Email Service
vi.mock('../services/emailService.js', () => ({
  EmailService: vi.fn().mockImplementation(() => ({
    sendJobPostingCreatedEmail: vi.fn().mockResolvedValue(true),
  })),
}));

import { query, pool } from '../db/index.js';

describe('JobPostingsController', () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {},
      userId: 'user123',
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    vi.clearAllMocks();
  });

  describe('getJobPostings', () => {
    it('should return job list', async () => {
      const mockClient = {
        query: vi.fn().mockImplementation((sql: string) => {
          if (sql.includes('information_schema.columns')) return { rows: [{ column_name: 'user_id' }] };
          return { rows: [] };
        }),
        release: vi.fn(),
      };
      (pool.connect as any).mockResolvedValue(mockClient);

      (query as any).mockImplementation((sql: string) => {
        if (sql.includes('FROM companies WHERE user_id')) return { rows: [{ company_id: 'comp123' }] };
        if (sql.includes('FROM job_postings')) return { rows: [{ job_posting_id: 'job1', job_title: 'Engineer', skills_required: ['JS'] }] };
        if (sql.includes('FROM applications')) return { rows: [{ total: '5' }] };
        return { rows: [] };
      });

      await jobPostingsController.getJobPostings(req, res);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        jobs: expect.arrayContaining([
          expect.objectContaining({ job_title: 'Engineer' })
        ])
      }));
    });
  });

  describe('createJobPosting', () => {
    it('should create a job posting successfully', async () => {
      req.body = {
        company_name: 'Test Co',
        company_email: 'test@example.com',
        hr_email: 'hr@example.com',
        job_title: 'Senior Engineer',
        job_description: 'A very long job description that meets the 50 character minimum requirement.',
        required_skills: ['TypeScript', 'Node.js'],
        application_deadline: new Date(Date.now() + 86400000).toISOString(),
      };

      const mockClient = {
        query: vi.fn().mockImplementation((sql: string) => {
          if (sql.includes('information_schema.columns')) return { rows: [{ column_name: 'user_id' }] };
          if (sql.includes('insert into companies')) return { rows: [{ company_id: 'comp123' }] };
          if (sql.includes('insert into job_postings')) return { rows: [{ job_posting_id: 'job123' }] };
          return { rows: [] };
        }),
        release: vi.fn(),
      };
      (pool.connect as any).mockResolvedValue(mockClient);

      await jobPostingsController.createJobPosting(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        job_posting_id: 'job123'
      }));
    });
  });
});
