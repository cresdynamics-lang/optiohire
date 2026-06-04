import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query as defaultQuery } from '../db/index.js';

const SALT_ROUNDS = 10;

export class AuthService {
  private query: typeof defaultQuery;

  constructor(queryFn = defaultQuery) {
    this.query = queryFn;
  }

  async validateCredentials(email: string, password: string) {
    const { rows } = await this.query(
      `SELECT user_id, password_hash, role, is_active, name, company_role FROM users WHERE email = $1`,
      [email.toLowerCase()]
    );

    if (rows.length === 0) return null;
    const user = rows[0];

    if (!user.is_active) return { error: 'Account is inactive' };

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return null;

    return user;
  }

  async generateToken(userId: string, email: string, role: string) {
    const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
    return jwt.sign({ sub: userId, email: email.toLowerCase(), role }, JWT_SECRET, { expiresIn: '7d' });
  }

  // Add more methods for signup, password reset, etc. as needed for testing
}

export const authService = new AuthService();
