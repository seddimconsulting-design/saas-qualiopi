import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { q } from '@/lib/db';
import { sendResetEmail } from '@/lib/mail';
import { rateLimit, tooMany } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req) {
  try {
    const rl = await rateLimit(req, { name: 'forgot', max: 5, windowSec: 900 });
    if (!rl.ok) return tooMany(rl.retryAfter);

    const { email } = await req.json();
    const mail = (email || '').trim().toLowerCase();
    const rows = await q('SELECT id FROM app_users WHERE email = $1', [mail]);
    let devLink = null;
    if (rows[0]) {
      const token = crypto.randomBytes(32).toString('hex');
      const hash = crypto.createHash('sha256').update(token).digest('hex');
      const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      await q('DELETE FROM password_resets WHERE user_id = $1', [rows[0].id]);
      await q('INSERT INTO password_resets (token_hash, user_id, expires_at) VALUES ($1, $2, $3)', [hash, rows[0].id, expires]);
      const link = `${new URL(req.url).origin}/reset?token=${token}`;
      await sendResetEmail(mail, link);
      if (process.env.DEV_SHOW_RESET_LINK === 'true') devLink = link;
    }
    // Réponse identique que le compte existe ou non (pas d'énumération d'e-mails).
    return NextResponse.json({ ok: true, ...(devLink ? { devLink } : {}) });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
