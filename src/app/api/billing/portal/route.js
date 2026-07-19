import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { q } from '@/lib/db';
import { getStripe } from '@/lib/billing';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/* Ouvre le portail client Stripe (gérer/annuler l'abonnement, factures). */
export async function POST(req) {
  const s = await getSession(req);
  if (!s) return NextResponse.json({ error: 'non authentifié' }, { status: 401 });

  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ error: 'La facturation n’est pas encore configurée.' }, { status: 400 });

  const rows = await q('SELECT stripe_customer_id FROM app_tenants WHERE id = $1', [s.tenantId]);
  const customerId = rows[0]?.stripe_customer_id;
  if (!customerId) return NextResponse.json({ error: 'Aucun abonnement à gérer.' }, { status: 400 });

  try {
    const origin = new URL(req.url).origin;
    const portal = await stripe.billingPortal.sessions.create({ customer: customerId, return_url: `${origin}/` });
    return NextResponse.json({ url: portal.url });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
