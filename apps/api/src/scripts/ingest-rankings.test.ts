import { ProgramFormat, ProgramType } from "@prisma/client";
import { describe, expect, it, beforeEach } from "vitest";

import { ingestPayload } from "./ingest-rankings";

type LeaderboardRecord = {
  id: string;
  slug: string;
  name: string;
  source: string;
  category: string;
  region?: string | null;
  year: number;
  url: string;
};

type SchoolRecord = {
  id: string;
  name: string;
  contestId: string | null;
  country?: string | null;
  city?: string | null;
  website?: string | null;
  currency: string;
};

type ProgramRecord = {
  id: string;
  slug: string;
  name: string;
  schoolId: string;
  type: ProgramType;
  domain: string;
  description?: string | null;
  format: ProgramFormat;
  campuses: string[];
  languages: string[];
  startPeriods: string[];
  admissionPrerequisites: string[];
  admissionTests: string[];
  admissionDocuments: string[];
  outcomes: string[];
  contestId: string | null;
  currency: string;
};

type EntryRecord = {
  rank: number;
  score: number | null;
  notes?: string | null;
  schoolId: string | null;
  programId: string | null;
  leaderboardId: string;
};

class FakePrisma {
  private id = 0;
  leaderboards = new Map<string, LeaderboardRecord>();
  schools: SchoolRecord[] = [];
  programs: ProgramRecord[] = [];
  entries: EntryRecord[] = [];

  private nextId(): string {
    this.id += 1;
    return `id-${this.id}`;
  }

  leaderboard = {
    upsert: async ({ where, update, create }: any) => {
      const existing = this.leaderboards.get(where.slug);
      if (existing) {
        const updated = { ...existing, ...update };
        this.leaderboards.set(where.slug, updated);
        return updated;
      }
      const created = { id: this.nextId(), ...create };
      this.leaderboards.set(where.slug, created);
      return created;
    },
  };

  leaderboardEntry = {
    deleteMany: async ({ where }: any) => {
      this.entries = this.entries.filter((e) => e.leaderboardId !== where.leaderboardId);
      return { count: 0 };
    },
    createMany: async ({ data }: any) => {
      this.entries.push(...data);
      return { count: data.length };
    },
  };

  school = {
    findFirst: async ({ where }: any) => {
      return this.schools.find(
        (s) => s.name === where.name && s.contestId === where.contestId,
      );
    },
    create: async ({ data }: any) => {
      const created: SchoolRecord = {
        id: this.nextId(),
        name: data.name,
        contestId: data.contestId,
        country: data.country ?? null,
        city: data.city ?? null,
        website: data.website ?? null,
        currency: data.currency ?? "EUR",
      };
      this.schools.push(created);
      return created;
    },
  };

  program = {
    findFirst: async ({ where }: any) => {
      return this.programs.find(
        (p) => p.name === where.name && p.schoolId === where.schoolId,
      );
    },
    findUnique: async ({ where }: any) => {
      return this.programs.find((p) => p.slug === where.slug);
    },
    create: async ({ data }: any) => {
      const created: ProgramRecord = {
        id: this.nextId(),
        slug: data.slug,
        name: data.name,
        schoolId: data.schoolId,
        type: data.type,
        domain: data.domain,
        description: data.description,
        format: data.format,
        campuses: data.campuses,
        languages: data.languages,
        startPeriods: data.startPeriods,
        admissionPrerequisites: data.admissionPrerequisites,
        admissionTests: data.admissionTests,
        admissionDocuments: data.admissionDocuments,
        outcomes: data.outcomes,
        contestId: data.contestId,
        currency: data.currency,
      };
      this.programs.push(created);
      return created;
    },
  };
}

const samplePayload = {
  master_type: "mim",
  source: "Demo Source",
  category: "Master in Management",
  year: 2025,
  source_url: "https://example.com",
  entries: [
    {
      rank: 1,
      school_name: "HEC Paris",
      program_name: "MiM",
      country: "France",
      city: "Jouy-en-Josas",
      score: 98.1,
    },
    {
      rank: 2,
      school_name: "ESCP Business School",
      program_name: "MiM",
      country: "France",
      city: "Paris",
      score: 96.4,
    },
  ],
};

describe("ingestPayload", () => {
  let prisma: FakePrisma;

  beforeEach(() => {
    prisma = new FakePrisma();
  });

  it("creates leaderboard, schools, programs and entries", async () => {
    await ingestPayload(prisma as any, samplePayload);

    expect(prisma.leaderboards.size).toBe(1);
    expect(prisma.schools).toHaveLength(2);
    expect(prisma.programs).toHaveLength(2);
    expect(prisma.entries).toHaveLength(2);
  });

  it("is idempotent on leaderboard entries", async () => {
    await ingestPayload(prisma as any, samplePayload);
    await ingestPayload(prisma as any, samplePayload);

    expect(prisma.schools).toHaveLength(2);
    expect(prisma.programs).toHaveLength(2);
    expect(prisma.entries).toHaveLength(2);
  });
});


