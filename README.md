# DossierTracker (monorepo)

Plateforme pour centraliser les échéances AST, gérer checklists et rappels multi-canal.

## Structure
- `apps/api` : API NestJS + Prisma (PostgreSQL).
- `apps/web` : Front Next.js (App Router) pour onboarding, dashboard et checklists.
- `apps/mobile` : App Expo React Native pour rappels rapides et lecture du dashboard.
- `packages/shared` : Types et schémas zod partagés.

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

## Sécurité & Rappels
- JWT avec `@nestjs/jwt`, rôles via `role` sur l’utilisateur.
- Validation stricte (class-validator + zod côté shared).
- Rappels SMS/push prévus via worker (BullMQ) à implémenter avec les clés fournisseurs.

## Points à développer ensuite
- Upload sécurisé des documents.
- Tableau de bord établissement (agrégats) et invitations parent/mentor par email.
- Worker de notifications (email/SMS/push) et iCal/GCal/Outlook sync.

