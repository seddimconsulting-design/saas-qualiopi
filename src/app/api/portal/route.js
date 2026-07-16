import { NextResponse } from 'next/server';
import { q } from '@/lib/db';
import { verifyTraineeToken } from '@/lib/portal';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/* Données de l'espace stagiaire (authentification par jeton). */
export async function GET(req) {
  const token = new URL(req.url).searchParams.get('token');
  const auth = await verifyTraineeToken(token);
  if (!auth) return NextResponse.json({ error: 'Lien invalide ou expiré.' }, { status: 401 });

  const tr = await q('SELECT first_name AS first, last_name AS last FROM app_trainees WHERE id = $1', [auth.traineeId]);
  const of = await q('SELECT name FROM app_tenants WHERE id = $1', [auth.tenantId]);
  const sessions = await q(
    `SELECT s.id, s.title, s.start_date, s.end_date, s.trainer, s.duration, s.modality,
            (a.signature IS NOT NULL) AS signed, a.signed_at
       FROM session_trainees st
       JOIN app_sessions s ON s.id = st.session_id
       LEFT JOIN attendances a ON a.session_id = st.session_id AND a.trainee_id = st.trainee_id
      WHERE st.trainee_id = $1
      ORDER BY s.start_date DESC NULLS LAST`,
    [auth.traineeId]
  );
  return NextResponse.json({
    trainee: tr[0] || null,
    ofName: of[0]?.name || 'Votre organisme de formation',
    sessions,
  });
}
