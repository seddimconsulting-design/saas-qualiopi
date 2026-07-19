import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { q } from '@/lib/db';
import { issueTraineeToken } from '@/lib/portal';
import { sendConvocationEmail } from '@/lib/mail';
import { rateLimit, tooMany } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/* Envoie la convocation à tous les stagiaires inscrits à une session
   (avec leur lien d'accès personnel à l'espace stagiaire). */
export async function POST(req) {
  const rl = await rateLimit(req, { name: 'convoke', max: 20, windowSec: 3600 });
  if (!rl.ok) return tooMany(rl.retryAfter);

  const s = await getSession(req);
  if (!s) return NextResponse.json({ error: 'non authentifié' }, { status: 401 });

  const { sessionId } = await req.json();
  if (!sessionId) return NextResponse.json({ error: 'sessionId requis' }, { status: 400 });

  const sessRows = await q('SELECT id, title, start_date, end_date, duration, modality, trainer FROM app_sessions WHERE id = $1 AND tenant_id = $2',
    [sessionId, s.tenantId]);
  const session = sessRows[0];
  if (!session) return NextResponse.json({ error: 'Session introuvable.' }, { status: 404 });

  const rows = await q(
    `SELECT t.id, t.first_name AS first, t.last_name AS last, t.email
       FROM session_trainees st JOIN app_trainees t ON t.id = st.trainee_id
      WHERE st.tenant_id = $1 AND st.session_id = $2`,
    [s.tenantId, sessionId]
  );

  const origin = new URL(req.url).origin;
  let sent = 0, sansEmail = 0;
  for (const t of rows) {
    if (!t.email) { sansEmail++; continue; }
    try {
      const token = await issueTraineeToken(t.id, s.tenantId);
      const link = `${origin}/portail?token=${token}`;
      const r = await sendConvocationEmail(t.email, `${t.first || ''} ${t.last || ''}`.trim(), s.ofName, session, link);
      if (r.sent) sent++;
      await q('UPDATE session_trainees SET convoked_at = now() WHERE session_id = $1 AND trainee_id = $2', [sessionId, t.id]);
    } catch { /* on continue avec les suivants */ }
  }

  return NextResponse.json({ ok: true, inscrits: rows.length, sent, sansEmail });
}
