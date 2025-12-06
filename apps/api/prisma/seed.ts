import { PrismaClient, DeadlineType, TaskStatus, ReminderChannel, CandidatureType } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const contests = [
    {
      name: 'Masters Sélectifs 2026',
      year: 2026,
      url: 'https://masters2026.example.com',
      contestDeadlines: [],
      schools: [
        {
          name: 'HEC Paris',
          level: 'Bac+3/4',
          diplomas: [
            {
              name: 'MiM',
              deadlines: [
                {
                  title: 'Dossier MiM - Session Hiver',
                  type: DeadlineType.registration,
                  dueAt: '2026-01-20T23:59:00Z',
                  sessionLabel: 'HEC MiM Hiver 2026',
                },
                {
                  title: 'Résultats MiM - Hiver',
                  type: DeadlineType.result,
                  dueAt: '2026-02-20T12:00:00Z',
                  sessionLabel: 'HEC MiM Hiver 2026',
                },
              ],
            },
            {
              name: 'MBA',
              deadlines: [
                {
                  title: 'Dossier MBA - Session Printemps',
                  type: DeadlineType.registration,
                  dueAt: '2026-03-01T23:59:00Z',
                  sessionLabel: 'HEC MBA Printemps 2026',
                },
                {
                  title: 'Résultats MBA - Printemps',
                  type: DeadlineType.result,
                  dueAt: '2026-04-01T12:00:00Z',
                  sessionLabel: 'HEC MBA Printemps 2026',
                },
              ],
            },
          ],
        },
        {
          name: 'ESCP',
          level: 'Bac+3/4',
          diplomas: [
            {
              name: 'MSc Finance',
              deadlines: [
                {
                  title: 'Dossier MSc Finance - Session Hiver',
                  type: DeadlineType.registration,
                  dueAt: '2026-01-25T23:59:00Z',
                  sessionLabel: 'ESCP MSc Finance Hiver 2026',
                },
                {
                  title: 'Résultats MSc Finance - Hiver',
                  type: DeadlineType.result,
                  dueAt: '2026-02-22T12:00:00Z',
                  sessionLabel: 'ESCP MSc Finance Hiver 2026',
                },
              ],
            },
            {
              name: 'MSc Data',
              deadlines: [
                {
                  title: 'Dossier MSc Data - Session Été',
                  type: DeadlineType.registration,
                  dueAt: '2026-05-10T23:59:00Z',
                  sessionLabel: 'ESCP MSc Data Été 2026',
                },
                {
                  title: 'Résultats MSc Data - Été',
                  type: DeadlineType.result,
                  dueAt: '2026-06-05T12:00:00Z',
                  sessionLabel: 'ESCP MSc Data Été 2026',
                },
              ],
            },
          ],
        },
        {
          name: 'EDHEC',
          level: 'Bac+3/4',
          diplomas: [
            {
              name: 'MiM',
              deadlines: [
                {
                  title: 'Dossier MiM - Session Printemps',
                  type: DeadlineType.registration,
                  dueAt: '2026-03-05T23:59:00Z',
                  sessionLabel: 'EDHEC MiM Printemps 2026',
                },
                {
                  title: 'Résultats MiM - Printemps',
                  type: DeadlineType.result,
                  dueAt: '2026-04-05T12:00:00Z',
                  sessionLabel: 'EDHEC MiM Printemps 2026',
                },
              ],
            },
            {
              name: 'MSc Data',
              deadlines: [
                {
                  title: 'Dossier MSc Data - Session Automne',
                  type: DeadlineType.registration,
                  dueAt: '2026-09-01T23:59:00Z',
                  sessionLabel: 'EDHEC MSc Data Automne 2026',
                },
              ],
            },
          ],
        },
        {
          name: 'INSEAD',
          level: 'Bac+4/5',
          diplomas: [
            {
              name: 'MBA',
              deadlines: [
                {
                  title: 'Dossier MBA INSEAD - Session Hiver',
                  type: DeadlineType.registration,
                  dueAt: '2026-02-01T23:59:00Z',
                  sessionLabel: 'INSEAD MBA Hiver 2026',
                },
                {
                  title: 'Résultats MBA INSEAD - Hiver',
                  type: DeadlineType.result,
                  dueAt: '2026-03-01T12:00:00Z',
                  sessionLabel: 'INSEAD MBA Hiver 2026',
                },
              ],
            },
            {
              name: 'EMBA',
              deadlines: [
                {
                  title: 'Dossier EMBA INSEAD - Session Été',
                  type: DeadlineType.registration,
                  dueAt: '2026-06-15T23:59:00Z',
                  sessionLabel: 'INSEAD EMBA Été 2026',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'GRE General 2026',
      year: 2026,
      url: 'https://www.ets.org/gre',
      contestDeadlines: [
        { title: 'Session Février - Clôture', type: DeadlineType.registration, dueAt: '2026-01-31T23:59:00Z', sessionLabel: 'GRE Février 2026' },
        { title: 'Session Mai - Clôture', type: DeadlineType.registration, dueAt: '2026-04-15T23:59:00Z', sessionLabel: 'GRE Mai 2026' },
        { title: 'Résultats GRE (session Février)', type: DeadlineType.result, dueAt: '2026-02-28T12:00:00Z', sessionLabel: 'GRE Février 2026' },
      ],
      schools: [],
    },
    {
      name: 'TOEFL iBT 2026',
      year: 2026,
      url: 'https://www.ets.org/toefl',
      contestDeadlines: [
        { title: 'Session Mars - Clôture', type: DeadlineType.registration, dueAt: '2026-02-28T23:59:00Z', sessionLabel: 'TOEFL Mars 2026' },
        { title: 'Session Juin - Clôture', type: DeadlineType.registration, dueAt: '2026-05-20T23:59:00Z', sessionLabel: 'TOEFL Juin 2026' },
        { title: 'Résultats TOEFL (session Mars)', type: DeadlineType.result, dueAt: '2026-03-15T12:00:00Z', sessionLabel: 'TOEFL Mars 2026' },
      ],
      schools: [],
    },
    {
      name: 'IELTS Academic 2026',
      year: 2026,
      url: 'https://www.ielts.org/',
      contestDeadlines: [
        { title: 'Session Avril - Clôture', type: DeadlineType.registration, dueAt: '2026-03-25T23:59:00Z', sessionLabel: 'IELTS Avril 2026' },
        { title: 'Session Juillet - Clôture', type: DeadlineType.registration, dueAt: '2026-06-10T23:59:00Z', sessionLabel: 'IELTS Juillet 2026' },
        { title: 'Résultats IELTS (session Avril)', type: DeadlineType.result, dueAt: '2026-04-20T12:00:00Z', sessionLabel: 'IELTS Avril 2026' },
      ],
      schools: [],
    },
    {
      name: 'TOEIC Public 2026',
      year: 2026,
      url: 'https://www.ets.org/toeic',
      contestDeadlines: [
        { title: 'Session Février - Clôture', type: DeadlineType.registration, dueAt: '2026-01-20T23:59:00Z', sessionLabel: 'TOEIC Février 2026' },
        { title: 'Session Mai - Clôture', type: DeadlineType.registration, dueAt: '2026-04-20T23:59:00Z', sessionLabel: 'TOEIC Mai 2026' },
        { title: 'Résultats TOEIC (session Février)', type: DeadlineType.result, dueAt: '2026-02-15T12:00:00Z', sessionLabel: 'TOEIC Février 2026' },
      ],
      schools: [],
    },
    {
      name: 'TAGE MAGE 2026',
      year: 2026,
      url: 'https://www.tagemage.fr/',
      contestDeadlines: [
        { title: 'Session Mars - Clôture', type: DeadlineType.registration, dueAt: '2026-02-18T23:59:00Z', sessionLabel: 'TAGE MAGE Mars 2026' },
        { title: 'Session Juin - Clôture', type: DeadlineType.registration, dueAt: '2026-05-25T23:59:00Z', sessionLabel: 'TAGE MAGE Juin 2026' },
        { title: 'Résultats TAGE MAGE (session Mars)', type: DeadlineType.result, dueAt: '2026-03-25T12:00:00Z', sessionLabel: 'TAGE MAGE Mars 2026' },
      ],
      schools: [],
    },
  ];

  // Purge old catalog and user data to avoid legacy concours/écoles
  await prisma.task.deleteMany();
  await prisma.reminder.deleteMany();
  await prisma.document.deleteMany();
  await prisma.candidature.deleteMany();
  await prisma.deadline.deleteMany();
  await prisma.school.deleteMany();
  await prisma.contest.deleteMany();

  for (const contest of contests) {
    const createdContest = await prisma.contest.upsert({
      where: { name_year: { name: contest.name, year: contest.year } },
      update: {},
      create: {
        name: contest.name,
        year: contest.year,
        url: contest.url,
      },
    });

    if (contest.contestDeadlines?.length) {
      await prisma.deadline.createMany({
        data: contest.contestDeadlines.map((dl) => ({
          title: dl.title,
          type: dl.type,
          dueAt: dl.dueAt,
          contestId: createdContest.id,
          schoolId: null,
          createdByAdmin: true,
          diplomaName: dl.diplomaName,
          sessionLabel: dl.sessionLabel,
        })),
        skipDuplicates: true,
      });
    }

    for (const school of contest.schools) {
      const createdSchool = await prisma.school.upsert({
        where: { name_contestId: { name: school.name, contestId: createdContest.id } },
        update: {},
        create: {
          name: school.name,
          contestId: createdContest.id,
        },
      });

      if (school.diplomas?.length) {
        for (const diploma of school.diplomas) {
          await prisma.deadline.createMany({
            data: diploma.deadlines.map((dl) => ({
              title: dl.title,
              type: dl.type,
              dueAt: dl.dueAt,
              contestId: createdContest.id,
              schoolId: createdSchool.id,
              createdByAdmin: true,
              diplomaName: diploma.name,
              sessionLabel: dl.sessionLabel,
            })),
            skipDuplicates: true,
          });
        }
      }
    }
  }

  // Demo user + candidature + tâches + rappel
  const demoPasswordHash = await hash('Demo123!', 10);
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@dossiertracker.test' },
    update: {},
    create: {
      email: 'demo@dossiertracker.test',
      passwordHash: demoPasswordHash,
      firstName: 'Demo',
      lastName: 'User',
      role: 'student',
    },
  });

  const astContest = await prisma.contest.findFirst({ where: { name: 'AST 2026', year: 2026 } });
  const mastersContest = await prisma.contest.findFirst({ where: { name: 'Masters Sélectifs 2026', year: 2026 } });

  if (astContest) {
    const concoursCandidature =
      (await prisma.candidature.findFirst({
        where: { userId: demoUser.id, contestId: astContest.id },
      })) ||
      (await prisma.candidature.create({
        data: {
          userId: demoUser.id,
          contestId: astContest.id,
          type: CandidatureType.concours,
          status: 'draft',
          diplomaName: 'AST Grande École',
        },
      }));

    const astDeadlines = await prisma.deadline.findMany({ where: { contestId: astContest.id } });

    for (const dl of astDeadlines) {
      await prisma.task.upsert({
        where: { id: `${concoursCandidature.id}-${dl.id}` },
        update: {},
        create: {
          id: `${concoursCandidature.id}-${dl.id}`,
          title: dl.title,
          status: TaskStatus.todo,
          candidatureId: concoursCandidature.id,
          deadlineId: dl.id,
        },
      });
    }
  }

  if (mastersContest) {
    const diplomaName = 'MSc Data';
    const diplomeCandidature =
      (await prisma.candidature.findFirst({
        where: { userId: demoUser.id, contestId: mastersContest.id, diplomaName, type: CandidatureType.diplome },
      })) ||
      (await prisma.candidature.create({
        data: {
          userId: demoUser.id,
          contestId: mastersContest.id,
          type: CandidatureType.diplome,
          diplomaName,
          status: 'draft',
        },
      }));

    const dataDeadlines = await prisma.deadline.findMany({
      where: { contestId: mastersContest.id, diplomaName },
    });

    for (const dl of dataDeadlines) {
      await prisma.task.upsert({
        where: { id: `${diplomeCandidature.id}-${dl.id}` },
        update: {},
        create: {
          id: `${diplomeCandidature.id}-${dl.id}`,
          title: dl.title,
          status: TaskStatus.todo,
          candidatureId: diplomeCandidature.id,
          deadlineId: dl.id,
        },
      });

      await prisma.reminder.upsert({
        where: { id: `${demoUser.id}-${dl.id}-email` },
        update: {},
        create: {
          id: `${demoUser.id}-${dl.id}-email`,
          userId: demoUser.id,
          deadlineId: dl.id,
          channel: ReminderChannel.email,
          sendAt: new Date(new Date(dl.dueAt).getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
      });
    }
  }
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

