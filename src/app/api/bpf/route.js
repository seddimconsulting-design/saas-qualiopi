import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { q } from '@/lib/db';
import { listAll } from '@/lib/collections';
import { computeBpf } from '@/lib/bpf';
import { renderBpfPdf } from '@/lib/bpf-render';
import { OF } from '@/lib/doc-templates';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req) {
  const s = await getSession(req);
  if (!s) return NextResponse.json({ error: 'non authentifié' }, { status: 401 });

  const sp = new URL(req.url).searchParams;
  const year = Number(sp.get('year')) || new Date().getFullYear() - 1;

  const [sessions, devis, clients, effRows] = await Promise.all([
    listAll('sessions', s.tenantId),
    listAll('devis', s.tenantId),
    listAll('clients', s.tenantId),
    q('SELECT session_id, count(*)::int AS n FROM session_trainees WHERE tenant_id = $1 GROUP BY session_id', [s.tenantId]),
  ]);
  const effectifs = Object.fromEntries(effRows.map(r => [r.session_id, r.n]));
  const bpf = computeBpf({ year, sessions, effectifs, devis, clients });

  if (sp.get('format') !== 'pdf') return NextResponse.json(bpf);

  const tRows = await q('SELECT name, nda, address, email, phone FROM app_tenants WHERE id = $1', [s.tenantId]);
  const tp = tRows[0] || {};
  const of = {
    name: tp.name || s.ofName || OF.name, nda: tp.nda || OF.nda,
    address: tp.address || '', email: tp.email || '', phone: tp.phone || '',
  };
  try {
    const buf = await Promise.race([
      renderBpfPdf({ of, bpf }),
      new Promise((_, rej) => setTimeout(() => rej(new Error('Génération trop longue')), 9000)),
    ]);
    return new NextResponse(buf, {
      headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="bpf-${year}.pdf"` },
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
