import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

import { GoogleService } from './google.service';

const patchMock = vi.fn();
const insertMock = vi.fn();
const calendarGetMock = vi.fn();
const calendarInsertMock = vi.fn();
const sendMock = vi.fn();
const draftsCreateMock = vi.fn();
const messagesListMock = vi.fn();
const messagesGetMock = vi.fn();
const setCredentialsMock = vi.fn();
const refreshAccessTokenMock = vi.fn();
const generateAuthUrlMock = vi.fn();
const getTokenMock = vi.fn();

const oauthInstance = {
  setCredentials: setCredentialsMock,
  refreshAccessToken: refreshAccessTokenMock,
  generateAuthUrl: generateAuthUrlMock,
  getToken: getTokenMock,
};

vi.mock('googleapis', () => ({
  google: {
    auth: {
      OAuth2: vi.fn(() => oauthInstance),
    },
    calendar: vi.fn(() => ({
      events: { patch: patchMock, insert: insertMock },
      calendars: { get: calendarGetMock, insert: calendarInsertMock },
    })),
    gmail: vi.fn(() => ({
      users: {
        messages: {
          send: sendMock,
          list: messagesListMock,
          get: messagesGetMock,
        },
        drafts: {
          create: draftsCreateMock,
        },
      },
    })),
  },
}));

class PrismaMock {
  googleCredential = {
    findUnique: vi.fn(),
    upsert: vi.fn(),
    update: vi.fn(),
  };
}

describe('GoogleService', () => {
  let prisma: PrismaMock;
  let service: GoogleService;

  beforeEach(() => {
    process.env.GOOGLE_CLIENT_ID = 'client-id';
    process.env.GOOGLE_CLIENT_SECRET = 'client-secret';
    process.env.GOOGLE_REDIRECT_URI = 'http://localhost/google/callback';
    prisma = new PrismaMock();
    vi.clearAllMocks();
    service = new GoogleService(prisma as unknown as any);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns disconnected status when no credential', async () => {
    prisma.googleCredential.findUnique.mockResolvedValue(null);
    await expect(service.status('u1')).resolves.toEqual({ connected: false });
  });

  it('stores tokens on exchangeCode', async () => {
    getTokenMock.mockResolvedValue({
      tokens: {
        access_token: 'at',
        refresh_token: 'rt',
        scope: 'sc1 sc2',
        token_type: 'Bearer',
        expiry_date: Date.now() + 1000,
      },
    });
    prisma.googleCredential.upsert.mockResolvedValue(null);

    await service.exchangeCode('u1', 'code');

    expect(prisma.googleCredential.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'u1' },
        create: expect.objectContaining({ accessToken: 'at', refreshToken: 'rt' }),
      }),
    );
  });

  it('syncs deadlines to calendar with existing credential', async () => {
    prisma.googleCredential.findUnique.mockResolvedValue({
      userId: 'u1',
      accessToken: 'at',
      refreshToken: 'rt',
      scope: 's1',
      tokenType: 'Bearer',
      expiryDate: new Date(Date.now() + 120_000),
      calendarId: 'cal_1',
    });
    calendarGetMock.mockResolvedValue({});
    patchMock.mockResolvedValue({});

    const result = await service.syncDeadlinesToCalendar('u1', [
      { id: 'd1', title: 'Test', dueAt: new Date('2025-01-01T10:00:00Z') },
    ]);

    expect(calendarGetMock).toHaveBeenCalledWith({ calendarId: 'cal_1' });
    expect(patchMock).toHaveBeenCalled();
    expect(result.synced).toBe(1);
  });

  it('creates a dedicated calendar when missing', async () => {
    prisma.googleCredential.findUnique.mockResolvedValue({
      userId: 'u1',
      accessToken: 'at',
      refreshToken: 'rt',
      scope: 's1',
      tokenType: 'Bearer',
      expiryDate: new Date(Date.now() + 120_000),
      calendarId: null,
    });
    calendarInsertMock.mockResolvedValue({ data: { id: 'cal_new' } });
    patchMock.mockResolvedValue({});

    const result = await service.syncDeadlinesToCalendar('u1', [
      { id: 'd2', title: 'Test2', dueAt: new Date('2025-02-02T10:00:00Z') },
    ]);

    expect(calendarInsertMock).toHaveBeenCalled();
    expect(prisma.googleCredential.update).toHaveBeenCalledWith({
      where: { userId: 'u1' },
      data: { calendarId: 'cal_new' },
    });
    expect(result.synced).toBe(1);
  });

  it('inserts event when patch returns 404', async () => {
    prisma.googleCredential.findUnique.mockResolvedValue({
      userId: 'u1',
      accessToken: 'at',
      refreshToken: 'rt',
      scope: 's1',
      tokenType: 'Bearer',
      expiryDate: new Date(Date.now() + 120_000),
      calendarId: 'cal_1',
    });
    calendarGetMock.mockResolvedValue({});
    const err404 = new Error('Not Found') as Error & { code?: number };
    err404.code = 404;
    patchMock.mockRejectedValue(err404);
    insertMock.mockResolvedValue({});

    const result = await service.syncDeadlinesToCalendar('u1', [
      { id: 'd3', title: 'Test3', dueAt: new Date('2025-03-03T10:00:00Z') },
    ]);

    expect(patchMock).toHaveBeenCalled();
    expect(insertMock).toHaveBeenCalled();
    expect(result.synced).toBe(1);
  });

  it('creates gmail draft', async () => {
    prisma.googleCredential.findUnique.mockResolvedValue({
      userId: 'u1',
      accessToken: 'at',
      refreshToken: 'rt',
      scope: 's1',
      tokenType: 'Bearer',
      expiryDate: new Date(Date.now() + 120_000),
    });
    draftsCreateMock.mockResolvedValue({ data: { id: 'draft-1' } });

    const { draftId } = await service.createDraft('u1', 'to@example.com', 'Hello', 'Body');

    expect(draftsCreateMock).toHaveBeenCalled();
    expect(draftId).toBe('draft-1');
  });
});

