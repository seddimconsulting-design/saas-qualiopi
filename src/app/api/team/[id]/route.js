import { NextResponse } from 'next/server';
import { q } from '@/lib/db';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function DELETE(req, { params }) {
  const s = await getSession(req);
  if (!s) return NextResponse.json({ error: 'non authentifié' }, { status: 401 });
  const r = await q('SELECT role FROM app_users WHERE id = $1', [s.userId]);
  if (r[0]?.role !== 'owner') {
    return NextResponse.json({ error: "Seul le propriétaire peut retirer des utilisateurs." }, { status: 403 });
  }
  if (params.id === s.userId) {
    return NextResponse.json({ error: 'Vous ne pouvez pas vous retirer vous-même.' }, { status: 400 });
  }
  // On ne supprime que dans son propre tenant
  await q('DELETE FROM app_users WHERE id = $1 AND tenant_id = $2', [params.id, s.tenantId]);
  return NextResponse.json({ ok: true });
}
