import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as userService from '../../src/services/user.js';
import prisma from '../../src/lib/prisma.js';

vi.mock('../../src/lib/prisma.js', () => ({
  default: {
    user: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe('user.service', () => {
  beforeEach(() => vi.clearAllMocks());

  it('generateUser retourne un objet avec email, username, password, role', () => {
    const user = userService.generateUser();
    expect(user).toHaveProperty('email', expect.any(String));
    expect(user).toHaveProperty('username', expect.any(String));
    expect(user).toHaveProperty('password', expect.any(String));
    expect(user).toHaveProperty('firstName', expect.any(String));
    expect(user).toHaveProperty('lastName', expect.any(String));
    expect(user).toHaveProperty('birthDate', expect.any(String));
    expect(user).toHaveProperty('city', expect.any(String));
    expect(user).toHaveProperty('country', expect.any(String));
    expect(user).toHaveProperty('avatar', expect.any(String));
    expect(user).toHaveProperty('company', expect.any(String));
    expect(user).toHaveProperty('jobPosition', expect.any(String));
    expect(user).toHaveProperty('mobile', expect.any(String));
    expect(user).toHaveProperty('role', expect.any(String));
    expect(['admin', 'user']).toContain(user.role);
  });

  it('generateUsers retourne un tableau de la taille demandée', () => {
    expect(userService.generateUsers(3)).toHaveLength(3);
  });

  it('sanitizeUser retire le champ password', () => {
    const out = userService.sanitizeUser({
      id: '1',
      email: 'a@b.com',
      password: 'secret',
    });
    expect(out).not.toHaveProperty('password');
    expect(out.email).toBe('a@b.com');
  });

  it('findByUsernameOrEmail appelle prisma avec OR email/username', async () => {
    prisma.user.findFirst.mockResolvedValue({ id: '1' });
    await userService.findByUsernameOrEmail('alice');
    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      where: { OR: [{ email: 'alice' }, { username: 'alice' }] },
    });
  });

  it('findByUsername appelle prisma avec le username', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: '1' });
    await userService.findByUsername('bob');
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { username: 'bob' },
    });
  });
});
