import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as authService from '../../src/services/auth.js';
import * as userService from '../../src/services/user.js';

vi.mock('../../src/services/user.js');

describe('auth.service', () => {
  beforeEach(() => vi.clearAllMocks());

  it('login retourne null si user absent ou mauvais mot de passe', async () => {
    userService.findByUsernameOrEmail.mockResolvedValue(null);
    expect(await authService.login('u', 'p')).toBeNull();

    userService.findByUsernameOrEmail.mockResolvedValue({
      email: 'a@b.com',
      password: '$2a$10$hash',
    });
    expect(await authService.login('u', 'mauvais')).toBeNull();
  });

  it('login retourne un accessToken si identifiants valides', async () => {
    const bcrypt = await import('bcryptjs');
    const hashed = await bcrypt.default.hash('ok', 10);
    userService.findByUsernameOrEmail.mockResolvedValue({
      email: 'a@b.com',
      password: hashed,
    });
    const result = await authService.login('u', 'ok');
    expect(result).toHaveProperty('accessToken');
    expect(typeof result.accessToken).toBe('string');
  });

  it('verifyToken retourne null si token invalide', () => {
    expect(authService.verifyToken('invalide')).toBeNull();
  });

  it('verifyToken retourne le payload si token valide', async () => {
    const jwt = await import('jsonwebtoken');
    const token = jwt.default.sign(
      { email: 'a@b.com' },
      process.env.JWT_SECRET || 'dev-secret-change-in-production',
      { expiresIn: '7d' }
    );
    const result = authService.verifyToken(token);
    expect(result.email).toBe('a@b.com');
  });
});
