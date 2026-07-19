import { NextResponse } from 'next/server';
import { q } from '@/lib/db';
import { verifyTraineeToken } from '@/lib/portal';
import { TEMPLATES, OF } from '@/lib/doc-templates';
import { renderDocx, renderPdf } from '@/lib/doc-render';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Modèles qu'un stagiaire peut télécharger pour lui-même.
const ALLOWED = new Set(['attestation-fin', 'programme', 'convention']);

const frDate = (d) => (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d) ? d.split('-').reverse().join('/') : (d || ''));

export async function GET(req) {
  const sp = new URL(req.url).searchParams;
  const auth = await verifyTraineeToken(sp.get('token'));
  if (!auth) return NextResponse.json({ error: 'Lien invalide ou expiré.' }, { status: 401 });

  const tplId = sp.get('tpl');
  const sessionId = sp.get('sessionId');
  const format = sp.get('format') || 'pdf';
  if (!ALLOWED.has(tplId)) return NextResponse.json({ error: 'Document non autorisé.' }, { status: 403 });
  const t = TEMPLATES.find((x) => x.id === tplId);
  if (!t) return NextResponse.json({ error: 'Modèle inconnu.' }, { status: 404 });

  // Le stagiaire doit être inscrit à cette session.
  const enr = await q('SELECT 1 FROM session_trainees WHERE session_id = $1 AND trainee_id = $2 AND tenant_id = $3',
    [sessionId, auth.traineeId, auth.tenantId]);
  if (!enr.length) return NextResponse.json({ error: 'Session non autorisée.' }, { status: 403 });

  const sRows = await q('SELECT * FROM app_sessions WHERE id = $1 AND tenant_id = $2', [sessionId, auth.tenantId]);
  const s = sRows[0];
  const trRows = await q('SELECT * FROM app_trainees WHERE id = $1 AND tenant_id = $2', [auth.traineeId, auth.tenantId]);
  const tr = trRows[0];
  const tpRows = await q('SELECT name, nda, address, email, phone, logo FROM app_tenants WHERE id = $1', [auth.tenantId]);
  const tp = tpRows[0] || {};
  const of = {
    name: tp.name || OF.name, nda: tp.nda || OF.nda, address: tp.address || '',
    email: tp.email || '', phone: tp.phone || '', logo: tp.logo || '',
  };
  const ctx = {
    sessionTitle: s?.title, startDate: frDate(s?.start_date), endDate: frDate(s?.end_date),
    duration: s?.duration, trainer: s?.trainer, modality: s?.modality, price: s?.price, traineesCount: s?.trainees_count,
    traineeName: tr ? `${tr.first_name} ${tr.last_name}`.trim() : '', traineeEmail: tr?.email,
    ofName: of.name, ofNda: of.nda, ofAddress: of.address, ofEmail: of.email, ofPhone: of.phone,
  };

  try {
    if (format === 'docx') {
      const buf = await renderDocx(t, of, ctx);
      return new NextResponse(buf, { headers: { 'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'Content-Disposition': `attachment; filename="${tplId}.docx"` } });
    }
    const buf = await renderPdf(t, of, ctx);
    return new NextResponse(buf, { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${tplId}.pdf"` } });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
