/* Positionnement amont (indicateur 8) : analyse du besoin + test de niveau (QCM).
   Partagé entre le portail stagiaire et la validation serveur. */

export const NEEDS_QUESTIONS = [
  { id: 'objectives',  type: 'text',   label: 'Vos objectifs et attentes pour cette formation', required: true },
  { id: 'level',       type: 'choice', label: 'Votre niveau actuel sur le sujet', options: ['Débutant', 'Intermédiaire', 'Avancé'], required: true },
  { id: 'experience',  type: 'text',   label: 'Votre expérience ou pratique actuelle sur le sujet' },
  { id: 'constraints', type: 'text',   label: 'Besoins spécifiques : accessibilité, contraintes, aménagements…' },
];

/* Valide les réponses à l'analyse du besoin. */
export function validateNeeds(answers) {
  if (!answers || typeof answers !== 'object') return false;
  for (const q of NEEDS_QUESTIONS) {
    if (!q.required) continue;
    const v = answers[q.id];
    if (q.type === 'choice') { if (!q.options.includes(v)) return false; }
    else if (!v || !String(v).trim()) return false;
  }
  return true;
}

/* Retire les bonnes réponses d'un QCM avant de l'envoyer au stagiaire. */
export function stripQuiz(quiz) {
  return (Array.isArray(quiz) ? quiz : []).map((item) => ({ q: item.q, options: item.options || [] }));
}

/* Note un QCM. quiz = [{ q, options, correct }] ; answers = [indexChoisi, …].
   Renvoie { total, correctCount, score(0-100) } ; total 0 si pas de QCM. */
export function scoreQuiz(quiz, answers) {
  const items = Array.isArray(quiz) ? quiz : [];
  const a = Array.isArray(answers) ? answers : [];
  let correctCount = 0;
  for (let i = 0; i < items.length; i++) {
    if (Number(a[i]) === Number(items[i].correct)) correctCount++;
  }
  const total = items.length;
  return { total, correctCount, score: total ? Math.round((correctCount / total) * 100) : 0 };
}
