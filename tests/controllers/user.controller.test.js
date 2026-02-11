import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as userController from '../../src/controllers/user.js';
import * as userService from '../../src/services/user.js';

vi.mock('../../src/services/user.js');

const mockRes = () => ({
  status: vi.fn().mockReturnThis(),
  json: vi.fn().mockReturnThis(),
  setHeader: vi.fn().mockReturnThis(),
  send: vi.fn().mockReturnThis(),
});

describe('user.controller', () => {
  beforeEach(() => vi.clearAllMocks());

  it('generate envoie du JSON avec des users', () => {
    userService.generateUsers.mockReturnValue([
      { username: 'u1', email: 'u1@test.com' },
    ]);
    const res = mockRes();
    userController.generate({ query: { count: '1' } }, res);
    expect(userService.generateUsers).toHaveBeenCalledWith('1');
    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Type',
      'application/json'
    );
    expect(res.send).toHaveBeenCalled();
  });

  it('batch retourne 400 si pas de fichier', async () => {
    const res = mockRes();
    await userController.batch({ file: null }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('batch retourne 200 et le résumé si fichier OK', async () => {
    userService.importBatch.mockResolvedValue({
      total: 2,
      imported: 2,
      notImported: 0,
    });
    const res = mockRes();
    await userController.batch({ file: { buffer: Buffer.from('[]') } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      total: 2,
      imported: 2,
      notImported: 0,
    });
  });

  it('me retourne l’utilisateur sanitized', () => {
    userService.sanitizeUser.mockReturnValue({ id: '1', username: 'u' });
    const res = mockRes();
    userController.me(
      { user: { id: '1', username: 'u', password: 'x' } },
      res
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ id: '1', username: 'u' });
  });

  it('getByUsername retourne 404 si utilisateur introuvable', async () => {
    userService.findByUsername.mockResolvedValue(null);
    const res = mockRes();
    await userController.getByUsername(
      { params: { username: 'inconnu' }, user: { username: 'me' } },
      res
    );
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('getByUsername retourne 200 et le profil si trouvé et autorisé', async () => {
    const target = { id: '1', username: 'bob', password: 'x' };
    userService.findByUsername.mockResolvedValue(target);
    userService.sanitizeUser.mockReturnValue({ id: '1', username: 'bob' });
    const res = mockRes();
    await userController.getByUsername(
      {
        params: { username: 'bob' },
        user: { username: 'bob', role: 'user' },
      },
      res
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ id: '1', username: 'bob' });
  });
});
