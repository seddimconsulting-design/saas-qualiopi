import { NextResponse } from 'next/server';
import { q } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { sessionSlots } from '@/lib/slots';
import { renderEmargementPdf } from '@/lib/emargement-render';
import { OF } from '@/lib/doc-templates';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req, { params }) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: 'non authentifié' }, { status: 401 });

  const sessionId = params.sessionId;
  const sRows = await q('SELECT * FROM app_sessions WHERE id = $1 AND tenant_id = $2', [sessionId, session.tenantId]);
  const s = sRows[0];
  if (!s) return NextResponse.json({ error: 'Session introuvable' }, { status: 404 });

  const tRows = await q('SELECT name, nda, address, email, phone, logo FROM app_tenants WHERE id = $1', [session.tenantId]);
  const tp = tRows[0] || {};
  const of = {
    name: tp.name || session.ofName || OF.name, nda: tp.nda || OF.nda,
    address: tp.address || '', email: tp.email || '', phone: tp.phone || '', logo: tp.logo || '',
  };

  const enrolled = await q(
    `SELECT t.id, t.first_name AS first, t.last_name AS last
       FROM session_trainees st JOIN app_trainees t ON t.id = st.trainee_id
      WHERE st.tenant_id = $1 AND st.session_id = $2
      ORDER BY t.last_name, t.first_name`,
    [session.tenantId, sessionId]
  );
  const atts = await q('SELECT trainee_id, slot, signature, signed_at FROM attendances WHERE tenant_id = $1 AND session_id = $2',
    [session.tenantId, sessionId]);

  const byTrainee = {};
  for (const a of atts) {
    (byTrainee[a.trainee_id] ||= {})[a.slot] = { signature: a.signature, signed_at: a.signed_at };
  }
  const trainees = enrolled.map((t) => ({ first: t.first, last: t.last, sigs: byTrainee[t.id] || {} }));

  try {
    const buf = await renderEmargementPdf({ of, session: s, slots: sessionSlots(s), trainees });
    return new NextResponse(buf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="emargement-${sessionId}.pdf"`,
      },
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
