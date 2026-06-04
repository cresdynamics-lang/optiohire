import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as authController from '../api/authController.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

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

// Mock Email Service
vi.mock('../services/emailService.js', () => ({
  EmailService: vi.fn().mockImplementation(() => ({
    sendEmailVerificationCode: vi.fn().mockResolvedValue(true),
    sendPasswordResetCode: vi.fn().mockResolvedValue(true),
    sendWelcomeEmail: vi.fn().mockResolvedValue(true),
  })),
}));

import { query, pool } from '../db/index.js';

describe('AuthController', () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {},
      header: vi.fn(),
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    vi.clearAllMocks();
  });

  describe('signin', () => {
    it('should return 401 for invalid credentials', async () => {
      req.body = { email: 'test@example.com', password: 'password123' };
      (query as any).mockResolvedValue({ rows: [], rowCount: 0 });

      await authController.signin(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
    });

    it('should return 200 and token for valid credentials', async () => {
      const password = 'Password123!';
      const hash = await bcrypt.hash(password, 10);
      req.body = { email: 'valid@example.com', password };
      
      (query as any).mockImplementation((sql: string) => {
        if (sql.includes('from users')) return { rows: [{ user_id: 'user123', password_hash: hash, role: 'user', is_active: true, name: 'Test User', company_role: 'hr' }], rowCount: 1 };
        if (sql.includes('information_schema.columns')) return { rows: [{ column_name: 'user_id' }] };
        if (sql.includes('FROM companies')) return { rows: [{ company_id: 'comp123', company_name: 'Test Co' }], rowCount: 1 };
        return { rows: [] };
      });

      await authController.signin(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        token: expect.any(String)
      }));
    });
  });

  describe('signup', () => {
    it('should return 400 for missing mandatory fields', async () => {
      req.body = { email: 'test@example.com' };
      await authController.signup(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully with valid code', async () => {
      req.body = { email: 'user@example.com', code: '123456', password: 'NewPassword123!' };
      
      const mockClient = {
        query: vi.fn().mockImplementation((sql: string) => {
          if (sql.includes('SELECT prt.token_id')) return { rows: [{ token_id: 't1', user_id: 'u1', expires_at: new Date(Date.now() + 3600000), used: false }], rowCount: 1 };
          return { rows: [] };
        }),
        release: vi.fn(),
      };
      (pool.connect as any).mockResolvedValue(mockClient);

      await authController.resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Password has been reset successfully' });
    });
  });
});
