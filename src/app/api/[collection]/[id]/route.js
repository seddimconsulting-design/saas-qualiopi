import { NextResponse } from 'next/server';
import { COLLECTIONS, updateOne, deleteOne } from '@/lib/collections';

export const dynamic = 'force-dynamic';

export async function PATCH(req, { params }) {
  if (!COLLECTIONS[params.collection]) return NextResponse.json({ error: 'unknown collection' }, { status: 404 });
  try {
    const patch = await req.json();
    return NextResponse.json(await updateOne(params.collection, params.id, patch));
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(_req, { params }) {
  if (!COLLECTIONS[params.collection]) return NextResponse.json({ error: 'unknown collection' }, { status: 404 });
  try {
    return NextResponse.json(await deleteOne(params.collection, params.id));
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
