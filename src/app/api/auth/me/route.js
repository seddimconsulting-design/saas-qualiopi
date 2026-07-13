import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { q } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req) {
  const s = await getSession(req);
  if (!s) return NextResponse.json({ error: 'non authentifié' }, { status: 401 });
  let emailVerified = true;
  try {
    const rows = await q('SELECT email_verified FROM app_users WHERE id = $1', [s.userId]);
    if (rows[0]) emailVerified = rows[0].email_verified;
  } catch {}
  return NextResponse.json({ email: s.email, ofName: s.ofName, emailVerified });
}
