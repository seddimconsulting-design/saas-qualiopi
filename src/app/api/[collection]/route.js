import { NextResponse } from 'next/server';
import { COLLECTIONS, listAll, createOne } from '@/lib/collections';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req, { params }) {
  if (!COLLECTIONS[params.collection]) return NextResponse.json({ error: 'unknown collection' }, { status: 404 });
  const s = await getSession(req);
  if (!s) return NextResponse.json({ error: 'non authentifié' }, { status: 401 });
  try {
    return NextResponse.json(await listAll(params.collection, s.tenantId));
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  if (!COLLECTIONS[params.collection]) return NextResponse.json({ error: 'unknown collection' }, { status: 404 });
  const s = await getSession(req);
  if (!s) return NextResponse.json({ error: 'non authentifié' }, { status: 401 });
  try {
    const body = await req.json();
    return NextResponse.json(await createOne(params.collection, body, s.tenantId));
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
