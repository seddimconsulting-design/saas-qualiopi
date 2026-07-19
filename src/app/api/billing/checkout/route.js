import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { q } from '@/lib/db';
import { getStripe, planById } from '@/lib/billing';
import { rateLimit, tooMany } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/* Crée une session Stripe Checkout pour souscrire une offre. */
export async function POST(req) {
  const rl = await rateLimit(req, { name: 'checkout', max: 20, windowSec: 3600 });
  if (!rl.ok) return tooMany(rl.retryAfter);

  const s = await getSession(req);
  if (!s) return NextResponse.json({ error: 'non authentifié' }, { status: 401 });

  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ error: 'La facturation n’est pas encore configurée.' }, { status: 400 });

  const { plan } = await req.json();
  const p = planById(plan);
  const priceId = p && process.env[p.priceEnv];
  if (!p || !priceId) return NextResponse.json({ error: 'Offre indisponible.' }, { status: 400 });

  const rows = await q('SELECT name, email, stripe_customer_id FROM app_tenants WHERE id = $1', [s.tenantId]);
  const t = rows[0] || {};
  let customerId = t.stripe_customer_id;

  try {
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: t.email || s.email,
        name: t.name || s.ofName,
        metadata: { tenantId: s.tenantId },
      });
      customerId = customer.id;
      await q('UPDATE app_tenants SET stripe_customer_id = $1 WHERE id = $2', [customerId, s.tenantId]);
    }

    const origin = new URL(req.url).origin;
    const checkout = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      client_reference_id: s.tenantId,
      metadata: { tenantId: s.tenantId, plan: p.id },
      subscription_data: { metadata: { tenantId: s.tenantId, plan: p.id } },
      success_url: `${origin}/?abonnement=ok`,
      cancel_url: `${origin}/tarifs`,
      allow_promotion_codes: true,
    });
    return NextResponse.json({ url: checkout.url });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
