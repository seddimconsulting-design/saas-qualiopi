import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { q } from '@/lib/db';
import { createToken, cookieOptions, COOKIE, genId } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req) {
  try {
    const { email, password, ofName } = await req.json();
    const mail = (email || '').trim().toLowerCase();
    if (!mail || !password || password.length < 6) {
      return NextResponse.json({ error: 'E-mail et mot de passe (6 caractères min.) requis.' }, { status: 400 });
    }
    const exists = await q('SELECT 1 FROM app_users WHERE email = $1', [mail]);
    if (exists.length) {
      return NextResponse.json({ error: 'Un compte existe déjà avec cet e-mail.' }, { status: 409 });
    }
    const tenantId = genId('t');
    const userId = genId('u');
    const name = (ofName || 'Mon organisme').trim();
    await q('INSERT INTO app_tenants (id, name) VALUES ($1, $2)', [tenantId, name]);
    const hash = await bcrypt.hash(password, 10);
    await q('INSERT INTO app_users (id, tenant_id, email, password_hash, name) VALUES ($1, $2, $3, $4, $5)',
      [userId, tenantId, mail, hash, name]);

    const token = await createToken({ userId, tenantId, email: mail, ofName: name });
    const res = NextResponse.json({ ok: true, user: { email: mail, ofName: name } });
    res.cookies.set(COOKIE, token, cookieOptions());
    return res;
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
