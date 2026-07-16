import { NextResponse } from 'next/server';
import { q } from '@/lib/db';
import { genId } from '@/lib/auth';
import { verifyTraineeToken } from '@/lib/portal';
import { slotKeys } from '@/lib/slots';
import { clientIp, rateLimit, tooMany } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/* Enregistre la signature d'émargement d'un stagiaire pour une demi-journée. */
export async function POST(req) {
  const rl = await rateLimit(req, { name: 'portal-sign', max: 60, windowSec: 900 });
  if (!rl.ok) return tooMany(rl.retryAfter);

  const { token, sessionId, slot, signature } = await req.json();
  const auth = await verifyTraineeToken(token);
  if (!auth) return NextResponse.json({ error: 'Lien invalide ou expiré.' }, { status: 401 });

  if (!sessionId || !slot) return NextResponse.json({ error: 'Session et créneau requis.' }, { status: 400 });
  if (!signature || !/^data:image\/(png|jpeg);base64,/.test(signature) || signature.length > 300000) {
    return NextResponse.json({ error: 'Signature invalide.' }, { status: 400 });
  }

  // Le stagiaire doit être inscrit à cette session ; on récupère aussi ses dates.
  const rows = await q(
    `SELECT s.start_date, s.end_date
       FROM session_trainees st JOIN app_sessions s ON s.id = st.session_id
      WHERE st.session_id = $1 AND st.trainee_id = $2 AND st.tenant_id = $3`,
    [sessionId, auth.traineeId, auth.tenantId]
  );
  if (!rows.length) return NextResponse.json({ error: 'Session non autorisée.' }, { status: 403 });
  if (!slotKeys(rows[0]).has(slot)) return NextResponse.json({ error: 'Créneau invalide.' }, { status: 400 });

  await q(
    `INSERT INTO attendances (id, tenant_id, session_id, trainee_id, slot, signature, signer_ip, signed_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, now())
     ON CONFLICT (session_id, trainee_id, slot)
       DO UPDATE SET signature = EXCLUDED.signature, signer_ip = EXCLUDED.signer_ip, signed_at = now()`,
    [genId('att'), auth.tenantId, sessionId, auth.traineeId, slot, signature, clientIp(req)]
  );
  return NextResponse.json({ ok: true });
}
