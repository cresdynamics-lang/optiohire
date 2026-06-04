import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ResendInboundService } from '../services/inboundEmailService.js';
import * as applicationsController from '../api/applicationsController.js';
import { aiQueue } from '../queues/aiQueue.js';

// We rely on the global DB mock in db/index.ts which is imported by these services

describe('Applications', () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    vi.clearAllMocks();
    req = { body: {}, params: {}, query: {} };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
  });

  describe('submitPublicApplication (Public API)', () => {
    it('should submit application successfully', async () => {
      req.body = {
        job_posting_id: 'job_123',
        candidate_name: 'John Doe',
        email: 'john@doe.com',
        resume_url: 'http://storage/resume.pdf'
      };

      await applicationsController.submitPublicApplication(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        application_id: 'app_123'
      }));
      // The controller calls aiQueue.add('profile-application', { applicationId: 'app_123' })
      expect(aiQueue.add).toHaveBeenCalledWith('profile-application', expect.objectContaining({
        applicationId: 'app_123'
      }));
    });
  });

  describe('ResendInboundService (Email Parsing)', () => {
    it('should process inbound email into an application', async () => {
      const mockResend = {
        getEmail: vi.fn().mockResolvedValue({
          subject: 'Software Engineer - Tech Corp',
          from: 'John Doe <john@doe.com>',
          html: 'Interested in the role.',
          text: 'Interested in the role.'
        }),
        getAttachments: vi.fn().mockResolvedValue([])
      };

      const service = new ResendInboundService(undefined, mockResend as any);
      const result = await service.processEmailReceivedEvent({
        type: 'email.received',
        data: { email_id: 'resend_123' }
      });

      expect(result.success).toBe(true);
      expect(result.application_id).toBe('app_123');
    });
  });
});
