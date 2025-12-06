## DossierTracker — Modèle métier

### Acteurs et rôles
- **Etudiant** : propriétaire des candidatures, configure écoles/concours, tâches et rappels.
- **Parent/Mentor (lecture)** : accès en lecture seule aux candidatures et progrès; invite par l’étudiant.
- **Admin établissement** : gère licences campus, accès lecture aux élèves de son établissement.
- **Super admin** : gère catalogue concours/écoles et échéances officielles.

### Ressources principales
- **Concours** : ex. HEC AST, ESSEC, Passerelle. Attributs : année, cycles, liens officiels, format d’examen, frais.
- **École** : rattachée à un concours; peut exposer des étapes spécifiques (écrits, oraux), localisation, campus, contacts, frais indicatifs.
- **Programme (diplôme)** : rattaché à une école (+ concours pour contexte). Attributs riches : type (MSc, MBA...), domaine, description, objectifs, outcomes, durée, ECTS, formats (full/part/online/hybride), langues, campus, périodes de rentrée, frais/monnaie, frais de dossier, financement, prérequis, tests, documents, process d’admission, contacts, site, cours/modules, débouchés, deadlines. Les classements se font via les leaderboards.
- **Classement (Leaderboard)** : entité décrivant une source (FT, QS…), année, catégorie/région, URL, description, avec des entrées (`LeaderboardEntry`) qui portent rang/score et référence vers une école ou un programme.
- **Échéance** : date/heure, type (inscription, test, oral, résultat), visibilité (publique/admin), canaux de rappel par défaut, rattachement possible à programme/école/concours.
- **Candidature** : sélection d’une école/concours par un étudiant; référence les échéances importées; peut cibler un programme précis.
- **Tâche/Checklist** : élément Kanban (todo/doing/done) rattaché à une candidature et éventuellement à une échéance.
- **Rappel** : notification planifiée (email/SMS/push) à J-30/J-7/J-1 ou custom.
- **Document** : métadonnées sur pièces à fournir, état (manquant/en attente/validé), stockage externe non implémenté.
- **Licence établissement** : rattache des étudiants à un établissement et permet vue agrégée.

### Règles clés
- Validation stricte des entrées (zod côté API et client).
- Multi-tenancy logique par établissement; isoler les données hors établissement.
- Partage lecture seule : parent/mentor ne modifie rien.
- Rappels : planifiés via worker; canaux SMS/push sous feature flag si pas de clés.
- Conformité RGPD : suppression de compte supprime candidatures et notifications liées.

### Flux principaux
1. **Onboarding étudiant** : création compte → sélection concours/écoles → import des échéances → génération checklist.
2. **Suivi** : tableau de bord progression, risque (tâches en retard), vue calendrier.
3. **Rappels** : worker programme notifications sur chaque échéance; recalcul si date modifiée.
4. **Partage** : invitation parent/mentor via email lien magique (token usage unique).
5. **Établissement** : admin campus consulte agrégats (pas implémenté en détail ici).


