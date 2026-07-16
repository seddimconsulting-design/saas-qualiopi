import { NextResponse } from 'next/server';
import { q } from '@/lib/db';
import { genId } from '@/lib/auth';
import { verifyTraineeToken } from '@/lib/portal';
import { clientIp, rateLimit, tooMany } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/* Enregistre la signature d'émargement d'un stagiaire pour une session. */
export async function POST(req) {
  const rl = await rateLimit(req, { name: 'portal-sign', max: 30, windowSec: 900 });
  if (!rl.ok) return tooMany(rl.retryAfter);

  const { token, sessionId, signature } = await req.json();
  const auth = await verifyTraineeToken(token);
  if (!auth) return NextResponse.json({ error: 'Lien invalide ou expiré.' }, { status: 401 });

  if (!sessionId) return NextResponse.json({ error: 'Session requise.' }, { status: 400 });
  if (!signature || !/^data:image\/(png|jpeg);base64,/.test(signature) || signature.length > 300000) {
    return NextResponse.json({ error: 'Signature invalide.' }, { status: 400 });
  }

  // Le stagiaire doit être inscrit à cette session.
  const enrolled = await q(
    'SELECT 1 FROM session_trainees WHERE session_id = $1 AND trainee_id = $2 AND tenant_id = $3',
    [sessionId, auth.traineeId, auth.tenantId]
  );
  if (!enrolled.length) return NextResponse.json({ error: 'Session non autorisée.' }, { status: 403 });

  await q(
    `INSERT INTO attendances (id, tenant_id, session_id, trainee_id, signature, signer_ip, signed_at)
       VALUES ($1, $2, $3, $4, $5, $6, now())
     ON CONFLICT (session_id, trainee_id)
       DO UPDATE SET signature = EXCLUDED.signature, signer_ip = EXCLUDED.signer_ip, signed_at = now()`,
    [genId('att'), auth.tenantId, sessionId, auth.traineeId, signature, clientIp(req)]
  );
  return NextResponse.json({ ok: true });
}
