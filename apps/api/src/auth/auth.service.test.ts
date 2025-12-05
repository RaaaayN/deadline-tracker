import { JwtService } from '@nestjs/jwt';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { hash } from 'bcryptjs';
import { AuthService } from './auth.service';

class MockPrisma {
  user = {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  };
}

describe('AuthService', () => {
  let prisma: MockPrisma;
  let service: AuthService;

  beforeEach(() => {
    prisma = new MockPrisma();
    const jwt = new JwtService({ secret: 'test' });
    service = new AuthService(prisma as unknown as any, jwt);
  });

  it('signs up a user when email is free', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 'u1',
      email: 'john@example.com',
      role: 'student',
      passwordHash: 'hash',
      firstName: 'John',
      lastName: 'Doe',
    });

    const res = await service.signup({
      email: 'john@example.com',
      password: 'Password123',
      firstName: 'John',
      lastName: 'Doe',
    });

    expect(res.accessToken).toBeDefined();
    expect(prisma.user.create).toHaveBeenCalled();
  });

  it('logs in when password matches', async () => {
    const passwordHash = await hash('secret', 10);
    prisma.user.findUnique.mockResolvedValue({
      id: 'u2',
      email: 'user@example.com',
      passwordHash,
      role: 'student',
      firstName: 'A',
      lastName: 'B',
    });

    const res = await service.login({ email: 'user@example.com', password: 'secret' });
    expect(res.accessToken).toBeDefined();
  });

  it('returns profile from me()', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'u2',
      email: 'user@example.com',
      role: 'student',
      firstName: 'A',
      lastName: 'B',
      createdAt: new Date(),
    });
    const res = await service.me('u2');
    expect(res?.email).toBe('user@example.com');
  });

  it('updates profile names', async () => {
    prisma.user.update.mockResolvedValue({
      id: 'u2',
      email: 'user@example.com',
      role: 'student',
      firstName: 'John',
      lastName: 'Doe',
      createdAt: new Date(),
    });
    const res = await service.updateProfile('u2', { firstName: 'John', lastName: 'Doe' });
    expect(res.firstName).toBe('John');
  });
});

