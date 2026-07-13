import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { q } from '@/lib/db';
import { rateLimit, tooMany } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req) {
  try {
    const rl = await rateLimit(req, { name: 'verify', max: 20, windowSec: 900 });
    if (!rl.ok) return tooMany(rl.retryAfter);

    const { token } = await req.json();
    if (!token) return NextResponse.json({ error: 'Jeton manquant.' }, { status: 400 });

    const hash = crypto.createHash('sha256').update(token).digest('hex');
    const rows = await q('SELECT user_id, expires_at FROM email_verifications WHERE token_hash = $1', [hash]);
    const rec = rows[0];
    if (!rec || new Date(rec.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Lien invalide ou expiré. Reconnectez-vous et renvoyez l’e-mail de confirmation.' }, { status: 400 });
    }
    await q('UPDATE app_users SET email_verified = TRUE WHERE id = $1', [rec.user_id]);
    await q('DELETE FROM email_verifications WHERE user_id = $1', [rec.user_id]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
