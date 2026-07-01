import { NextResponse } from 'next/server';
import { listAll, listIndicatorStatus } from '@/lib/collections';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [sessions, trainees, veilles, reclamations, pac, clients, devis, documents, manualStatus] = await Promise.all([
      listAll('sessions'), listAll('trainees'), listAll('veilles'), listAll('reclamations'),
      listAll('pac'), listAll('clients'), listAll('devis'), listAll('documents'), listIndicatorStatus(),
    ]);
    return NextResponse.json({ sessions, trainees, veilles, reclamations, pac, clients, devis, documents, manualStatus });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
