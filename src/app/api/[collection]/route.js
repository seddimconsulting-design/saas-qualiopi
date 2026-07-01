import { NextResponse } from 'next/server';
import { COLLECTIONS, listAll, createOne } from '@/lib/collections';

export const dynamic = 'force-dynamic';

export async function GET(_req, { params }) {
  if (!COLLECTIONS[params.collection]) return NextResponse.json({ error: 'unknown collection' }, { status: 404 });
  try {
    return NextResponse.json(await listAll(params.collection));
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  if (!COLLECTIONS[params.collection]) return NextResponse.json({ error: 'unknown collection' }, { status: 404 });
  try {
    const body = await req.json();
    return NextResponse.json(await createOne(params.collection, body));
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
