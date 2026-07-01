import { NextResponse } from 'next/server';
import { TEMPLATES, OF } from '@/lib/doc-templates';
import { renderDocx, renderPdf } from '@/lib/doc-render';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req, { params }) {
  const t = TEMPLATES.find(x => x.id === params.id);
  if (!t) return NextResponse.json({ error: 'Modèle inconnu' }, { status: 404 });
  const format = new URL(req.url).searchParams.get('format') || 'pdf';
  try {
    if (format === 'docx') {
      const buf = await renderDocx(t, OF);
      return new NextResponse(buf, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="${t.id}.docx"`,
        },
      });
    }
    const buf = await renderPdf(t, OF);
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
