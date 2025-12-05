import { PrismaClient, DeadlineType, TaskStatus, ReminderChannel } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const contests = [
    {
      name: 'HEC AST',
      year: 2025,
      url: 'https://www.hec.edu/',
      schools: [
        {
          name: 'HEC Paris',
          deadlines: [
            { title: 'Clôture inscriptions', type: DeadlineType.registration, dueAt: '2025-02-01T23:59:00Z' },
            { title: 'Résultats admissibilité', type: DeadlineType.result, dueAt: '2025-04-15T12:00:00Z' },
          ],
        },
      ],
    },
    {
      name: 'ESSEC AST',
      year: 2025,
      url: 'https://www.essec.edu/',
      schools: [
        {
          name: 'ESSEC Business School',
          deadlines: [
            { title: 'Clôture inscriptions', type: DeadlineType.registration, dueAt: '2025-02-20T23:59:00Z' },
            { title: 'Résultats admissibilité', type: DeadlineType.result, dueAt: '2025-04-25T12:00:00Z' },
            { title: 'Oraux', type: DeadlineType.oral, dueAt: '2025-05-15T08:00:00Z' },
          ],
        },
      ],
    },
    {
      name: 'Passerelle',
      year: 2025,
      url: 'https://www.passerelle-esc.com/',
      schools: [
        {
          name: 'EM Grenoble',
          deadlines: [
            { title: 'Inscription', type: DeadlineType.registration, dueAt: '2025-03-10T23:59:00Z' },
            { title: 'Oral', type: DeadlineType.oral, dueAt: '2025-04-30T09:00:00Z' },
          ],
        },
        {
          name: 'EM Strasbourg',
          deadlines: [
            { title: 'Inscription', type: DeadlineType.registration, dueAt: '2025-03-10T23:59:00Z' },
            { title: 'Résultats', type: DeadlineType.result, dueAt: '2025-05-20T12:00:00Z' },
          ],
        },
      ],
    },
    {
      name: 'Tremplin',
      year: 2025,
      url: 'https://www.concours-tremplin.fr/',
      schools: [
        {
          name: 'NEOMA BS',
          deadlines: [
            { title: 'Inscription', type: DeadlineType.registration, dueAt: '2025-03-05T23:59:00Z' },
            { title: 'Résultats admissibilité', type: DeadlineType.result, dueAt: '2025-04-22T12:00:00Z' },
            { title: 'Oral', type: DeadlineType.oral, dueAt: '2025-05-05T08:00:00Z' },
          ],
        },
        {
          name: 'KEDGE BS',
          deadlines: [
            { title: 'Inscription', type: DeadlineType.registration, dueAt: '2025-03-08T23:59:00Z' },
            { title: 'Résultats admissibilité', type: DeadlineType.result, dueAt: '2025-04-24T12:00:00Z' },
          ],
        },
      ],
    },
    {
      name: 'Officiel Décembre',
      year: 2025,
      url: 'https://www.dossiertracker.test/decembre',
      schools: [
        {
          name: 'Suivi DossierTracker',
          deadlines: [
            { title: 'Dossier complet (Décembre)', type: DeadlineType.registration, dueAt: '2025-12-08T09:00:00Z' },
            { title: 'Résultats pré-admissibilité', type: DeadlineType.result, dueAt: '2025-12-10T12:00:00Z' },
            { title: 'Oraux de confirmation', type: DeadlineType.oral, dueAt: '2025-12-12T08:30:00Z' },
          ],
        },
      ],
    },
  ];

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

    for (const school of contest.schools) {
      const createdSchool = await prisma.school.upsert({
        where: { name_contestId: { name: school.name, contestId: createdContest.id } },
        update: {},
        create: {
          name: school.name,
          contestId: createdContest.id,
        },
      });

      for (const dl of school.deadlines) {
        await prisma.deadline.upsert({
          where: {
            contestId_schoolId_title: {
              contestId: createdContest.id,
              schoolId: createdSchool.id,
              title: dl.title,
            },
          },
          update: {},
          create: {
            title: dl.title,
            type: dl.type,
            dueAt: dl.dueAt,
            contestId: createdContest.id,
            schoolId: createdSchool.id,
            createdByAdmin: true,
          },
        });
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

  const hecContest = await prisma.contest.findFirst({ where: { name: 'HEC AST', year: 2025 } });
  const hecSchool = hecContest
    ? await prisma.school.findFirst({ where: { contestId: hecContest.id, name: 'HEC Paris' } })
    : null;
  const hecDeadline = hecContest
    ? await prisma.deadline.findFirst({
        where: { contestId: hecContest.id, title: 'Clôture inscriptions' },
      })
    : null;

  if (hecContest && hecSchool) {
    const candidature =
      (await prisma.candidature.findFirst({
        where: { userId: demoUser.id, contestId: hecContest.id, schoolId: hecSchool.id },
      })) ||
      (await prisma.candidature.create({
        data: {
          userId: demoUser.id,
          contestId: hecContest.id,
          schoolId: hecSchool.id,
          status: 'draft',
        },
      }));

    await prisma.task.upsert({
      where: { id: `${candidature.id}-cv` },
      update: {},
      create: {
        id: `${candidature.id}-cv`,
        title: 'Mettre à jour le CV',
        status: TaskStatus.todo,
        candidatureId: candidature.id,
        tips: 'Utilise un modèle 1 page clair, avec résultats académiques.',
      },
    });

    if (hecDeadline) {
      await prisma.task.upsert({
        where: { id: `${candidature.id}-inscription` },
        update: {},
        create: {
          id: `${candidature.id}-inscription`,
          title: 'Finaliser inscription HEC',
          status: TaskStatus.todo,
          candidatureId: candidature.id,
          deadlineId: hecDeadline.id,
        },
      });

      await prisma.reminder.upsert({
        where: { id: `${demoUser.id}-${hecDeadline.id}-email` },
        update: {},
        create: {
          id: `${demoUser.id}-${hecDeadline.id}-email`,
          userId: demoUser.id,
          deadlineId: hecDeadline.id,
          channel: ReminderChannel.email,
          sendAt: new Date(new Date(hecDeadline.dueAt).getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(), // J-7
        },
      });
    }
  }

  const decemberContest = await prisma.contest.findFirst({ where: { name: 'Officiel Décembre', year: 2025 } });
  const decemberSchool = decemberContest
    ? await prisma.school.findFirst({ where: { contestId: decemberContest.id, name: 'Suivi DossierTracker' } })
    : null;
  const decemberDeadlines =
    decemberContest && decemberSchool
      ? await prisma.deadline.findMany({ where: { contestId: decemberContest.id, schoolId: decemberSchool.id } })
      : [];

  if (decemberContest && decemberSchool) {
    const decCandidature =
      (await prisma.candidature.findFirst({
        where: { userId: demoUser.id, contestId: decemberContest.id, schoolId: decemberSchool.id },
      })) ||
      (await prisma.candidature.create({
        data: {
          userId: demoUser.id,
          contestId: decemberContest.id,
          schoolId: decemberSchool.id,
          status: 'draft',
        },
      }));

    for (const dl of decemberDeadlines) {
      await prisma.task.upsert({
        where: { id: `${decCandidature.id}-${dl.id}` },
        update: {},
        create: {
          id: `${decCandidature.id}-${dl.id}`,
          title: dl.title,
          status: TaskStatus.todo,
          candidatureId: decCandidature.id,
          deadlineId: dl.id,
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

