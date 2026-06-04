import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createTestApp } from './utils/testApp.js';
import { resendInboundService } from '../services/inboundEmailService.js';

const app = createTestApp();

describe('Applications & Webhooks Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock the service specifically for integration tests to isolate route logic
    vi.spyOn(resendInboundService, 'processEmailReceivedEvent').mockResolvedValue({
      success: true,
      application_id: 'app_123'
    });
  });

  describe('POST /applications/public-submit', () => {
    it('should return 201 on success', async () => {
      const response = await request(app)
        .post('/applications/public-submit')
        .send({
          job_posting_id: 'job_123',
          candidate_name: 'Jane Doe',
          email: 'jane@doe.com',
          resume_url: 'http://storage/resume.pdf'
        });

      expect(response.status).toBe(201);
      expect(response.body.application_id).toBe('app_123');
    });
  });

  describe('POST /api/webhooks/resend', () => {
    it('should process Resend webhook successfully', async () => {
      const response = await request(app)
        .post('/api/webhooks/resend')
        .send({
          type: 'email.received',
          data: { email_id: 'resend_123' }
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.application_id).toBe('app_123');
    });
  });
});
