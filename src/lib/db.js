import { Pool } from 'pg';

/* Réutilise un seul pool en dev (évite d'en créer un à chaque hot-reload). */
const globalForPg = globalThis;

/* Résout l'URL de connexion : DATABASE_URL en priorité, sinon les noms
   injectés par l'intégration Neon/Vercel. */
function resolveConnectionString() {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.POSTGRES_URL_NON_POOLING ||
    ''
  );
}

export function getPool() {
  if (!globalForPg._pgPool) {
    const connectionString = resolveConnectionString();
    // SSL requis par les Postgres hébergés (Neon, Supabase, Vercel) ; désactivé en local.
    const isLocal = /localhost|127\.0\.0\.1/.test(connectionString);
    globalForPg._pgPool = new Pool({
      connectionString,
      ssl: isLocal ? false : { rejectUnauthorized: false },
    });
  }
  return globalForPg._pgPool;
}

export async function q(text, params) {
  const res = await getPool().query(text, params);
  return res.rows;
}
