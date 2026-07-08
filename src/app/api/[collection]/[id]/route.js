import { NextResponse } from 'next/server';
import { COLLECTIONS, updateOne, deleteOne } from '@/lib/collections';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function PATCH(req, { params }) {
  if (!COLLECTIONS[params.collection]) return NextResponse.json({ error: 'unknown collection' }, { status: 404 });
  const s = await getSession(req);
  if (!s) return NextResponse.json({ error: 'non authentifié' }, { status: 401 });
  try {
    const patch = await req.json();
    return NextResponse.json(await updateOne(params.collection, params.id, patch, s.tenantId));
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  if (!COLLECTIONS[params.collection]) return NextResponse.json({ error: 'unknown collection' }, { status: 404 });
  const s = await getSession(req);
  if (!s) return NextResponse.json({ error: 'non authentifié' }, { status: 401 });
  try {
    return NextResponse.json(await deleteOne(params.collection, params.id, s.tenantId));
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
