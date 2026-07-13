import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { q } from '@/lib/db';
import { createToken, cookieOptions, COOKIE } from '@/lib/auth';
import { rateLimit, tooMany } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req) {
  try {
    const rl = await rateLimit(req, { name: 'login', max: 10, windowSec: 300 });
    if (!rl.ok) return tooMany(rl.retryAfter);

    const { email, password } = await req.json();
    const mail = (email || '').trim().toLowerCase();
    const rows = await q(
      `SELECT u.id, u.tenant_id, u.email, u.password_hash, t.name AS of_name
       FROM app_users u JOIN app_tenants t ON t.id = u.tenant_id WHERE u.email = $1`,
      [mail]
    );
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password || '', user.password_hash))) {
      return NextResponse.json({ error: 'E-mail ou mot de passe incorrect.' }, { status: 401 });
    }
    const token = await createToken({ userId: user.id, tenantId: user.tenant_id, email: user.email, ofName: user.of_name });
    const res = NextResponse.json({ ok: true, user: { email: user.email, ofName: user.of_name } });
    res.cookies.set(COOKIE, token, cookieOptions());
    return res;
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
