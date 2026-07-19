import { NextResponse } from 'next/server';
import { q } from '@/lib/db';
import { issueTraineeToken } from '@/lib/portal';
import { sendColdSurveyEmail } from '@/lib/mail';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/* Relance automatique "satisfaction à froid" pour les formations terminées
   il y a ~90 jours. Déclenchée par Vercel Cron (voir vercel.json).
   Sécurisée par CRON_SECRET si défini (Vercel l'envoie en Bearer). */
export async function GET(req) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'non autorisé' }, { status: 401 });
  }

  const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const rows = await q(
    `SELECT st.session_id, st.trainee_id, st.tenant_id,
            t.email, t.first_name AS first, t.last_name AS last, tn.name AS of_name
       FROM session_trainees st
       JOIN app_sessions s  ON s.id  = st.session_id
       JOIN app_trainees t  ON t.id  = st.trainee_id
       JOIN app_tenants  tn ON tn.id = st.tenant_id
      WHERE st.cold_invited_at IS NULL
        AND s.end_date IS NOT NULL AND s.end_date <> '' AND s.end_date <= $1
        AND t.email IS NOT NULL AND t.email <> ''
        AND NOT EXISTS (
          SELECT 1 FROM satisfaction_responses r
           WHERE r.session_id = st.session_id AND r.trainee_id = st.trainee_id AND r.kind = 'froid')
      LIMIT 200`,
    [cutoff]
  );

  const origin = new URL(req.url).origin;
  let sent = 0;
  for (const r of rows) {
    try {
      const token = await issueTraineeToken(r.trainee_id, r.tenant_id);
      const link = `${origin}/portail?token=${token}`;
      const res = await sendColdSurveyEmail(r.email, `${r.first || ''} ${r.last || ''}`.trim(), r.of_name, link);
      await q('UPDATE session_trainees SET cold_invited_at = now() WHERE session_id = $1 AND trainee_id = $2',
        [r.session_id, r.trainee_id]);
      if (res.sent) sent++;
    } catch { /* on continue avec les suivants */ }
  }

  return NextResponse.json({ ok: true, candidates: rows.length, sent });
}
