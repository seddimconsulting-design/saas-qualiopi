import { NextResponse } from 'next/server';
import { q } from '@/lib/db';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req) {
  const s = await getSession(req);
  if (!s) return NextResponse.json({ error: 'non authentifié' }, { status: 401 });
  const rows = await q('SELECT id, name, nda, address, email, phone, logo FROM app_tenants WHERE id = $1', [s.tenantId]);
  return NextResponse.json(rows[0] || {});
}

export async function PATCH(req) {
  const s = await getSession(req);
  if (!s) return NextResponse.json({ error: 'non authentifié' }, { status: 401 });
  try {
    const b = await req.json();
    // logo : dataURL base64 (png/jpg) ; on ignore si trop volumineux (> ~500 Ko)
    let logo = typeof b.logo === 'string' ? b.logo : null;
    if (logo && logo.length > 700000) {
      return NextResponse.json({ error: 'Logo trop volumineux (max ~500 Ko).' }, { status: 400 });
    }
    const rows = await q(
      `UPDATE app_tenants SET name = COALESCE($2, name), nda = $3, address = $4, email = $5, phone = $6, logo = $7
       WHERE id = $1 RETURNING id, name, nda, address, email, phone, logo`,
      [s.tenantId, b.name?.trim() || null, b.nda || null, b.address || null, b.email || null, b.phone || null, logo]
    );
    return NextResponse.json(rows[0]);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
