/* Sauvegarde logique indépendante de toutes les données applicatives dans un
   fichier JSON daté (dossier backups/, non versionné). Insensible à la version
   de PostgreSQL. Restauration : appliquer database/app_schema.sql puis réinsérer
   les lignes du JSON.
   Usage : node scripts/backup.js   (utilise DATABASE_URL de .env.local) */
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Tables de données à sauvegarder (on ignore les tables transitoires :
// rate_limits, email_verifications, password_resets).
const TABLES = [
  'app_tenants', 'app_users', 'app_sessions', 'app_trainees',
  'veilles', 'reclamations', 'pac', 'clients', 'devis',
  'documents', 'indicator_status',
];

(async () => {
  const url = process.env.DATABASE_URL;
  if (!url) { console.error('DATABASE_URL manquant (.env.local)'); process.exit(1); }
  const isLocal = /localhost|127\.0\.0\.1/.test(url);
  const c = new Client({ connectionString: url, ssl: isLocal ? false : { rejectUnauthorized: false } });
  await c.connect();

  const dump = { takenAt: new Date().toISOString(), tables: {} };
  const summary = [];
  for (const t of TABLES) {
    try {
      const { rows } = await c.query(`SELECT * FROM ${t}`);
      dump.tables[t] = rows;
      summary.push(`${t}: ${rows.length}`);
    } catch (e) {
      dump.tables[t] = { error: e.message };
      summary.push(`${t}: ERREUR (${e.message})`);
    }
  }
  await c.end();

  const dir = path.join(__dirname, '..', 'backups');
  fs.mkdirSync(dir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const file = path.join(dir, `certivia-backup-${stamp}.json`);
  fs.writeFileSync(file, JSON.stringify(dump, null, 2), 'utf8');

  console.log('OK - Sauvegarde écrite :', file);
  console.log('     ' + summary.join(' | '));
})().catch(e => { console.error('Echec sauvegarde :', e.message); process.exit(1); });
