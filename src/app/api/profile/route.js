import { NextResponse } from 'next/server';
import { q } from '@/lib/db';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req) {
  const s = await getSession(req);
  if (!s) return NextResponse.json({ error: 'non authentifié' }, { status: 401 });
  const rows = await q(
    'SELECT id, name, nda, address, email, phone, logo, certifiant, apprentissage, sous_traitance, afest FROM app_tenants WHERE id = $1',
    [s.tenantId]
  );
  const t = rows[0] || {};
  // Profil d'activité : détermine les indicateurs Qualiopi applicables.
  return NextResponse.json({
    ...t,
    profil: {
      certifiant: !!t.certifiant, apprentissage: !!t.apprentissage,
      sousTraitance: !!t.sous_traitance, afest: !!t.afest,
    },
  });
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
    const p = b.profil || {};
    const rows = await q(
      `UPDATE app_tenants SET name = COALESCE($2, name), nda = $3, address = $4, email = $5, phone = $6, logo = $7,
              certifiant = $8, apprentissage = $9, sous_traitance = $10, afest = $11
       WHERE id = $1 RETURNING id, name, nda, address, email, phone, logo, certifiant, apprentissage, sous_traitance, afest`,
      [s.tenantId, b.name?.trim() || null, b.nda || null, b.address || null, b.email || null, b.phone || null, logo,
       !!p.certifiant, !!p.apprentissage, !!p.sousTraitance, !!p.afest]
    );
    const t = rows[0];
    return NextResponse.json({
      ...t,
      profil: {
        certifiant: !!t.certifiant, apprentissage: !!t.apprentissage,
        sousTraitance: !!t.sous_traitance, afest: !!t.afest,
      },
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
