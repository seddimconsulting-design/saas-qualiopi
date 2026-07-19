import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { q } from '@/lib/db';
import { billingEnabled } from '@/lib/billing';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req) {
  const s = await getSession(req);
  if (!s) return NextResponse.json({ error: 'non authentifié' }, { status: 401 });
  const rows = await q(
    'SELECT plan, subscription_status, current_period_end, trial_end, stripe_customer_id FROM app_tenants WHERE id = $1',
    [s.tenantId]
  );
  const t = rows[0] || {};
  return NextResponse.json({
    enabled: billingEnabled(),
    plan: t.plan || 'essai',
    status: t.subscription_status || null,
    currentPeriodEnd: t.current_period_end || null,
    trialEnd: t.trial_end || null,
    hasCustomer: !!t.stripe_customer_id,
  });
}
