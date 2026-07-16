import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { q } from '@/lib/db';
import { issueTraineeToken } from '@/lib/portal';
import { sendTraineeAccessEmail } from '@/lib/mail';
import { rateLimit, tooMany } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/* Génère (ou régénère) le lien d'accès d'un stagiaire et l'envoie par e-mail.
   Renvoie aussi le lien pour permettre à l'organisme de le copier. */
export async function POST(req) {
  const rl = await rateLimit(req, { name: 'invite', max: 30, windowSec: 3600 });
  if (!rl.ok) return tooMany(rl.retryAfter);

  const s = await getSession(req);
  if (!s) return NextResponse.json({ error: 'non authentifié' }, { status: 401 });

  const { traineeId } = await req.json();
  if (!traineeId) return NextResponse.json({ error: 'traineeId requis' }, { status: 400 });

  const rows = await q(
    'SELECT first_name AS first, last_name AS last, email FROM app_trainees WHERE id = $1 AND tenant_id = $2',
    [traineeId, s.tenantId]
  );
  const t = rows[0];
  if (!t) return NextResponse.json({ error: 'Stagiaire introuvable.' }, { status: 404 });

  const token = await issueTraineeToken(traineeId, s.tenantId);
  const link = `${new URL(req.url).origin}/portail?token=${token}`;

  let emailed = false;
  if (t.email) {
    const r = await sendTraineeAccessEmail(t.email, `${t.first || ''} ${t.last || ''}`.trim(), s.ofName, link);
    emailed = !!r.sent;
  }
  return NextResponse.json({ ok: true, link, emailed, email: t.email || null });
}
