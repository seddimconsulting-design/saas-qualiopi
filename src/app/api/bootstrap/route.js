import { NextResponse } from 'next/server';
import { listAll, listIndicatorStatus } from '@/lib/collections';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req) {
  const s = await getSession(req);
  if (!s) return NextResponse.json({ error: 'non authentifié' }, { status: 401 });
  const tid = s.tenantId;
  try {
    const [sessions, trainees, veilles, reclamations, pac, clients, devis, documents, manualStatus] = await Promise.all([
      listAll('sessions', tid), listAll('trainees', tid), listAll('veilles', tid), listAll('reclamations', tid),
      listAll('pac', tid), listAll('clients', tid), listAll('devis', tid), listAll('documents', tid), listIndicatorStatus(tid),
    ]);
    return NextResponse.json({ sessions, trainees, veilles, reclamations, pac, clients, devis, documents, manualStatus });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
