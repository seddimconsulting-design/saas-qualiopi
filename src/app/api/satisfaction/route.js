import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { q } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/* Réponses de satisfaction déposées par les stagiaires (verbatims + notes). */
export async function GET(req) {
  const s = await getSession(req);
  if (!s) return NextResponse.json({ error: 'non authentifié' }, { status: 401 });
  const responses = await q(
    `SELECT r.kind, r.overall, r.comment, r.submitted_at,
            t.first_name AS first, t.last_name AS last, sess.title AS session_title
       FROM satisfaction_responses r
       JOIN app_trainees t ON t.id = r.trainee_id
       JOIN app_sessions sess ON sess.id = r.session_id
      WHERE r.tenant_id = $1
      ORDER BY r.submitted_at DESC
      LIMIT 100`,
    [s.tenantId]
  );
  return NextResponse.json({ responses });
}
