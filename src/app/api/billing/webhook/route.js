import { NextResponse } from 'next/server';
import { q } from '@/lib/db';
import { getStripe } from '@/lib/billing';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/* Webhook Stripe : met à jour l'abonnement de l'organisme.
   Nécessite STRIPE_WEBHOOK_SECRET (signature vérifiée). */
export async function POST(req) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) return NextResponse.json({ error: 'facturation non configurée' }, { status: 400 });

  let event;
  try {
    const raw = await req.text();
    event = stripe.webhooks.constructEvent(raw, req.headers.get('stripe-signature'), secret);
  } catch (e) {
    return NextResponse.json({ error: `Signature invalide : ${e.message}` }, { status: 400 });
  }

  /* Retrouve l'organisme via les métadonnées ou l'identifiant client Stripe. */
  const findTenant = async (obj) => {
    const id = obj?.metadata?.tenantId || obj?.client_reference_id;
    if (id) return id;
    const cust = typeof obj?.customer === 'string' ? obj.customer : obj?.customer?.id;
    if (!cust) return null;
    const rows = await q('SELECT id FROM app_tenants WHERE stripe_customer_id = $1', [cust]);
    return rows[0]?.id || null;
  };

  const applySubscription = async (tenantId, sub) => {
    if (!tenantId || !sub) return;
    const periodEnd = sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null;
    await q(
      `UPDATE app_tenants
          SET subscription_status = $1, plan = COALESCE($2, plan), current_period_end = $3
        WHERE id = $4`,
      [sub.status, sub.metadata?.plan || null, periodEnd, tenantId]
    );
  };

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const sess = event.data.object;
        const tenantId = await findTenant(sess);
        const cust = typeof sess.customer === 'string' ? sess.customer : sess.customer?.id;
        if (tenantId && cust) await q('UPDATE app_tenants SET stripe_customer_id = $1 WHERE id = $2', [cust, tenantId]);
        if (sess.subscription) {
          const sub = await stripe.subscriptions.retrieve(
            typeof sess.subscription === 'string' ? sess.subscription : sess.subscription.id
          );
          await applySubscription(tenantId, sub);
        }
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        const tenantId = await findTenant(sub);
        await applySubscription(tenantId, sub);
        break;
      }
      default:
        break;
    }
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
