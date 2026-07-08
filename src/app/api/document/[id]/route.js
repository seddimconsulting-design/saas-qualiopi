import { NextResponse } from 'next/server';
import { TEMPLATES, OF } from '@/lib/doc-templates';
import { renderDocx, renderPdf } from '@/lib/doc-render';
import { q } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/* Formate une date texte AAAA-MM-JJ en JJ/MM/AAAA. */
const frDate = (d) => (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)
  ? d.split('-').reverse().join('/') : (d || ''));

/* Construit le contexte de pré-remplissage depuis la base. */
async function buildContext(sessionId, traineeId) {
  const ctx = { ofName: OF.name, ofNda: OF.nda };
  if (sessionId) {
    const rows = await q('SELECT * FROM app_sessions WHERE id = $1', [sessionId]);
    const s = rows[0];
    if (s) Object.assign(ctx, {
      sessionTitle: s.title, startDate: frDate(s.start_date), endDate: frDate(s.end_date),
      duration: s.duration, trainer: s.trainer, modality: s.modality,
      price: s.price, traineesCount: s.trainees_count,
    });
  }
  if (traineeId) {
    const rows = await q('SELECT * FROM app_trainees WHERE id = $1', [traineeId]);
    const tr = rows[0];
    if (tr) Object.assign(ctx, { traineeName: `${tr.first_name} ${tr.last_name}`.trim(), traineeEmail: tr.email });
  }
  return ctx;
}

export async function GET(req, { params }) {
  const t = TEMPLATES.find(x => x.id === params.id);
  if (!t) return NextResponse.json({ error: 'Modèle inconnu' }, { status: 404 });
  const sp = new URL(req.url).searchParams;
  const format = sp.get('format') || 'pdf';
  try {
    const ctx = await buildContext(sp.get('sessionId'), sp.get('traineeId'));
    if (format === 'docx') {
      const buf = await renderDocx(t, OF, ctx);
      return new NextResponse(buf, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="${t.id}.docx"`,
        },
      });
    }
    const buf = await renderPdf(t, OF, ctx);
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
