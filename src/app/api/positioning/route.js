import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { q } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/* Positionnements reçus pour une session (analyse du besoin + score du QCM). */
export async function GET(req) {
  const s = await getSession(req);
  if (!s) return NextResponse.json({ error: 'non authentifié' }, { status: 401 });
  const sessionId = new URL(req.url).searchParams.get('sessionId');
  if (!sessionId) return NextResponse.json({ error: 'sessionId requis' }, { status: 400 });

  const rows = await q(
    `SELECT p.answers, p.score, p.submitted_at, t.first_name AS first, t.last_name AS last
       FROM positionings p JOIN app_trainees t ON t.id = p.trainee_id
      WHERE p.tenant_id = $1 AND p.session_id = $2
      ORDER BY t.last_name, t.first_name`,
    [s.tenantId, sessionId]
  );
  return NextResponse.json({ positionings: rows });
}
