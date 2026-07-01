/* Applique database/app_schema.sql à la base pointée par DATABASE_URL.
   Usage : node scripts/migrate.js  (nécessite PostgreSQL démarré). */
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

(async () => {
  const url = process.env.DATABASE_URL;
  if (!url) { console.error('DATABASE_URL manquant (.env.local)'); process.exit(1); }
  const sql = fs.readFileSync(path.join(__dirname, '..', 'database', 'app_schema.sql'), 'utf8');
  const client = new Client({ connectionString: url });
  try {
    await client.connect();
    await client.query(sql);
    const { rows } = await client.query('SELECT count(*)::int AS n FROM app_sessions');
    console.log(`OK - Migration appliquee. app_sessions : ${rows[0].n} lignes.`);
  } catch (e) {
    console.error('Echec migration :', e.message);
    process.exit(1);
  } finally {
    await client.end();
  }
})();
