import { NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { q } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req) {
  try {
    const { token, password } = await req.json();
    if (!token || !password || password.length < 6) {
      return NextResponse.json({ error: 'Mot de passe (6 caractères min.) requis.' }, { status: 400 });
    }
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    const rows = await q('SELECT user_id, expires_at FROM password_resets WHERE token_hash = $1', [hash]);
    const rec = rows[0];
    if (!rec || new Date(rec.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Lien invalide ou expiré. Refaites une demande.' }, { status: 400 });
    }
    const ph = await bcrypt.hash(password, 10);
    await q('UPDATE app_users SET password_hash = $1 WHERE id = $2', [ph, rec.user_id]);
    await q('DELETE FROM password_resets WHERE user_id = $1', [rec.user_id]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
