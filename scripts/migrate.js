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
  const isLocal = /localhost|127\.0\.0\.1/.test(url);
  const client = new Client({ connectionString: url, ssl: isLocal ? false : { rejectUnauthorized: false } });
  try {
    await client.connect();
    await client.query(sql);
    const { rows } = await client.query('SELECT count(*)::int AS n FROM app_sessions');
    console.log(`OK - Migration appliquee. app_sessions : ${rows[0].n} lignes.`);

    // Compte de démonstration (rattaché au tenant demo qui porte les données d'exemple)
    const bcrypt = require('bcryptjs');
    const demoEmail = 'demo@qualisaas.fr';
    const exists = await client.query('SELECT 1 FROM app_users WHERE email = $1', [demoEmail]);
    if (!exists.rows.length) {
      const hash = await bcrypt.hash('DemoQualiopi2026', 10);
      await client.query(
        "INSERT INTO app_users (id, tenant_id, email, password_hash, name) VALUES ('u-demo', 'demo-tenant', $1, $2, 'Sokai Formation (démo)')",
        [demoEmail, hash]
      );
      console.log(`OK - Compte démo créé : ${demoEmail} / DemoQualiopi2026`);
    } else {
      console.log('OK - Compte démo déjà présent.');
    }
  } catch (e) {
    console.error('Echec migration :', e.message);
    process.exit(1);
  } finally {
    await client.end();
  }
})();
