import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { q } from '@/lib/db';
import { getSession, genId } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function roleOf(userId) {
  const r = await q('SELECT role FROM app_users WHERE id = $1', [userId]);
  return r[0]?.role;
}

export async function GET(req) {
  const s = await getSession(req);
  if (!s) return NextResponse.json({ error: 'non authentifié' }, { status: 401 });
  const rows = await q(
    'SELECT id, email, name, role FROM app_users WHERE tenant_id = $1 ORDER BY created_at ASC',
    [s.tenantId]
  );
  return NextResponse.json({ users: rows, me: s.userId, myRole: await roleOf(s.userId) });
}

export async function POST(req) {
  const s = await getSession(req);
  if (!s) return NextResponse.json({ error: 'non authentifié' }, { status: 401 });
  if ((await roleOf(s.userId)) !== 'owner') {
    return NextResponse.json({ error: "Seul le propriétaire peut ajouter des utilisateurs." }, { status: 403 });
  }
  try {
    const { email, password, name } = await req.json();
    const mail = (email || '').trim().toLowerCase();
    if (!mail || !password || password.length < 6) {
      return NextResponse.json({ error: 'E-mail et mot de passe (6 caractères min.) requis.' }, { status: 400 });
    }
    const exists = await q('SELECT 1 FROM app_users WHERE email = $1', [mail]);
    if (exists.length) return NextResponse.json({ error: 'Un compte existe déjà avec cet e-mail.' }, { status: 409 });
    const hash = await bcrypt.hash(password, 10);
    const id = genId('u');
    await q("INSERT INTO app_users (id, tenant_id, email, password_hash, name, role) VALUES ($1, $2, $3, $4, $5, 'member')",
      [id, s.tenantId, mail, hash, (name || '').trim()]);
    return NextResponse.json({ user: { id, email: mail, name: name || '', role: 'member' } });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
