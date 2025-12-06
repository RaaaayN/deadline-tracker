import { createHash } from 'crypto';

import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { google, Auth, calendar_v3, gmail_v1 } from 'googleapis';

import { PrismaService } from '../prisma.service';

type DeadlineForSync = {
  id: string;
  title: string;
  dueAt: Date;
  candidatureId: string;
};

type GmailMessage = {
  id: string;
  snippet: string;
  subject?: string;
  from?: string;
  date?: string;
};

const DEFAULT_SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.modify',
];

@Injectable()
export class GoogleService {
  private readonly logger = new Logger(GoogleService.name);
  private readonly clientId = process.env.GOOGLE_CLIENT_ID;
  private readonly clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  private readonly redirectUri = process.env.GOOGLE_REDIRECT_URI;
  private readonly scopes: string[];

  constructor(private readonly prisma: PrismaService) {
    this.scopes = (process.env.GOOGLE_SCOPES ?? DEFAULT_SCOPES.join(' ')).split(/\s+/).filter(Boolean);
    if (!this.clientId || !this.clientSecret || !this.redirectUri) {
      throw new Error('Google OAuth configuration missing (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_REDIRECT_URI)');
    }
  }

  buildAuthUrl(): string {
    const oAuth2Client = this.buildOAuthClient();
    return oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: this.scopes,
    });
  }

  async exchangeCode(userId: string, code: string): Promise<{ connected: true }> {
    const client = this.buildOAuthClient();
    const { tokens } = await client.getToken(code);
    if (!tokens.refresh_token) {
      throw new BadRequestException(
        'Google n’a pas renvoyé de refresh token (prompt=consent & access_type=offline requis).',
      );
    }
    await this.persistTokens(userId, tokens);
    return { connected: true };
  }

  async status(userId: string): Promise<{ connected: boolean; scopes?: string[]; expiryDate?: Date }> {
    const stored = await this.prisma.googleCredential.findUnique({ where: { userId } });
    if (!stored) {
      return { connected: false };
    }
    return { connected: true, scopes: stored.scope.split(' '), expiryDate: stored.expiryDate ?? undefined };
  }

  async syncDeadlinesToCalendar(userId: string, deadlines: DeadlineForSync[]): Promise<{ synced: number }> {
    if (deadlines.length === 0) {
      return { synced: 0 };
    }

    const { calendar } = await this.getCalendarClient(userId);
    const calendarId = await this.ensureCalendar(userId, calendar);
    let synced = 0;
    for (const deadline of deadlines) {
      const ok = await this.upsertEvent(calendar, calendarId, deadline);
      if (ok) {
        synced += 1;
      }
    }

    return { synced };
  }

  async sendEmail(userId: string, to: string, subject: string, text: string): Promise<void> {
    const { gmail } = await this.getGmailClient(userId);
    const raw = this.buildRawEmail(to, subject, text);

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw,
      },
    });
  }

  async createDraft(userId: string, to: string, subject: string, text: string): Promise<{ draftId: string }> {
    const { gmail } = await this.getGmailClient(userId);
    const raw = this.buildRawEmail(to, subject, text);

    const res = await gmail.users.drafts.create({
      userId: 'me',
      requestBody: { message: { raw } },
    });

    return { draftId: res.data.id ?? '' };
  }

  async listInbox(userId: string): Promise<GmailMessage[]> {
    const { gmail } = await this.getGmailClient(userId);
    const list = await gmail.users.messages.list({ userId: 'me', maxResults: 10, labelIds: ['INBOX'] });
    const messages = list.data.messages ?? [];
    const results: GmailMessage[] = [];

    for (const msg of messages) {
      if (!msg.id) continue;
      try {
        const full = await gmail.users.messages.get({
          userId: 'me',
          id: msg.id,
          format: 'metadata',
          metadataHeaders: ['Subject', 'From', 'Date'],
        });
        const headers = full.data.payload?.headers ?? [];
        const getHeader = (name: string) => headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value;
        results.push({
          id: msg.id,
          snippet: full.data.snippet ?? '',
          subject: getHeader('Subject'),
          from: getHeader('From'),
          date: getHeader('Date'),
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Gmail fetch error';
        this.logger.warn(`Unable to fetch Gmail message ${msg.id}: ${message}`);
      }
    }

    return results;
  }

  private buildOAuthClient(): Auth.OAuth2Client {
    return new google.auth.OAuth2(this.clientId, this.clientSecret, this.redirectUri);
  }

  private async getCalendarClient(
    userId: string,
  ): Promise<{ calendar: calendar_v3.Calendar; auth: Auth.OAuth2Client }> {
    const auth = await this.getAuthorizedClient(userId);
    return { calendar: google.calendar({ version: 'v3', auth }), auth };
  }

  private async getGmailClient(userId: string): Promise<{ gmail: gmail_v1.Gmail; auth: Auth.OAuth2Client }> {
    const auth = await this.getAuthorizedClient(userId);
    return { gmail: google.gmail({ version: 'v1', auth }), auth };
  }

  private async getAuthorizedClient(userId: string): Promise<Auth.OAuth2Client> {
    const stored = await this.prisma.googleCredential.findUnique({ where: { userId } });
    if (!stored) {
      throw new BadRequestException('Compte Google non connecté pour cet utilisateur.');
    }

    const client = this.buildOAuthClient();
    client.setCredentials({
      access_token: stored.accessToken,
      refresh_token: stored.refreshToken,
      scope: stored.scope,
      token_type: stored.tokenType,
      expiry_date: stored.expiryDate ? stored.expiryDate.getTime() : undefined,
    });

    const needsRefresh = !stored.expiryDate || stored.expiryDate.getTime() <= Date.now() + 60 * 1000;
    if (!needsRefresh) {
      return client;
    }

    const refreshed = await client.refreshAccessToken();
    const credentials = refreshed.credentials;
    await this.persistTokens(userId, {
      ...credentials,
      refresh_token: credentials.refresh_token ?? stored.refreshToken,
    });
    client.setCredentials({
      ...credentials,
      refresh_token: credentials.refresh_token ?? stored.refreshToken,
    });
    return client;
  }

  private async persistTokens(userId: string, tokens: Auth.Credentials): Promise<void> {
    const accessToken = tokens.access_token;
    const refreshToken = tokens.refresh_token;
    if (!accessToken || !refreshToken) {
      throw new BadRequestException('Tokens Google incomplets');
    }

    const expiryDate = tokens.expiry_date ? new Date(tokens.expiry_date) : null;
    await this.prisma.googleCredential.upsert({
      where: { userId },
      update: {
        accessToken,
        refreshToken,
        scope: tokens.scope ?? this.scopes.join(' '),
        tokenType: tokens.token_type ?? 'Bearer',
        expiryDate,
      },
      create: {
        userId,
        accessToken,
        refreshToken,
        scope: tokens.scope ?? this.scopes.join(' '),
        tokenType: tokens.token_type ?? 'Bearer',
        expiryDate,
      },
    });
  }

  private async upsertEvent(
    calendar: calendar_v3.Calendar,
    calendarId: string,
    deadline: DeadlineForSync,
  ): Promise<boolean> {
    const eventId = this.buildEventId(deadline.id, deadline.candidatureId);
    const requestBody = {
      summary: deadline.title,
      description: 'Échéance DossierTracker synchronisée automatiquement.',
      start: { dateTime: deadline.dueAt.toISOString(), timeZone: 'Europe/Paris' },
      end: { dateTime: deadline.dueAt.toISOString(), timeZone: 'Europe/Paris' },
      reminders: { useDefault: true },
      extendedProperties: {
        private: {
          source: 'dossiertracker',
          deadlineId: deadline.id,
          candidatureId: deadline.candidatureId,
        },
      },
    };

    try {
      await calendar.events.patch({
        calendarId,
        eventId,
        requestBody,
      });
      return true;
    } catch (err: unknown) {
      const status = typeof err === 'object' && err && 'code' in err ? (err as { code?: number }).code : undefined;
      const responseStatus =
        typeof err === 'object' && err && 'response' in err
          ? (err as { response?: { status?: number } }).response?.status
          : undefined;
      const isNotFound = status === 404 || responseStatus === 404;

      if (!isNotFound) {
        const message = err instanceof Error ? err.message : 'Calendar sync error';
        this.logger.warn(`Calendar sync failed for deadline ${deadline.id}: ${message}`);
        return false;
      }
    }

    try {
      await calendar.events.insert({
        calendarId,
        requestBody: {
          ...requestBody,
          id: eventId,
        },
      });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Calendar insert error';
      const isInvalidId = message.toLowerCase().includes('invalid resource id');
      if (isInvalidId) {
        this.logger.warn(`Calendar insert failed for deadline ${deadline.id} (id ${eventId}), retrying without id: ${message}`);
        try {
          await calendar.events.insert({
            calendarId,
            requestBody,
          });
          return true;
        } catch (err2) {
          const msg2 = err2 instanceof Error ? err2.message : 'Calendar insert error';
          this.logger.warn(`Calendar insert retry failed for deadline ${deadline.id}: ${msg2}`);
          return false;
        }
      }
      this.logger.warn(`Calendar insert failed for deadline ${deadline.id}: ${message}`);
      return false;
    }
  }

  private async ensureCalendar(userId: string, calendar: calendar_v3.Calendar): Promise<string> {
    const stored = await this.prisma.googleCredential.findUnique({ where: { userId } });
    if (stored?.calendarId) {
      try {
        await calendar.calendars.get({ calendarId: stored.calendarId });
        return stored.calendarId;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Calendar get failed';
        this.logger.warn(`Calendar ${stored.calendarId} missing for user ${userId}: ${message}`);
      }
    }

    const created = await calendar.calendars.insert({
      requestBody: {
        summary: 'DossierTracker',
        description: 'Échéances et tâches synchronisées depuis DossierTracker',
      },
    });
    const calendarId = created.data.id;
    if (!calendarId) {
      throw new BadRequestException('Impossible de créer le calendrier DossierTracker');
    }

    await this.prisma.googleCredential.update({
      where: { userId },
      data: { calendarId },
    });
    return calendarId;
  }

  private buildRawEmail(to: string, subject: string, text: string): string {
    const message = [
      `To: ${to}`,
      'Content-Type: text/plain; charset="UTF-8"',
      'Content-Transfer-Encoding: 7bit',
      `Subject: ${subject}`,
      '',
      text,
    ].join('\r\n');
    return Buffer.from(message).toString('base64url');
  }

  private buildEventId(deadlineId: string, candidatureId: string): string {
    const raw = `dt-${deadlineId}-${candidatureId}`;
    const sanitized = raw.replace(/[^a-zA-Z0-9_-]/g, '-');
    if (sanitized.length >= 5 && sanitized.length <= 60) {
      return sanitized;
    }
    const hash = createHash('sha256').update(deadlineId).digest('hex').slice(0, 32);
    return `dt-${hash}`;
  }
}

