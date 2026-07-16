import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { q } from '@/lib/db';
import { sessionSlots } from '@/lib/slots';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/* Liste des stagiaires inscrits à une session (+ progression d'émargement par
   demi-journée) et liste de tous les stagiaires de l'organisme. */
export async function GET(req) {
  const s = await getSession(req);
  if (!s) return NextResponse.json({ error: 'non authentifié' }, { status: 401 });
  const sessionId = new URL(req.url).searchParams.get('sessionId');
  if (!sessionId) return NextResponse.json({ error: 'sessionId requis' }, { status: 400 });

  const sess = await q('SELECT id, start_date, end_date FROM app_sessions WHERE id = $1 AND tenant_id = $2', [sessionId, s.tenantId]);
  const total = sess[0] ? sessionSlots(sess[0]).length : 0;

  const enrolled = await q(
    `SELECT t.id, t.first_name AS first, t.last_name AS last, t.email,
            COUNT(a.id)::int AS signed_count,
            MAX(a.signed_at) AS last_signed_at,
            (tk.trainee_id IS NOT NULL) AS has_access
       FROM session_trainees st
       JOIN app_trainees t ON t.id = st.trainee_id
       LEFT JOIN attendances a ON a.session_id = st.session_id AND a.trainee_id = st.trainee_id
       LEFT JOIN trainee_tokens tk ON tk.trainee_id = t.id
      WHERE st.tenant_id = $1 AND st.session_id = $2
      GROUP BY t.id, t.first_name, t.last_name, t.email, tk.trainee_id
      ORDER BY t.last_name, t.first_name`,
    [s.tenantId, sessionId]
  );
  const all = await q(
    'SELECT id, first_name AS first, last_name AS last, email FROM app_trainees WHERE tenant_id = $1 ORDER BY last_name, first_name',
    [s.tenantId]
  );
  return NextResponse.json({ enrolled, all, total });
}

/* Inscrire un stagiaire à une session. */
export async function POST(req) {
  const s = await getSession(req);
  if (!s) return NextResponse.json({ error: 'non authentifié' }, { status: 401 });
  const { sessionId, traineeId } = await req.json();
  if (!sessionId || !traineeId) return NextResponse.json({ error: 'sessionId et traineeId requis' }, { status: 400 });
  await q(
    'INSERT INTO session_trainees (tenant_id, session_id, trainee_id) VALUES ($1, $2, $3) ON CONFLICT (session_id, trainee_id) DO NOTHING',
    [s.tenantId, sessionId, traineeId]
  );
  return NextResponse.json({ ok: true });
}

/* Désinscrire un stagiaire d'une session. */
export async function DELETE(req) {
  const s = await getSession(req);
  if (!s) return NextResponse.json({ error: 'non authentifié' }, { status: 401 });
  const sp = new URL(req.url).searchParams;
  const sessionId = sp.get('sessionId'), traineeId = sp.get('traineeId');
  if (!sessionId || !traineeId) return NextResponse.json({ error: 'paramètres requis' }, { status: 400 });
  await q('DELETE FROM session_trainees WHERE tenant_id = $1 AND session_id = $2 AND trainee_id = $3',
    [s.tenantId, sessionId, traineeId]);
  return NextResponse.json({ ok: true });
}
