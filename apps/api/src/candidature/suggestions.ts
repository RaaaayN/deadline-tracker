import { DeadlineType } from '@prisma/client';

type DeadlineLite = {
  type?: DeadlineType | null;
  title?: string | null;
};

const suggestionsByType: Record<DeadlineType, string> = {
  registration: 'Vérifie les pièces requises et fais relire ton dossier avant dépôt.',
  test: 'Réserve ton créneau et planifie 2 sessions blanches cette semaine.',
  oral: 'Prépare un pitch 3 minutes et un Q&A, enregistre-toi pour t’entraîner.',
  result: 'Anticipe les démarches suivantes (inscription définitive, logement).',
  other: 'Découpe la tâche en sous-étapes avec une date cible réaliste.',
};

export function getSuggestionForTask(title: string, deadline?: DeadlineLite | null): string {
  if (deadline?.type && suggestionsByType[deadline.type]) {
    return suggestionsByType[deadline.type];
  }

  const lower = title.toLowerCase();
  if (lower.includes('cv')) {
    return 'Utilise un modèle concis, limite à 1 page et mets en avant tes preuves.';
  }
  if (lower.includes('lettre') || lower.includes('motivation')) {
    return 'Structure en 3 parties (accroche, preuves, projection) et reste < 1 page.';
  }
  if (lower.includes('toefl') || lower.includes('ielts')) {
    return 'Planifie des mocks chronométrés et révise les templates de réponses.';
  }

  return 'Découpe la tâche en sous-étapes, assigne des dates et réserve des créneaux.';
}


