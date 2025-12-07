import { promises as fs } from "fs";
import { PrismaClient, ProgramFormat, ProgramType } from "@prisma/client";
import { z } from "zod";

type LeaderboardModel = PrismaClient["leaderboard"];
type LeaderboardEntryModel = PrismaClient["leaderboardEntry"];
type SchoolModel = PrismaClient["school"];
type ProgramModel = PrismaClient["program"];

type PrismaLike = {
  leaderboard: Pick<LeaderboardModel, "upsert">;
  leaderboardEntry: Pick<LeaderboardEntryModel, "deleteMany" | "createMany">;
  school: Pick<SchoolModel, "findFirst" | "create">;
  program: Pick<ProgramModel, "findFirst" | "create" | "findUnique">;
};

const RankingEntrySchema = z.object({
  rank: z.number().int().positive(),
  school_name: z.string().min(1),
  program_name: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  score: z.number().optional(),
  notes: z.string().optional(),
  link: z.string().url().optional(),
  metadata: z.record(z.any()).optional(),
});

const LeaderboardPayloadSchema = z.object({
  master_type: z.string().min(1),
  source: z.string().min(1),
  category: z.string().min(1),
  year: z.number().int().min(1900),
  source_url: z.string().url(),
  region: z.string().optional(),
  entries: z.array(RankingEntrySchema).min(1),
  scraped_at: z.string().optional(),
});

type LeaderboardPayload = z.infer<typeof LeaderboardPayloadSchema>;
type RankingEntry = z.infer<typeof RankingEntrySchema>;

const programTypeFrom = (masterType: string): ProgramType => {
  const normalized = masterType.trim().toLowerCase();
  if (normalized.includes("mba") && normalized.includes("executive")) return ProgramType.emba;
  if (normalized === "mba") return ProgramType.mba;
  if (["mim", "master in management", "pge"].includes(normalized)) return ProgramType.master;
  if (normalized.includes("finance")) return ProgramType.msc;
  if (normalized.includes("analytics") || normalized.includes("data")) return ProgramType.specialized_msc;
  if (normalized.includes("msc")) return ProgramType.msc;
  return ProgramType.other;
};

const slugify = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const uniqueProgramSlug = async (prisma: PrismaLike, base: string): Promise<string> => {
  let candidate = slugify(base);
  let suffix = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const exists = await prisma.program.findUnique({ where: { slug: candidate } });
    if (!exists) return candidate;
    candidate = `${slugify(base)}-${suffix}`;
    suffix += 1;
  }
};

const ensureSchool = async (
  prisma: PrismaLike,
  entry: RankingEntry,
): Promise<{ id: string; name: string }> => {
  const existing = await prisma.school.findFirst({
    where: { name: entry.school_name, contestId: null },
  });
  if (existing) return existing;

  return prisma.school.create({
    data: {
      name: entry.school_name,
      contestId: null,
      country: entry.country,
      city: entry.city,
      website: entry.link,
      currency: "EUR",
    },
  });
};

const ensureProgram = async (
  prisma: PrismaLike,
  entry: RankingEntry,
  schoolId: string,
  payload: LeaderboardPayload,
): Promise<{ id: string; slug: string } | null> => {
  if (!entry.program_name) return null;

  const existing = await prisma.program.findFirst({
    where: { name: entry.program_name, schoolId },
  });
  if (existing) return existing;

  const slug = await uniqueProgramSlug(prisma, `${entry.program_name}-${payload.master_type}`);
  return prisma.program.create({
    data: {
      slug,
      name: entry.program_name,
      type: programTypeFrom(payload.master_type),
      domain: payload.category,
      description: entry.notes,
      format: ProgramFormat.full_time,
      campuses: entry.city ? [entry.city] : [],
      languages: [],
      startPeriods: [],
      admissionPrerequisites: [],
      admissionTests: [],
      admissionDocuments: [],
      outcomes: [],
      schoolId,
      contestId: null,
      currency: "EUR",
    },
  });
};

const buildLeaderboardSlug = (payload: LeaderboardPayload): string =>
  slugify(`${payload.source}-${payload.category}-${payload.year}-${payload.master_type}`);

const upsertLeaderboard = async (
  prisma: PrismaLike,
  payload: LeaderboardPayload,
): Promise<{ id: string }> => {
  const slug = buildLeaderboardSlug(payload);
  return prisma.leaderboard.upsert({
    where: { slug },
    update: {
      name: `${payload.category} - ${payload.source}`,
      source: payload.source,
      category: payload.category,
      region: payload.region,
      year: payload.year,
      url: payload.source_url,
    },
    create: {
      slug,
      name: `${payload.category} - ${payload.source}`,
      source: payload.source,
      category: payload.category,
      region: payload.region,
      year: payload.year,
      url: payload.source_url,
      description: `Scraped ${payload.master_type} ${payload.year}`,
    },
  });
};

export const ingestPayload = async (prisma: PrismaLike, payload: LeaderboardPayload) => {
  const leaderboard = await upsertLeaderboard(prisma, payload);

  await prisma.leaderboardEntry.deleteMany({ where: { leaderboardId: leaderboard.id } });

  const entriesData = [];
  for (const entry of payload.entries) {
    const school = await ensureSchool(prisma, entry);
    const program = await ensureProgram(prisma, entry, school.id, payload);

    entriesData.push({
      rank: entry.rank,
      score: entry.score ?? null,
      notes: entry.notes,
      schoolId: school.id,
      programId: program?.id ?? null,
      leaderboardId: leaderboard.id,
    });
  }

  if (entriesData.length) {
    await prisma.leaderboardEntry.createMany({
      data: entriesData,
      skipDuplicates: false,
    });
  }
};

const readPayloadFromFile = async (path: string): Promise<LeaderboardPayload> => {
  const content = await fs.readFile(path, "utf-8");
  const parsed = JSON.parse(content);
  return LeaderboardPayloadSchema.parse(parsed);
};

const parseArgs = (): { input: string } => {
  const inputFlagIndex = process.argv.findIndex((arg) => arg === "--input");
  if (inputFlagIndex === -1 || !process.argv[inputFlagIndex + 1]) {
    throw new Error("Usage: ts-node ingest-rankings.ts --input path/to/ranking.json");
  }
  return { input: process.argv[inputFlagIndex + 1] };
};

const run = async () => {
  const { input } = parseArgs();
  const prisma = new PrismaClient();
  try {
    const payload = await readPayloadFromFile(input);
    await ingestPayload(prisma, payload);
    // eslint-disable-next-line no-console
    console.log(`Ingested leaderboard ${payload.category} ${payload.year} from ${payload.source}`);
  } finally {
    await prisma.$disconnect();
  }
};

if (require.main === module) {
  run().catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
  });
}


