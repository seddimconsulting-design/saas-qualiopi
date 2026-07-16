/* Référentiel des questionnaires de satisfaction (à chaud / à froid).
   Partagé entre le portail stagiaire et la validation côté serveur. */
export const SURVEYS = {
  chaud: {
    kind: 'chaud',
    title: 'Évaluation à chaud',
    subtitle: "À l'issue de la formation",
    questions: [
      { id: 'contenu',      label: 'Le contenu de la formation répondait à vos attentes' },
      { id: 'animation',    label: "Qualité de l'animation et du formateur" },
      { id: 'organisation', label: 'Organisation et conditions matérielles' },
      { id: 'objectifs',    label: 'Atteinte des objectifs pédagogiques' },
      { id: 'reco',         label: 'Vous recommanderiez cette formation' },
    ],
  },
  froid: {
    kind: 'froid',
    title: 'Évaluation à froid (J+90)',
    subtitle: 'Quelques semaines après la formation',
    questions: [
      { id: 'pratique',   label: 'Vous avez pu mettre en pratique les acquis' },
      { id: 'impact',     label: 'Impact positif sur votre activité professionnelle' },
      { id: 'competences', label: 'Montée en compétences durable' },
      { id: 'objectifs',  label: 'Les objectifs restent atteints dans la durée' },
      { id: 'reco',       label: 'Vous recommanderiez toujours cette formation' },
    ],
  },
};

export const SURVEY_KINDS = Object.keys(SURVEYS);

/* Valide des réponses et calcule la moyenne (1-5). Renvoie { ok, overall, clean } */
export function scoreSurvey(kind, ratings) {
  const survey = SURVEYS[kind];
  if (!survey || !ratings || typeof ratings !== 'object') return { ok: false };
  const clean = {};
  let sum = 0;
  for (const q of survey.questions) {
    const v = Number(ratings[q.id]);
    if (!Number.isInteger(v) || v < 1 || v > 5) return { ok: false };
    clean[q.id] = v;
    sum += v;
  }
  return { ok: true, overall: sum / survey.questions.length, clean };
}
