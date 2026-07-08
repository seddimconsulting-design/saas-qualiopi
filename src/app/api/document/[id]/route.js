import { NextResponse } from 'next/server';
import { TEMPLATES, OF } from '@/lib/doc-templates';
import { renderDocx, renderPdf } from '@/lib/doc-render';
import { q } from '@/lib/db';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/* Formate une date texte AAAA-MM-JJ en JJ/MM/AAAA. */
const frDate = (d) => (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)
  ? d.split('-').reverse().join('/') : (d || ''));

/* Construit le contexte de pré-remplissage depuis la base (scopé au tenant). */
async function buildContext(sessionId, traineeId, tenantId) {
  const ctx = {};
  if (sessionId) {
    const rows = await q('SELECT * FROM app_sessions WHERE id = $1 AND tenant_id = $2', [sessionId, tenantId]);
    const s = rows[0];
    if (s) Object.assign(ctx, {
      sessionTitle: s.title, startDate: frDate(s.start_date), endDate: frDate(s.end_date),
      duration: s.duration, trainer: s.trainer, modality: s.modality,
      price: s.price, traineesCount: s.trainees_count,
    });
  }
  if (traineeId) {
    const rows = await q('SELECT * FROM app_trainees WHERE id = $1 AND tenant_id = $2', [traineeId, tenantId]);
    const tr = rows[0];
    if (tr) Object.assign(ctx, { traineeName: `${tr.first_name} ${tr.last_name}`.trim(), traineeEmail: tr.email });
  }
  return ctx;
}

export async function GET(req, { params }) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: 'non authentifié' }, { status: 401 });
  const t = TEMPLATES.find(x => x.id === params.id);
  if (!t) return NextResponse.json({ error: 'Modèle inconnu' }, { status: 404 });
  const sp = new URL(req.url).searchParams;
  const format = sp.get('format') || 'pdf';
  const tRows = await q('SELECT name, nda, address, email, phone, logo FROM app_tenants WHERE id = $1', [session.tenantId]);
  const tp = tRows[0] || {};
  const of = {
    name: tp.name || session.ofName || OF.name,
    nda: tp.nda || OF.nda,
    address: tp.address || '',
    email: tp.email || '',
    phone: tp.phone || '',
    logo: tp.logo || '',
  };
  try {
    const ctx = await buildContext(sp.get('sessionId'), sp.get('traineeId'), session.tenantId);
    Object.assign(ctx, { ofName: of.name, ofNda: of.nda, ofAddress: of.address, ofEmail: of.email, ofPhone: of.phone });
    if (format === 'docx') {
      const buf = await renderDocx(t, of, ctx);
      return new NextResponse(buf, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="${t.id}.docx"`,
        },
      });
    }
    const buf = await renderPdf(t, of, ctx);
    return new NextResponse(buf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${t.id}.pdf"`,
      },
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
