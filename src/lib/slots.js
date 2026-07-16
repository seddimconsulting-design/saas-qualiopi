/* Calcule les créneaux de demi-journée (matin / après-midi) d'une session,
   à partir de ses dates de début et de fin. Partagé entre le portail stagiaire
   et le côté organisme pour garantir la même liste de créneaux. */

function parseISO(s) {
  if (!s) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(s));
  return m ? Date.UTC(+m[1], +m[2] - 1, +m[3]) : null;
}

function frLabel(ms) {
  const d = new Date(ms);
  return `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}/${d.getUTCFullYear()}`;
}

/* Renvoie [{ key, date, period, label }] pour la session. */
export function sessionSlots(session) {
  const start = parseISO(session?.start_date);
  if (start == null) {
    // Dates inconnues : deux créneaux génériques pour permettre la signature.
    return [
      { key: 'seance#AM', date: '', period: 'Matin', label: 'Séance — Matin' },
      { key: 'seance#PM', date: '', period: 'Après-midi', label: 'Séance — Après-midi' },
    ];
  }
  let end = parseISO(session?.end_date);
  if (end == null || end < start) end = start;

  const slots = [];
  let t = start, guard = 0;
  while (t <= end && guard < 60) {
    const iso = new Date(t).toISOString().slice(0, 10);
    const dl = frLabel(t);
    slots.push({ key: `${iso}#AM`, date: dl, period: 'Matin', label: `${dl} — Matin` });
    slots.push({ key: `${iso}#PM`, date: dl, period: 'Après-midi', label: `${dl} — Après-midi` });
    t += 86400000;
    guard++;
  }
  return slots;
}

/* Ensemble des clés valides (pour valider une signature entrante). */
export function slotKeys(session) {
  return new Set(sessionSlots(session).map((s) => s.key));
}
