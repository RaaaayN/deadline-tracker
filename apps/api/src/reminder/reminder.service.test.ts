import { ReminderChannel, ReminderStatus } from '@prisma/client';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { NotificationService } from '../notification/notification.service';
import { PrismaService } from '../prisma.service';

import { ReminderService } from './reminder.service';

class MockPrisma {
  reminder = {
    findMany: vi.fn(),
    update: vi.fn(),
  };
}

class MockNotification {
  sendEmailReminder = vi.fn();
}

describe('ReminderService dispatchDue', () => {
  let prisma: MockPrisma;
  let notifier: MockNotification;
  let service: ReminderService;

  beforeEach(() => {
    prisma = new MockPrisma();
    notifier = new MockNotification();
    service = new ReminderService(prisma as unknown as PrismaService, notifier as unknown as NotificationService);
  });

  it('sends pending email reminders and marks them sent', async () => {
    const dueAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    prisma.reminder.findMany.mockResolvedValue([
      {
        id: 'r1',
        channel: ReminderChannel.email,
        status: ReminderStatus.pending,
        sendAt: new Date(),
        user: { email: 'user@example.com' },
        deadline: { title: 'Test', dueAt },
      },
    ]);
    notifier.sendEmailReminder.mockResolvedValue(undefined);

    await service.dispatchDue();

    expect(notifier.sendEmailReminder).toHaveBeenCalledWith(
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
        channel: ReminderChannel.email,
        status: ReminderStatus.pending,
        sendAt: new Date(),
        user: { email: 'user@example.com' },
        deadline: { title: 'Test', dueAt: new Date() },
      },
    ]);
    notifier.sendEmailReminder.mockRejectedValue(new Error('SMTP down'));

    await service.dispatchDue();

    expect(prisma.reminder.update).toHaveBeenCalledWith({
      where: { id: 'r2' },
      data: expect.objectContaining({ status: ReminderStatus.error, lastError: 'SMTP down' }),
    });
  });
});

