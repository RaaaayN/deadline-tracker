import {
  CandidatureType,
  DeadlineType,
  ProgramFormat,
  ProgramType,
  ReminderChannel,
  TaskStatus,
  TestType,
  PrismaClient,
} from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

type SeedDeadline = {
  title: string;
  type: DeadlineType;
  dueAt: string;
  sessionLabel?: string;
  diplomaName?: string;
};

type SeedTestRequirement = {
  test: TestType;
  minimumScore?: number;
  recommendedScore?: number;
  weightPercent?: number;
  validityMonths?: number;
  sections?: string[];
  notes?: string;
  registrationUrl?: string;
};

type SeedProgram = {
  name: string;
  slug: string;
  type: ProgramType;
  domain: string;
  description: string;
  objectives?: string;
  outcomes?: string[];
  durationMonths?: number;
  ects?: number;
  format: ProgramFormat;
  campuses?: string[];
  languages?: string[];
  startPeriods?: string[];
  tuitionCents?: number;
  applicationFeeCents?: number;
  currency?: string;
  financing?: string;
  admissionPrerequisites?: string[];
  admissionTests?: string[];
  admissionDocuments?: string[];
  admissionProcess?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  deadlines?: SeedDeadline[];
  courses?: { title: string; category?: string; description?: string }[];
  careers?: { title: string; description?: string }[];
};

type SeedSchool = {
  name: string;
  description?: string;
  website?: string;
  city?: string;
  country?: string;
  campuses?: string[];
  contactEmail?: string;
  contactPhone?: string;
  tuitionCents?: number;
  programs?: SeedProgram[];
};

type SeedContest = {
  name: string;
  year: number;
  url?: string;
  description?: string;
  examFormat?: string;
  feesCents?: number;
  currency?: string;
  registrationUrl?: string;
  languages?: string[];
  examLocations?: string[];
  durationMinutes?: number;
  scoreScale?: string;
  maxAttempts?: number;
  tests?: SeedTestRequirement[];
  contestDeadlines?: SeedDeadline[];
  schools: SeedSchool[];
};

async function main() {
  const contests: SeedContest[] = [
    {
      name: 'Masters Sélectifs 2026',
      year: 2026,
      url: 'https://masters2026.example.com',
      description: 'Sélection multi-écoles sur dossier, tests et oraux.',
      examFormat: 'Dossier + test + oral',
      feesCents: 0,
      currency: 'EUR',
      registrationUrl: 'https://masters2026.example.com/register',
      languages: ['French', 'English'],
      examLocations: ['Paris', 'Lyon', 'Bordeaux'],
      durationMinutes: 180,
      scoreScale: 'Tests pondérés 60% écrit / 40% oral',
      maxAttempts: 3,
      tests: [
        {
          test: TestType.gmat,
          minimumScore: 600,
          recommendedScore: 680,
          weightPercent: 40,
          validityMonths: 60,
          sections: ['Quant', 'Verbal'],
          notes: 'Score équilibré, IR non requis',
        },
        {
          test: TestType.tage_mage,
          minimumScore: 300,
          recommendedScore: 350,
          weightPercent: 35,
          validityMonths: 24,
          sections: ['Compréhension', 'Logique', 'Calcul'],
        },
        {
          test: TestType.toefl,
          minimumScore: 95,
          recommendedScore: 100,
          weightPercent: 15,
          validityMonths: 24,
          sections: ['Reading', 'Listening', 'Speaking', 'Writing'],
          notes: 'Exemption possible pour parcours anglophone',
        },
        {
          test: TestType.toeic,
          minimumScore: 900,
          recommendedScore: 940,
          weightPercent: 10,
          validityMonths: 24,
          sections: ['Listening', 'Reading'],
          notes: 'Accepté si pas de TOEFL/IELTS',
        },
      ],
      contestDeadlines: [],
      schools: [
        {
          name: 'ESCP Business School',
          description: 'École européenne multi-campus, focus international et innovation.',
          website: 'https://escp.eu',
          city: 'Paris',
          country: 'France',
          campuses: ['Paris', 'Berlin'],
          contactEmail: 'msc.businessanalytics@escp.eu',
          contactPhone: '+33 (0)1 49 23 22 83',
          tuitionCents: 0,
          programs: [
            {
              name: 'MSc in Business Analytics & AI',
              slug: 'escp-msc-business-analytics-ai',
              type: ProgramType.msc,
              domain: 'Business Analytics & AI',
              description:
                'Formation pour devenir expert en Business Analytics et IA, avec compétences techniques et business.',
              objectives:
                'Comprendre la valeur de la donnée, maîtriser analytics/IA, piloter la transformation en entreprise.',
              outcomes: ['Data Analyst', 'AI Product Manager', 'Analytics Consultant', 'Data Strategist'],
              durationMonths: 15,
              ects: 90,
              format: ProgramFormat.full_time,
              campuses: ['Paris', 'Berlin'],
              languages: ['English'],
              startPeriods: ['September 2026'],
              tuitionCents: 2730000,
              applicationFeeCents: 13000,
              currency: 'EUR',
              financing:
                'Bourses ESCP (10-50%), CROUS pour éligibles, prêts étudiants, jobs campus, stages 4+ mois.',
              admissionPrerequisites: ['Bachelor (180 ECTS minimum)', 'Bases en stats/programmation recommandées'],
              admissionTests: ['GMAT/GRE/TAGE-MAGE (recommandé)', 'English test (TOEFL/IELTS)'],
              admissionDocuments: ['CV', 'Transcripts', 'Motivation letter', 'ID photo', '2 references (recommandé)'],
              admissionProcess:
                'Candidature en ligne, comité d’admissibilité, entretien avec direction académique et professionnels.',
              contactEmail: 'msc.businessanalytics@escp.eu',
              contactPhone: '+33 (0)1 49 23 22 83',
              website:
                'https://escp.eu/programmes/specialised-masters-MSc/MSc-in-Business-Analytics-in-AI',
              deadlines: [
                {
                  title: 'Online application - Round 1',
                  type: DeadlineType.registration,
                  dueAt: '2026-01-07T23:59:00Z',
                  sessionLabel: 'R1 2026',
                },
                {
                  title: 'Online application - Round 2',
                  type: DeadlineType.registration,
                  dueAt: '2026-03-25T23:59:00Z',
                  sessionLabel: 'R2 2026',
                },
                {
                  title: 'Online application - Round 3',
                  type: DeadlineType.registration,
                  dueAt: '2026-06-03T23:59:00Z',
                  sessionLabel: 'R3 2026',
                },
              ],
              courses: [
                { title: 'Data Analytics', category: 'Core', description: 'Statistics, SQL, Python for data' },
                {
                  title: 'Machine Learning for Business',
                  category: 'Core',
                  description: 'Supervised/unsupervised learning, model evaluation, deployment basics',
                },
                { title: 'Data Engineering & Cloud', category: 'Core', description: 'Pipelines, ETL, cloud tooling' },
                { title: 'AI Ethics & Governance', category: 'Elective', description: 'Responsible AI, bias, compliance' },
              ],
              careers: [
                { title: 'Data/Business Analyst', description: 'Analyse données, dashboards, insights' },
                { title: 'AI Product Manager', description: 'Piloter roadmap produit IA et stakeholders' },
                { title: 'Analytics Consultant', description: 'Projets data/IA pour clients internes/externes' },
              ],
            },
          ],
        },
        {
          name: 'HEC Paris',
          description: 'Business school internationale, forte en stratégie et finance.',
          website: 'https://www.hec.edu/',
          city: 'Jouy-en-Josas',
          country: 'France',
          campuses: ['Jouy-en-Josas'],
          contactEmail: 'admissions@hec.edu',
          contactPhone: '+33 (0)1 39 67 70 00',
          tuitionCents: 4550000,
          programs: [
            {
              name: 'Master in Management (MiM)',
              slug: 'hec-mim',
              type: ProgramType.master,
              domain: 'Management',
              description: 'Programme Grande École avec tracks apprentissage/Double diplôme.',
              objectives: 'Former des leaders responsables et internationaux.',
              outcomes: ['Consultant Strategy', 'Investment Banking Analyst', 'Product Manager'],
              durationMonths: 24,
              ects: 120,
              format: ProgramFormat.full_time,
              campuses: ['Jouy-en-Josas'],
              languages: ['English', 'French'],
              startPeriods: ['September 2026'],
              tuitionCents: 4550000,
              applicationFeeCents: 12000,
              currency: 'EUR',
              financing: 'Bourses HEC, prêts étudiants, apprentissage (rémunéré).',
              admissionPrerequisites: ['Bachelor', '180-240 ECTS'],
              admissionTests: ['TAGE-MAGE ou GMAT ou GRE', 'TOEFL/IELTS'],
              admissionDocuments: ['CV', 'Transcripts', '2 letters', 'Motivation'],
              admissionProcess: 'Dossier, admissibilité, oraux en panel.',
              contactEmail: 'admissions@hec.edu',
              website: 'https://www.hec.edu/en/master-programs/master-management',
              deadlines: [
                { title: 'MiM - Round 1', type: DeadlineType.registration, dueAt: '2025-10-10T23:59:00Z', sessionLabel: 'MiM R1 2026' },
                { title: 'MiM - Round 2', type: DeadlineType.registration, dueAt: '2026-01-05T23:59:00Z', sessionLabel: 'MiM R2 2026' },
                { title: 'MiM - Round 3', type: DeadlineType.registration, dueAt: '2026-03-20T23:59:00Z', sessionLabel: 'MiM R3 2026' },
              ],
              courses: [
                { title: 'Strategy', category: 'Core', description: 'Competitive advantage, cases' },
                { title: 'Corporate Finance', category: 'Core', description: 'Valuation, M&A' },
                { title: 'Operations', category: 'Core', description: 'Supply chain, lean' },
              ],
              careers: [
                { title: 'Consultant', description: 'Strategy/Management consulting' },
                { title: 'IB Analyst', description: 'M&A, ECM, DCM' },
              ],
            },
            {
              name: 'MBA',
              slug: 'hec-mba',
              type: ProgramType.mba,
              domain: 'MBA',
              description: 'MBA 16 mois, leadership et transformation.',
              objectives: 'Accélérer carrière internationale.',
              outcomes: ['Consultant senior', 'Product Lead', 'Strategy Manager'],
              durationMonths: 16,
              format: ProgramFormat.full_time,
              campuses: ['Jouy-en-Josas'],
              languages: ['English'],
              startPeriods: ['January 2026', 'September 2026'],
              tuitionCents: 8200000,
              applicationFeeCents: 20000,
              currency: 'EUR',
              financing: 'Bourses HEC, prêts partenaires, sponsoring entreprises.',
              admissionPrerequisites: ['Bachelor', '3+ years experience'],
              admissionTests: ['GMAT ou GRE', 'TOEFL/IELTS'],
              admissionDocuments: ['CV', 'Transcripts', 'Essays', 'Recommendations'],
              admissionProcess: 'Dossier, entretiens alumni/faculty.',
              contactEmail: 'admissionsmba@hec.edu',
              website: 'https://www.hec.edu/en/mba-programs/full-time-mba',
              deadlines: [
                { title: 'MBA - Round 1', type: DeadlineType.registration, dueAt: '2025-09-15T23:59:00Z', sessionLabel: 'MBA R1 2026' },
                { title: 'MBA - Round 2', type: DeadlineType.registration, dueAt: '2025-11-15T23:59:00Z', sessionLabel: 'MBA R2 2026' },
                { title: 'MBA - Round 3', type: DeadlineType.registration, dueAt: '2026-01-15T23:59:00Z', sessionLabel: 'MBA R3 2026' },
              ],
              courses: [
                { title: 'Leadership & Change', category: 'Core' },
                { title: 'Digital Transformation', category: 'Elective' },
                { title: 'Finance Lab', category: 'Elective' },
              ],
              careers: [
                { title: 'Senior Consultant', description: 'Tier1/Tier2 firms' },
                { title: 'Product Lead', description: 'Tech/scale-up' },
              ],
            },
          ],
        },
        {
          name: 'ESSEC Business School',
          description: 'Programme data, finance et management, campus Cergy/Singapour.',
          website: 'https://www.essec.edu/',
          city: 'Cergy',
          country: 'France',
          campuses: ['Cergy', 'Singapour'],
          contactEmail: 'admissions@essec.edu',
          tuitionCents: 0,
          programs: [
            {
              name: 'MSc in Data Sciences & Business Analytics',
              slug: 'essec-centrale-data-analytics',
              type: ProgramType.msc,
              domain: 'Data & Analytics',
              description: 'Double diplôme ESSEC-CentraleSupélec orienté data science et business.',
              objectives: 'Former des data scientists business-ready.',
              outcomes: ['Data Scientist', 'Analytics Consultant', 'ML Engineer'],
              durationMonths: 15,
              format: ProgramFormat.full_time,
              campuses: ['Cergy', 'Saclay'],
              languages: ['English'],
              startPeriods: ['September 2026'],
              tuitionCents: 2500000,
              applicationFeeCents: 11000,
              currency: 'EUR',
              financing: 'Bourses ESSEC, prêts étudiants, apprentissage possible.',
              admissionPrerequisites: ['Bachelor/Engineering', 'Math/Stats background'],
              admissionTests: ['GMAT/GRE/TAGE-MAGE', 'TOEFL/IELTS'],
              admissionDocuments: ['CV', 'Transcripts', 'Essays', 'Recommendations'],
              admissionProcess: 'Dossier + éventuel entretien.',
              contactEmail: 'admissions@essec.edu',
              website: 'https://www.essec.edu/en/program/mscs/data-sciences-business-analytics/',
              deadlines: [
                { title: 'DSBA - Round 1', type: DeadlineType.registration, dueAt: '2025-11-05T23:59:00Z', sessionLabel: 'DSBA R1 2026' },
                { title: 'DSBA - Round 2', type: DeadlineType.registration, dueAt: '2026-01-20T23:59:00Z', sessionLabel: 'DSBA R2 2026' },
                { title: 'DSBA - Round 3', type: DeadlineType.registration, dueAt: '2026-03-25T23:59:00Z', sessionLabel: 'DSBA R3 2026' },
              ],
              courses: [
                { title: 'Machine Learning', category: 'Core' },
                { title: 'Big Data Engineering', category: 'Core' },
                { title: 'Business Analytics Strategy', category: 'Elective' },
              ],
              careers: [
                { title: 'Data Scientist', description: 'Modélisation & déploiement' },
                { title: 'ML Engineer', description: 'Pipelines, prod' },
              ],
            },
          ],
        },
        {
          name: 'EDHEC Business School',
          description: 'École tournée finance, data et sustainability.',
          website: 'https://www.edhec.edu/',
          city: 'Lille',
          country: 'France',
          campuses: ['Lille', 'Nice', 'Paris'],
          contactEmail: 'admissions@edhec.edu',
          tuitionCents: 0,
          programs: [
            {
              name: 'MSc in Data & AI for Business',
              slug: 'edhec-msc-data-ai',
              type: ProgramType.msc,
              domain: 'Data & AI',
              description: 'Programme data/IA appliquée au business, Nice campus.',
              objectives: 'Former des professionnels data pour les organisations.',
              outcomes: ['Data Analyst', 'Data Product Owner'],
              durationMonths: 15,
              format: ProgramFormat.full_time,
              campuses: ['Nice'],
              languages: ['English'],
              startPeriods: ['September 2026'],
              tuitionCents: 2350000,
              applicationFeeCents: 10000,
              currency: 'EUR',
              financing: 'Bourses EDHEC, prêts, jobs campus.',
              admissionPrerequisites: ['Bachelor', 'Quant background recommandé'],
              admissionTests: ['GMAT/GRE/TAGE-MAGE', 'TOEFL/IELTS'],
              admissionDocuments: ['CV', 'Transcripts', 'Motivation', '1-2 refs'],
              admissionProcess: 'Dossier + entretien.',
              contactEmail: 'admissions@edhec.edu',
              website: 'https://www.edhec.edu/en/programmes/msc-data-analytics-artificial-intelligence',
              deadlines: [
                { title: 'Data&AI - Round 1', type: DeadlineType.registration, dueAt: '2025-12-15T23:59:00Z', sessionLabel: 'EDHEC R1 2026' },
                { title: 'Data&AI - Round 2', type: DeadlineType.registration, dueAt: '2026-02-15T23:59:00Z', sessionLabel: 'EDHEC R2 2026' },
              ],
              courses: [
                { title: 'Data Visualization', category: 'Core' },
                { title: 'Deep Learning', category: 'Elective' },
              ],
              careers: [
                { title: 'Data Analyst', description: 'Dashboards, insights' },
                { title: 'PO Data/AI', description: 'Piloter use cases' },
              ],
            },
            {
              name: 'MSc in Climate Finance & Data',
              slug: 'edhec-msc-climate-finance-data',
              type: ProgramType.msc,
              domain: 'Sustainable Finance',
              description: 'Finance durable avec forte composante data.',
              objectives: 'Financer la transition grâce aux données ESG.',
              outcomes: ['ESG Analyst', 'Sustainable Finance Consultant'],
              durationMonths: 15,
              format: ProgramFormat.full_time,
              campuses: ['Lille'],
              languages: ['English'],
              startPeriods: ['September 2026'],
              tuitionCents: 2350000,
              applicationFeeCents: 10000,
              currency: 'EUR',
              financing: 'Bourses EDHEC, prêts étudiants.',
              admissionPrerequisites: ['Bachelor Finance/Business'],
              admissionTests: ['GMAT/GRE/TAGE-MAGE', 'TOEFL/IELTS'],
              admissionDocuments: ['CV', 'Transcripts', 'Motivation'],
              admissionProcess: 'Dossier + entretien.',
              deadlines: [
                { title: 'Climate Finance - Round 1', type: DeadlineType.registration, dueAt: '2025-12-10T23:59:00Z', sessionLabel: 'EDHEC CF R1 2026' },
                { title: 'Climate Finance - Round 2', type: DeadlineType.registration, dueAt: '2026-02-10T23:59:00Z', sessionLabel: 'EDHEC CF R2 2026' },
              ],
              courses: [
                { title: 'ESG Data Analytics', category: 'Core' },
                { title: 'Climate Risk Modeling', category: 'Elective' },
              ],
              careers: [{ title: 'ESG Analyst', description: 'Analyse extra-financière' }],
            },
          ],
        },
      ],
    },
    {
      name: 'GRE General 2026',
      year: 2026,
      url: 'https://www.ets.org/gre',
      description: 'Test standardisé GRE',
      examFormat: 'Test adaptatif en ligne',
      feesCents: 22000,
      currency: 'EUR',
      registrationUrl: 'https://www.ets.org/gre/register',
      languages: ['English'],
      examLocations: ['Online', 'Prometric centers'],
      durationMinutes: 115,
      scoreScale: '170 Quant / 170 Verbal / 6 AW',
      maxAttempts: 5,
      tests: [
        {
          test: TestType.gre,
          minimumScore: 300,
          recommendedScore: 320,
          validityMonths: 60,
          sections: ['Quantitative', 'Verbal', 'Analytical Writing'],
          registrationUrl: 'https://www.ets.org/gre/register',
        },
      ],
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
      description: 'Test d’anglais TOEFL iBT',
      examFormat: 'Test en ligne surveillé',
      feesCents: 24500,
      currency: 'EUR',
      registrationUrl: 'https://www.ets.org/toefl/register',
      languages: ['English'],
      examLocations: ['Online', 'Test centers'],
      durationMinutes: 115,
      scoreScale: '120 total',
      maxAttempts: 5,
      tests: [
        {
          test: TestType.toefl,
          minimumScore: 90,
          recommendedScore: 100,
          validityMonths: 24,
          sections: ['Reading', 'Listening', 'Speaking', 'Writing'],
          registrationUrl: 'https://www.ets.org/toefl/register',
        },
      ],
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
      description: 'Test IELTS Academic',
      examFormat: 'Paper ou computer-based',
      feesCents: 23000,
      currency: 'EUR',
      registrationUrl: 'https://ieltsregistration.org/',
      languages: ['English'],
      examLocations: ['Paris', 'Lyon', 'Online (UKVI)'],
      durationMinutes: 165,
      scoreScale: '9.0 bands',
      maxAttempts: 6,
      tests: [
        {
          test: TestType.ielts,
          minimumScore: 6.5,
          recommendedScore: 7.0,
          weightPercent: 100,
          validityMonths: 24,
          sections: ['Listening', 'Reading', 'Writing', 'Speaking'],
          registrationUrl: 'https://ieltsregistration.org/',
        },
      ],
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
      description: 'Test TOEIC Listening & Reading',
      examFormat: 'Test papier',
      feesCents: 14000,
      currency: 'EUR',
      registrationUrl: 'https://www.ets.org/toeic/test-takers',
      languages: ['English'],
      examLocations: ['France'],
      durationMinutes: 120,
      scoreScale: '990 total',
      maxAttempts: 6,
      tests: [
        {
          test: TestType.toeic,
          minimumScore: 850,
          recommendedScore: 900,
          weightPercent: 100,
          validityMonths: 24,
          sections: ['Listening', 'Reading'],
          registrationUrl: 'https://www.ets.org/toeic/test-takers',
        },
      ],
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
      description: 'Test d’aptitude TAGE MAGE',
      examFormat: 'Test papier',
      feesCents: 6590,
      currency: 'EUR',
      registrationUrl: 'https://www.tagemage.fr/inscription',
      languages: ['French'],
      examLocations: ['Paris', 'Lille', 'Lyon', 'Bordeaux'],
      durationMinutes: 150,
      scoreScale: '600 points',
      maxAttempts: 2,
      tests: [
        {
          test: TestType.tage_mage,
          minimumScore: 300,
          recommendedScore: 360,
          weightPercent: 100,
          validityMonths: 24,
          sections: ['Compréhension', 'Calcul', 'Logique', 'Expression'],
          registrationUrl: 'https://www.tagemage.fr/inscription',
        },
      ],
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
  await prisma.programCourse.deleteMany();
  await prisma.programCareer.deleteMany();
  await prisma.leaderboardEntry.deleteMany();
  await prisma.leaderboard.deleteMany();
  await prisma.program.deleteMany();
  await prisma.school.deleteMany();
  await prisma.contest.deleteMany();

  const programBySlug: Record<string, string> = {};
  const schoolByName: Record<string, string> = {};
  const contestByNameYear: Record<string, string> = {};

  for (const contest of contests) {
    const createdContest = await prisma.contest.create({
      data: {
        name: contest.name,
        year: contest.year,
        url: contest.url,
        description: contest.description,
        examFormat: contest.examFormat,
        feesCents: contest.feesCents,
        currency: contest.currency,
        registrationUrl: contest.registrationUrl,
        languages: contest.languages ?? [],
        examLocations: contest.examLocations ?? [],
        durationMinutes: contest.durationMinutes,
        scoreScale: contest.scoreScale,
        maxAttempts: contest.maxAttempts,
      },
    });
    contestByNameYear[`${contest.name}-${contest.year}`] = createdContest.id;

    if (contest.contestDeadlines?.length) {
      await prisma.deadline.createMany({
        data: contest.contestDeadlines.map((dl) => ({
          title: dl.title,
          type: dl.type,
          dueAt: dl.dueAt,
          contestId: createdContest.id,
          schoolId: null,
          programId: null,
          createdByAdmin: true,
          diplomaName: dl.diplomaName,
          sessionLabel: dl.sessionLabel,
        })),
        skipDuplicates: true,
      });
    }

    if (contest.tests?.length) {
      await prisma.contestTestRequirement.createMany({
        data: contest.tests.map((test) => ({
          test: test.test,
          minimumScore: test.minimumScore,
          recommendedScore: test.recommendedScore,
          weightPercent: test.weightPercent,
          validityMonths: test.validityMonths,
          sections: test.sections ?? [],
          notes: test.notes,
          registrationUrl: test.registrationUrl,
          contestId: createdContest.id,
        })),
      });
    }

    for (const school of contest.schools) {
      const createdSchool = await prisma.school.create({
        data: {
          name: school.name,
          contestId: createdContest.id,
          description: school.description,
          website: school.website,
          city: school.city,
          country: school.country,
          campuses: school.campuses ?? [],
          contactEmail: school.contactEmail,
          contactPhone: school.contactPhone,
          tuitionCents: school.tuitionCents,
          currency: contest.currency ?? 'EUR',
        },
      });
      schoolByName[school.name] = createdSchool.id;

      if (school.programs?.length) {
        for (const program of school.programs) {
          const createdProgram = await prisma.program.create({
            data: {
              slug: program.slug,
              name: program.name,
              type: program.type,
              domain: program.domain,
              description: program.description,
              objectives: program.objectives,
              outcomes: program.outcomes ?? [],
              durationMonths: program.durationMonths,
              ects: program.ects,
              format: program.format,
              campuses: program.campuses ?? [],
              languages: program.languages ?? [],
              startPeriods: program.startPeriods ?? [],
              tuitionCents: program.tuitionCents,
              applicationFeeCents: program.applicationFeeCents,
              currency: program.currency ?? contest.currency ?? 'EUR',
              financing: program.financing,
              admissionPrerequisites: program.admissionPrerequisites ?? [],
              admissionTests: program.admissionTests ?? [],
              admissionDocuments: program.admissionDocuments ?? [],
              admissionProcess: program.admissionProcess,
              contactEmail: program.contactEmail,
              contactPhone: program.contactPhone,
              website: program.website,
              schoolId: createdSchool.id,
              contestId: createdContest.id,
            },
          });
          programBySlug[program.slug] = createdProgram.id;

          if (program.courses?.length) {
            await prisma.programCourse.createMany({
              data: program.courses.map((course) => ({
                title: course.title,
                category: course.category,
                description: course.description,
                programId: createdProgram.id,
              })),
            });
          }

          if (program.careers?.length) {
            await prisma.programCareer.createMany({
              data: program.careers.map((career) => ({
                title: career.title,
                description: career.description,
                programId: createdProgram.id,
              })),
            });
          }

          if (program.deadlines?.length) {
            await prisma.deadline.createMany({
              data: program.deadlines.map((dl) => ({
                title: dl.title,
                type: dl.type,
                dueAt: dl.dueAt,
                contestId: createdContest.id,
                schoolId: createdSchool.id,
                programId: createdProgram.id,
                createdByAdmin: true,
                diplomaName: program.name,
                sessionLabel: dl.sessionLabel,
              })),
            });
          }
        }
      }
    }
  }

  // Leaderboards (ex: FT European Business Schools 2025)
  const leaderboards = [
    {
      slug: 'ft-european-business-schools-2025',
      name: 'FT European Business Schools',
      source: 'Financial Times',
      category: 'European Business Schools',
      region: 'Europe',
      year: 2025,
      url: 'https://rankings.ft.com/business-education/regional-rankings',
      description: 'Classement FT des business schools européennes 2025',
      entries: [
        { rank: 2, schoolName: 'HEC Paris' },
        { rank: 4, schoolName: 'ESCP Business School' },
        { rank: 8, schoolName: 'ESSEC Business School' },
        { rank: 10, schoolName: 'EDHEC Business School' },
      ],
    },
  ];

  for (const lb of leaderboards) {
    const createdLb = await prisma.leaderboard.create({
      data: {
        slug: lb.slug,
        name: lb.name,
        source: lb.source,
        category: lb.category,
        region: lb.region,
        year: lb.year,
        url: lb.url,
        description: lb.description,
      },
    });

    const entriesData = lb.entries
      .map((entry) => {
        const schoolId = entry.schoolName ? schoolByName[entry.schoolName] : undefined;
        if (!schoolId) return null;
        return {
          rank: entry.rank,
          score: entry.score,
          notes: entry.notes,
          schoolId,
          programId: entry.programSlug ? programBySlug[entry.programSlug] : undefined,
          leaderboardId: createdLb.id,
        };
      })
      .filter((e): e is NonNullable<typeof e> => Boolean(e));

    if (entriesData.length) {
      await prisma.leaderboardEntry.createMany({ data: entriesData });
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

  const escpProgramId = programBySlug['escp-msc-business-analytics-ai'];
  const escpContestId = contestByNameYear['Masters Sélectifs 2026-2026'];
  const escpSchoolId = schoolByName['ESCP Business School'];

  if (escpProgramId && escpContestId && escpSchoolId) {
    const candidature =
      (await prisma.candidature.findFirst({
        where: { userId: demoUser.id, programId: escpProgramId },
      })) ||
      (await prisma.candidature.create({
        data: {
          userId: demoUser.id,
          contestId: escpContestId,
          schoolId: escpSchoolId,
          programId: escpProgramId,
          type: CandidatureType.diplome,
          diplomaName: 'MSc in Business Analytics & AI',
          status: 'draft',
          sessionLabel: 'R1 2026',
        },
      }));

    const programDeadlines = await prisma.deadline.findMany({
      where: { programId: escpProgramId },
    });

    for (const dl of programDeadlines) {
      await prisma.task.upsert({
        where: { id: `${candidature.id}-${dl.id}` },
        update: {},
        create: {
          id: `${candidature.id}-${dl.id}`,
          title: dl.title,
          status: TaskStatus.todo,
          candidatureId: candidature.id,
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

