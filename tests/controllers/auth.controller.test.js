import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as authController from '../../src/controllers/auth.js';
import * as authService from '../../src/services/auth.js';

vi.mock('../../src/services/auth.js');

const mockRes = () => ({
  status: vi.fn().mockReturnThis(),
  json: vi.fn().mockReturnThis(),
});

describe('auth.controller', () => {
  beforeEach(() => vi.clearAllMocks());

  it('login retourne 400 si username ou password manquants', async () => {
    const res = mockRes();
    await authController.login({ body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('login retourne 401 si identifiants invalides', async () => {
    authService.login.mockResolvedValue(null);
    const res = mockRes();
    await authController.login({ body: { username: 'u', password: 'p' } }, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('login retourne 200 et accessToken si OK', async () => {
    authService.login.mockResolvedValue({ accessToken: 'token-123' });
    const res = mockRes();
    await authController.login({ body: { username: 'u', password: 'p' } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ accessToken: 'token-123' });
  });
});
