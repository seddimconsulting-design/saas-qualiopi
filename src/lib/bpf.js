/* Bilan Pédagogique et Financier (BPF — Cerfa n° 10443).
   Obligation annuelle de tout organisme de formation (dépôt avant le 31 mai
   sur « Mon Activité Formation », pour l'année civile écoulée).
   Ce module agrège les données de l'application pour PRÉPARER la déclaration. */

/* Convertit une durée saisie librement en heures ("14h", "2 jours", "21"). */
export function durationToHours(txt) {
  if (!txt) return 0;
  const s = String(txt).toLowerCase().replace(',', '.');
  const jours = s.match(/([\d.]+)\s*(jours?|j\b)/);
  if (jours) return Math.round(parseFloat(jours[1]) * 7);
  const heures = s.match(/([\d.]+)\s*h/);
  if (heures) return Math.round(parseFloat(heures[1]));
  const nu = s.match(/([\d.]+)/);
  return nu ? Math.round(parseFloat(nu[1])) : 0;
}

/* Origine des fonds telle que classée dans le BPF, à partir du type de client. */
export function origineDesFonds(typeClient) {
  const t = (typeClient || '').toLowerCase();
  if (t.includes('opco') || t.includes('financeur')) return 'OPCO et financeurs';
  if (t.includes('entreprise')) return 'Entreprises (pour leurs salariés)';
  if (t.includes('particulier')) return 'Particuliers à leurs frais';
  if (t.includes('public') || t.includes('collectivité') || t.includes('collectivite')) return 'Pouvoirs publics';
  if (t.includes('prescripteur')) return 'Prescripteurs / partenaires';
  return 'Autres produits';
}

/* Agrège le bilan à partir des données brutes de l'organisme.
   sessions : [{ id, title, end, duration, price, status, trainer }]
   effectifs : { [sessionId]: nbStagiairesInscrits }
   devis : [{ client, amount, status, date }]  clients : [{ name, type }] */
export function computeBpf({ year, sessions, effectifs = {}, devis = [], clients = [] }) {
  const inYear = (d) => typeof d === 'string' && d.slice(0, 4) === String(year);

  const retenues = sessions.filter(s => s.status !== 'Annulé' && inYear(s.end || s.start));
  let stagiaires = 0, heuresStagiaires = 0, produits = 0;
  const detail = retenues.map(s => {
    const nb = effectifs[s.id] != null ? effectifs[s.id] : (s.trainees || 0);
    const h = durationToHours(s.duration);
    stagiaires += nb;
    heuresStagiaires += h * nb;
    produits += Number(s.price || 0);
    return { id: s.id, title: s.title, end: s.end, heures: h, stagiaires: nb, heuresStagiaires: h * nb, produit: Number(s.price || 0) };
  });

  // Répartition des produits par origine des fonds (devis acceptés de l'année)
  const typeByClient = Object.fromEntries(clients.map(c => [c.name, c.type]));
  const parOrigine = {};
  for (const d of devis) {
    if (d.status !== 'Accepté' || !inYear(d.date)) continue;
    const k = origineDesFonds(typeByClient[d.client]);
    parOrigine[k] = (parOrigine[k] || 0) + Number(d.amount || 0);
  }

  const formateurs = [...new Set(retenues.map(s => (s.trainer || '').trim()).filter(Boolean))];

  return {
    year,
    sessions: retenues.length,
    stagiaires,
    heuresStagiaires,
    heuresMoyennes: stagiaires ? Math.round(heuresStagiaires / stagiaires) : 0,
    produits,
    parOrigine,
    formateurs,
    detail,
  };
}
