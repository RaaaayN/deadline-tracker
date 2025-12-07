# DossierTracker (monorepo)

Plateforme pour centraliser les échéances AST, gérer checklists et rappels multi-canal.

## Structure
- `apps/api` : API NestJS + Prisma (PostgreSQL).
- `apps/web` : Front Next.js (App Router) pour onboarding, dashboard et checklists.
- `apps/mobile` : App Expo React Native pour rappels rapides et lecture du dashboard.
- `packages/shared` : Types et schémas zod partagés.

## Fonctionnalités clés
- Checklist auto (concours/école) avec statuts Kanban (todo/doing/done) éditables dans le front.
- Suggestions d’aide statiques par type d’échéance/tâche envoyées avec la checklist.

## Prérequis
- Node.js 18+
- pnpm (`npm i -g pnpm`)
- PostgreSQL avec base `dossiertracker`

## Démarrage
1. Copier `env.sample` vers `.env` à la racine et ajuster `DATABASE_URL` / `JWT_SECRET`.
2. Installer les deps : `pnpm install`.
3. Prisma : `pnpm prisma migrate dev --schema apps/api/prisma/schema.prisma` puis `pnpm prisma db seed --schema apps/api/prisma/schema.prisma`.
4. Lancer l’API : `pnpm --filter @dossiertracker/api dev`.
5. Lancer le web : `pnpm --filter @dossiertracker/web dev` (var `NEXT_PUBLIC_API_URL` pour pointer vers l’API).
6. Mobile : `pnpm --filter @dossiertracker/mobile start` (mettre à jour `apps/mobile/app.json` si l’API n’est pas sur localhost).

## Tests & qualité
- Lint : `pnpm lint`
- Tests : `pnpm test`
- Format : `pnpm format`

## Classements (scraping + ingestion)
1. Installer les deps Python : `python3 -m pip install -r scripts/rankings_scraper/requirements.txt`.
2. Scraper un classement :  
   `PYTHONPATH=. python3 -m scripts.rankings_scraper.main --url <page> --type mim --year 2025 --source "Financial Times" --category "Master in Management" --output data/rankings/ft-mim-2025.json`  
   Le JSON produit contient `master_type`, `source`, `category`, `year`, `source_url`, `region?`, et `entries[]` (rank, school_name, program_name?, country?, city?, score?, notes?, link?).
3. Ingérer dans Prisma :  
   `pnpm --dir apps/api ts-node-dev --transpile-only src/scripts/ingest-rankings.ts --input data/rankings/ft-mim-2025.json`  
   Le script upsert le leaderboard, crée les écoles sans concours (contestId nul), ajoute les programmes si nommés, puis recrée les `LeaderboardEntry` de façon idempotente.

## Sécurité & Rappels
- JWT avec `@nestjs/jwt`, rôles via `role` sur l’utilisateur.
- Validation stricte (class-validator + zod côté shared).
- Rappels SMS/push prévus via worker (BullMQ) à implémenter avec les clés fournisseurs.
- Intégration Google pour emails (Gmail API) et Calendar : configure `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, `GOOGLE_SCOPES` (incluant `https://www.googleapis.com/auth/calendar`) dans `.env`.
- Rappels email J-30/J-7/J-1 générés automatiquement puis déclenchés par le scheduler `@nestjs/schedule` (toutes les minutes).

## Points à développer ensuite
- Upload sécurisé des documents.
- Tableau de bord établissement (agrégats) et invitations parent/mentor par email.
- Worker de notifications (email/SMS/push) et iCal/GCal/Outlook sync.

