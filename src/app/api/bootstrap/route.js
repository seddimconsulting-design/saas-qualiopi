import { NextResponse } from 'next/server';
import { listAll, listIndicatorStatus } from '@/lib/collections';
import { getSession } from '@/lib/auth';
import { q } from '@/lib/db';
import { sessionSlots } from '@/lib/slots';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/* Preuves réelles collectées via l'espace stagiaire : elles alimentent
   directement le calcul de conformité (et non de simples cases à cocher). */
async function buildProofs(tid) {
  const [att, pos, sat, enr, sess] = await Promise.all([
    q('SELECT session_id, count(*)::int AS signed FROM attendances WHERE tenant_id = $1 GROUP BY session_id', [tid]),
    q('SELECT count(*)::int AS n FROM positionings WHERE tenant_id = $1', [tid]),
    q('SELECT kind, count(*)::int AS n FROM satisfaction_responses WHERE tenant_id = $1 GROUP BY kind', [tid]),
    q('SELECT count(*)::int AS n FROM session_trainees WHERE tenant_id = $1', [tid]),
    q('SELECT id, start_date, end_date FROM app_sessions WHERE tenant_id = $1', [tid]),
  ]);
  const signedBySession = Object.fromEntries(att.map(r => [r.session_id, r.signed]));
  const attendance = sess.map(s => ({
    sessionId: s.id,
    signed: signedBySession[s.id] || 0,
    total: sessionSlots(s).length,
  }));
  const surveys = Object.fromEntries(sat.map(r => [r.kind, r.n]));
  return {
    attendance,
    positionings: pos[0]?.n || 0,
    enrollments: enr[0]?.n || 0,
    surveys: { chaud: surveys.chaud || 0, froid: surveys.froid || 0 },
  };
}

export async function GET(req) {
  const s = await getSession(req);
  if (!s) return NextResponse.json({ error: 'non authentifié' }, { status: 401 });
  const tid = s.tenantId;
  try {
    const [sessions, trainees, veilles, reclamations, pac, clients, devis, documents, manualStatus, tenant, proofs] = await Promise.all([
      listAll('sessions', tid), listAll('trainees', tid), listAll('veilles', tid), listAll('reclamations', tid),
      listAll('pac', tid), listAll('clients', tid), listAll('devis', tid), listAll('documents', tid), listIndicatorStatus(tid),
      q('SELECT certifiant, apprentissage, sous_traitance, afest FROM app_tenants WHERE id = $1', [tid]),
      buildProofs(tid),
    ]);
    const t = tenant[0] || {};
    const profil = { certifiant: !!t.certifiant, apprentissage: !!t.apprentissage, sousTraitance: !!t.sous_traitance, afest: !!t.afest };
    return NextResponse.json({ sessions, trainees, veilles, reclamations, pac, clients, devis, documents, manualStatus, profil, proofs });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
