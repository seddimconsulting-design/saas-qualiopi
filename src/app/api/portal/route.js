import { NextResponse } from 'next/server';
import { q } from '@/lib/db';
import { verifyTraineeToken } from '@/lib/portal';
import { sessionSlots } from '@/lib/slots';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/* Données de l'espace stagiaire (authentification par jeton). */
export async function GET(req) {
  const token = new URL(req.url).searchParams.get('token');
  const auth = await verifyTraineeToken(token);
  if (!auth) return NextResponse.json({ error: 'Lien invalide ou expiré.' }, { status: 401 });

  const tr = await q('SELECT first_name AS first, last_name AS last FROM app_trainees WHERE id = $1', [auth.traineeId]);
  const of = await q('SELECT name FROM app_tenants WHERE id = $1', [auth.tenantId]);
  const rows = await q(
    `SELECT s.id, s.title, s.start_date, s.end_date, s.trainer, s.duration, s.modality
       FROM session_trainees st
       JOIN app_sessions s ON s.id = st.session_id
      WHERE st.trainee_id = $1
      ORDER BY s.start_date DESC NULLS LAST`,
    [auth.traineeId]
  );
  // Signatures existantes du stagiaire, indexées par session + créneau.
  const att = await q('SELECT session_id, slot, signed_at FROM attendances WHERE trainee_id = $1', [auth.traineeId]);
  const signedMap = {};
  for (const a of att) signedMap[`${a.session_id}|${a.slot}`] = a.signed_at;

  const sessions = rows.map((s) => {
    const slots = sessionSlots(s).map((sl) => ({
      key: sl.key, label: sl.label,
      signed: signedMap[`${s.id}|${sl.key}`] != null,
      signed_at: signedMap[`${s.id}|${sl.key}`] || null,
    }));
    return { ...s, slots, signedCount: slots.filter((x) => x.signed).length, total: slots.length };
  });

  return NextResponse.json({
    trainee: tr[0] || null,
    ofName: of[0]?.name || 'Votre organisme de formation',
    sessions,
  });
}
