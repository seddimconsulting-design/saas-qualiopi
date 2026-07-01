import { NextResponse } from 'next/server';
import { listIndicatorStatus, setIndicatorStatus } from '@/lib/collections';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json(await listIndicatorStatus());
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const { id, status } = await req.json();
    return NextResponse.json(await setIndicatorStatus(id, status));
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
