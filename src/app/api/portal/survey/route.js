import { NextResponse } from 'next/server';
import { q } from '@/lib/db';
import { genId } from '@/lib/auth';
import { verifyTraineeToken } from '@/lib/portal';
import { scoreSurvey } from '@/lib/survey';
import { clientIp, rateLimit, tooMany } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/* Dépôt d'un questionnaire de satisfaction par le stagiaire. */
export async function POST(req) {
  const rl = await rateLimit(req, { name: 'portal-survey', max: 30, windowSec: 900 });
  if (!rl.ok) return tooMany(rl.retryAfter);

  const { token, sessionId, kind, ratings, comment } = await req.json();
  const auth = await verifyTraineeToken(token);
  if (!auth) return NextResponse.json({ error: 'Lien invalide ou expiré.' }, { status: 401 });

  const scored = scoreSurvey(kind, ratings);
  if (!sessionId || !scored.ok) return NextResponse.json({ error: 'Réponses invalides (toutes les questions doivent être notées).' }, { status: 400 });

  const enrolled = await q(
    'SELECT 1 FROM session_trainees WHERE session_id = $1 AND trainee_id = $2 AND tenant_id = $3',
    [sessionId, auth.traineeId, auth.tenantId]
  );
  if (!enrolled.length) return NextResponse.json({ error: 'Session non autorisée.' }, { status: 403 });

  const cmt = (comment || '').toString().slice(0, 2000);
  await q(
    `INSERT INTO satisfaction_responses (id, tenant_id, session_id, trainee_id, kind, ratings, comment, overall, signer_ip, submitted_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, now())
     ON CONFLICT (session_id, trainee_id, kind)
       DO UPDATE SET ratings = EXCLUDED.ratings, comment = EXCLUDED.comment, overall = EXCLUDED.overall, signer_ip = EXCLUDED.signer_ip, submitted_at = now()`,
    [genId('sat'), auth.tenantId, sessionId, auth.traineeId, kind, JSON.stringify(scored.clean), cmt, scored.overall, clientIp(req)]
  );

  // Répercute la note globale sur le stagiaire (alimente les indicateurs 13/14).
  const col = kind === 'froid' ? 'sat_cold' : 'sat_hot';
  await q(`UPDATE app_trainees SET ${col} = $1 WHERE id = $2 AND tenant_id = $3`,
    [Math.round(scored.overall), auth.traineeId, auth.tenantId]);

  return NextResponse.json({ ok: true });
}
