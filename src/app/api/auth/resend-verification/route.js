import { NextResponse } from 'next/server';
import { q } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { rateLimit, tooMany } from '@/lib/rate-limit';
import { issueEmailVerification } from '@/lib/email-verify';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req) {
  try {
    const rl = await rateLimit(req, { name: 'resend-verif', max: 4, windowSec: 3600 });
    if (!rl.ok) return tooMany(rl.retryAfter);

    const s = await getSession(req);
    if (!s) return NextResponse.json({ error: 'non authentifié' }, { status: 401 });

    const rows = await q('SELECT email, email_verified FROM app_users WHERE id = $1', [s.userId]);
    const user = rows[0];
    if (!user) return NextResponse.json({ error: 'Compte introuvable.' }, { status: 404 });
    if (user.email_verified) return NextResponse.json({ ok: true, alreadyVerified: true });

    await issueEmailVerification(s.userId, user.email, new URL(req.url).origin);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
