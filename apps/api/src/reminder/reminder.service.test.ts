import { ReminderChannel, ReminderStatus } from '@prisma/client';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { GoogleService } from '../google/google.service';
import { PrismaService } from '../prisma.service';

import { ReminderService } from './reminder.service';

class MockPrisma {
  reminder = {
    findMany: vi.fn(),
    update: vi.fn(),
  };
}

class MockGoogle {
  sendEmail = vi.fn();
}

describe('ReminderService dispatchDue', () => {
  let prisma: MockPrisma;
  let google: MockGoogle;
  let service: ReminderService;

  beforeEach(() => {
    prisma = new MockPrisma();
    google = new MockGoogle();
    service = new ReminderService(prisma as unknown as PrismaService, google as unknown as GoogleService);
  });

  it('sends pending email reminders and marks them sent', async () => {
    const dueAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    prisma.reminder.findMany.mockResolvedValue([
      {
        id: 'r1',
        userId: 'u1',
        channel: ReminderChannel.email,
        status: ReminderStatus.pending,
        sendAt: new Date(),
        user: { email: 'user@example.com' },
        deadline: { title: 'Test', dueAt },
      },
    ]);
    google.sendEmail.mockResolvedValue(undefined);

    await service.dispatchDue();

    expect(google.sendEmail).toHaveBeenCalledWith(
      'u1',
      'user@example.com',
      expect.stringContaining('Rappel'),
      expect.stringContaining('Test'),
    );
    expect(prisma.reminder.update).toHaveBeenCalledWith({
      where: { id: 'r1' },
      data: expect.objectContaining({ status: ReminderStatus.sent }),
    });
  });

  it('marks reminder as error when email fails', async () => {
    prisma.reminder.findMany.mockResolvedValue([
      {
        id: 'r2',
        userId: 'u1',
        channel: ReminderChannel.email,
        status: ReminderStatus.pending,
        sendAt: new Date(),
        user: { email: 'user@example.com' },
        deadline: { title: 'Test', dueAt: new Date() },
      },
    ]);
    google.sendEmail.mockRejectedValue(new Error('Gmail down'));

    await service.dispatchDue();

    expect(prisma.reminder.update).toHaveBeenCalledWith({
      where: { id: 'r2' },
      data: expect.objectContaining({ status: ReminderStatus.error, lastError: 'Gmail down' }),
    });
  });
});

