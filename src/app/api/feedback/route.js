import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { rateLimit, tooMany } from '@/lib/rate-limit';
import { sendFeedbackEmail } from '@/lib/mail';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req) {
  try {
    const rl = await rateLimit(req, { name: 'feedback', max: 10, windowSec: 3600 });
    if (!rl.ok) return tooMany(rl.retryAfter);

    const s = await getSession(req);
    if (!s) return NextResponse.json({ error: 'non authentifié' }, { status: 401 });

    const { message } = await req.json();
    const msg = (message || '').trim();
    if (!msg) return NextResponse.json({ error: 'Message vide.' }, { status: 400 });
    if (msg.length > 5000) return NextResponse.json({ error: 'Message trop long.' }, { status: 400 });

    await sendFeedbackEmail({ from: s.email, ofName: s.ofName, message: msg });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
