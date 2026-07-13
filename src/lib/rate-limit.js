import { NextResponse } from 'next/server';
import { q } from '@/lib/db';

/* Adresse IP de l'appelant (Vercel place l'IP réelle dans x-forwarded-for). */
export function clientIp(req) {
  const xff = req.headers.get('x-forwarded-for') || '';
  return xff.split(',')[0].trim() || req.headers.get('x-real-ip') || 'unknown';
}

/* Limitation de débit par IP, adossée à PostgreSQL (compatible serverless).
   Renvoie { ok, retryAfter }. En cas d'erreur DB : fail-open (on n'enferme
   jamais l'utilisateur à cause d'un incident technique). */
export async function rateLimit(req, { name, max, windowSec }) {
  try {
    const bucket = `${name}:${clientIp(req)}`;
    const rows = await q(
      `INSERT INTO rate_limits (bucket, count, reset_at)
         VALUES ($1, 1, now() + ($2 || ' seconds')::interval)
       ON CONFLICT (bucket) DO UPDATE SET
         count    = CASE WHEN rate_limits.reset_at < now() THEN 1 ELSE rate_limits.count + 1 END,
         reset_at = CASE WHEN rate_limits.reset_at < now() THEN now() + ($2 || ' seconds')::interval ELSE rate_limits.reset_at END
       RETURNING count, reset_at`,
      [bucket, String(windowSec)]
    );
    const { count, reset_at } = rows[0];
    const retryAfter = Math.max(1, Math.ceil((new Date(reset_at).getTime() - Date.now()) / 1000));
    return { ok: count <= max, retryAfter };
  } catch {
    return { ok: true, retryAfter: 0 };
  }
}

/* Réponse 429 prête à l'emploi. */
export function tooMany(retryAfter) {
  return NextResponse.json(
    { error: `Trop de tentatives. Réessayez dans ${retryAfter} seconde(s).` },
    { status: 429, headers: { 'Retry-After': String(retryAfter) } }
  );
}
