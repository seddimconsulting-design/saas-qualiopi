import { NextResponse } from 'next/server';
import { listIndicatorStatus, setIndicatorStatus } from '@/lib/collections';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req) {
  const s = await getSession(req);
  if (!s) return NextResponse.json({ error: 'non authentifié' }, { status: 401 });
  try {
    return NextResponse.json(await listIndicatorStatus(s.tenantId));
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req) {
  const s = await getSession(req);
  if (!s) return NextResponse.json({ error: 'non authentifié' }, { status: 401 });
  try {
    const { id, status } = await req.json();
    return NextResponse.json(await setIndicatorStatus(s.tenantId, id, status));
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
