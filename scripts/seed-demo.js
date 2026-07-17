/* Crée / met à jour un compte de démonstration "Certivia" complet et isolé,
   destiné à être montré aux prospects (essai gratuit).
   Tenant  : demo-certivia
   Accès   : demo@certivia.app / DemoCertivia2026
   Usage   : node scripts/seed-demo.js   (utilise DATABASE_URL de .env.local) */
require('dotenv').config({ path: '.env.local' });
const bcrypt = require('bcryptjs');
const { Client } = require('pg');

const T = 'demo-certivia';

// Statuts d'indicateurs : belle couverture, réaliste (pas 100 %).
const PARTIEL = new Set([5, 17, 25]);
const MANQUANT = new Set([30]);
const indicatorRows = Array.from({ length: 32 }, (_, i) => {
  const id = i + 1;
  const status = MANQUANT.has(id) ? 'manquant' : PARTIEL.has(id) ? 'partiel' : 'conforme';
  return `('${T}', ${id}, '${status}')`;
}).join(',\n ');

(async () => {
  const url = process.env.DATABASE_URL;
  if (!url) { console.error('DATABASE_URL manquant (.env.local)'); process.exit(1); }
  const isLocal = /localhost|127\.0\.0\.1/.test(url);
  const client = new Client({ connectionString: url, ssl: isLocal ? false : { rejectUnauthorized: false } });
  const hash = await bcrypt.hash('DemoCertivia2026', 10);

  const sql = `
-- Organisme de démonstration
INSERT INTO app_tenants (id, name, nda, address, email, phone) VALUES
 ('${T}', 'Certivia Formation (démo)', '11 75 12345 75', '12 rue de la Réussite, 75011 Paris', 'contact@certivia-demo.fr', '01 84 25 30 10')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, nda = EXCLUDED.nda, address = EXCLUDED.address, email = EXCLUDED.email, phone = EXCLUDED.phone;

-- Compte propriétaire de la démo
INSERT INTO app_users (id, tenant_id, email, password_hash, name, role) VALUES
 ('u-demo-certivia', '${T}', 'demo@certivia.app', '${hash}', 'Compte de démonstration', 'owner')
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, tenant_id = EXCLUDED.tenant_id, role = 'owner';

-- Sessions de formation
INSERT INTO app_sessions (id, title, trainer, start_date, end_date, duration, status, trainees_count, handicap, handicap_note, price, modality, docs, tenant_id) VALUES
 ('dc-s1', 'Manager une équipe hybride', 'Claire Fontaine', '2026-06-02', '2026-06-04', '21h', 'Terminé', 8, FALSE, '', 4200, 'Présentiel', '{"convention":true,"positioning":true,"attendance":true,"certificate":true}', '${T}'),
 ('dc-s2', 'Cybersécurité pour PME', 'Karim Benali', '2026-06-16', '2026-06-18', '14h', 'Terminé', 6, TRUE, 'Support audio fourni à M. Rey (déficience visuelle).', 3200, 'Distanciel', '{"convention":true,"positioning":true,"attendance":true,"certificate":true}', '${T}'),
 ('dc-s3', 'Prise de parole en public', 'Sophie Marchand', '2026-07-07', '2026-07-08', '14h', 'Actif', 10, FALSE, '', 2600, 'Présentiel', '{"convention":true,"positioning":true,"attendance":false,"certificate":false}', '${T}'),
 ('dc-s4', 'Comptabilité pour dirigeants', 'Antoine Lefèvre', '2026-09-15', '2026-09-17', '21h', 'Projet', 7, FALSE, '', 3900, 'Présentiel', '{"convention":false,"positioning":false,"attendance":false,"certificate":false}', '${T}')
ON CONFLICT (id) DO NOTHING;

-- Stagiaires
INSERT INTO app_trainees (id, first_name, last_name, email, phone, disability, positioning_score, sat_hot, sat_cold, tenant_id) VALUES
 ('dc-t1', 'Nadia', 'Cherif', 'n.cherif@exemple.fr', '06 11 22 33 44', '', '88%', 5, 5, '${T}'),
 ('dc-t2', 'Paul', 'Rey', 'p.rey@exemple.fr', '06 22 33 44 55', 'Déficience visuelle', '82%', 4, 4, '${T}'),
 ('dc-t3', 'Émilie', 'Garnier', 'e.garnier@exemple.fr', '06 33 44 55 66', '', '91%', 5, 4, '${T}'),
 ('dc-t4', 'Hugo', 'Petit', 'h.petit@exemple.fr', '06 44 55 66 77', '', '79%', 4, NULL, '${T}'),
 ('dc-t5', 'Léa', 'Moreau', 'l.moreau@exemple.fr', '06 55 66 77 88', '', 'Non fait', 5, 5, '${T}')
ON CONFLICT (id) DO NOTHING;

-- Veille
INSERT INTO veilles (id, type, source, summary, exploit, veille_date, tenant_id) VALUES
 ('dc-v1', 'Réglementaire (Ind. 23)', 'Journal Officiel', 'Renforcement des obligations de transparence sur le CPF au 2e semestre 2026.', 'CGV et devis standard mis à jour.', '2026-06-05', '${T}'),
 ('dc-v2', 'Métier (Ind. 24)', 'Baromètre du secteur', 'Montée en puissance de l''IA générative dans les métiers du tertiaire.', 'Ajout d''un module IA au catalogue.', '2026-06-20', '${T}')
ON CONFLICT (id) DO NOTHING;

-- Réclamations
INSERT INTO reclamations (id, issuer, role, description, status, reply, rec_date, tenant_id) VALUES
 ('dc-r1', 'OPCO EP', 'Financeur', 'Certificat de réalisation reçu avec quelques jours de retard.', 'Résolue', 'Process automatisé, certificat désormais émis sous 24h. Action tracée au PAC.', '2026-06-10', '${T}'),
 ('dc-r2', 'Mme Garnier', 'Stagiaire', 'Salle un peu bruyante lors de la première journée.', 'Résolue', 'Changement de salle dès le lendemain. Convention avec le lieu revue.', '2026-06-03', '${T}')
ON CONFLICT (id) DO NOTHING;

-- Plan d'amélioration continue
INSERT INTO pac (id, action, indicator, trigger_event, owner, deadline, status, tenant_id) VALUES
 ('dc-p1', 'Automatiser l''envoi du certificat de réalisation', 'Indicateur 31', 'Réclamation OPCO EP', 'Resp. Qualité', '2026-06-30', 'Terminé', '${T}'),
 ('dc-p2', 'Créer un module de formation à l''IA générative', 'Indicateur 24', 'Veille métier', 'Direction pédagogique', '2026-10-31', 'En cours', '${T}'),
 ('dc-p3', 'Mettre à jour la procédure d''accueil PSH', 'Indicateur 26', 'Audit interne', 'Référent handicap', '2026-08-15', 'En cours', '${T}')
ON CONFLICT (id) DO NOTHING;

-- Clients
INSERT INTO clients (id, name, type, contact, email, phone, ca, tenant_id) VALUES
 ('dc-c1', 'OPCO EP', 'Financeur', 'Sylvie Bernard', 's.bernard@opcoep.fr', '01 40 00 00 00', 7400, '${T}'),
 ('dc-c2', 'TechNova SAS', 'Entreprise', 'Marc Olivier', 'm.olivier@technova.fr', '01 45 00 00 00', 3200, '${T}'),
 ('dc-c3', 'Mairie de Bourg', 'Collectivité', 'Isabelle Fabre', 'i.fabre@bourg.fr', '04 70 00 00 00', 2600, '${T}')
ON CONFLICT (id) DO NOTHING;

-- Devis
INSERT INTO devis (id, client, session, amount, status, devis_date, tenant_id) VALUES
 ('dc-d1', 'TechNova SAS', 'Cybersécurité pour PME', 3200, 'Accepté', '2026-05-28', '${T}'),
 ('dc-d2', 'OPCO EP', 'Manager une équipe hybride', 4200, 'Accepté', '2026-05-15', '${T}'),
 ('dc-d3', 'Mairie de Bourg', 'Prise de parole en public', 2600, 'En attente', '2026-06-25', '${T}')
ON CONFLICT (id) DO NOTHING;

-- Documents classés (preuves)
INSERT INTO documents (id, filename, indicator_id, confidence, justification, status, tenant_id) VALUES
 ('dc-doc1', 'Convention_Manager_equipe.pdf', 9, 0.960, 'Convention de formation signée mentionnant objectifs et modalités.', 'validé', '${T}'),
 ('dc-doc2', 'Emargement_Cybersecurite.pdf', 11, 0.940, 'Feuille d''émargement complète attestant l''assiduité.', 'validé', '${T}'),
 ('dc-doc3', 'Certificat_realisation_Rey.pdf', 31, 0.980, 'Certificat de réalisation nominatif de fin de formation.', 'validé', '${T}'),
 ('dc-doc4', 'Positionnement_amont.pdf', 8, 0.910, 'Questionnaire de positionnement amont renseigné.', 'validé', '${T}')
ON CONFLICT (id) DO NOTHING;

-- Statuts d'indicateurs (couverture de démonstration)
INSERT INTO indicator_status (tenant_id, indicator_id, status) VALUES
 ${indicatorRows}
ON CONFLICT (tenant_id, indicator_id) DO NOTHING;

-- Inscriptions stagiaires ↔ sessions (pour l'émargement / espace stagiaire)
INSERT INTO session_trainees (tenant_id, session_id, trainee_id) VALUES
 ('${T}', 'dc-s1', 'dc-t1'), ('${T}', 'dc-s1', 'dc-t2'), ('${T}', 'dc-s1', 'dc-t3'),
 ('${T}', 'dc-s2', 'dc-t2'), ('${T}', 'dc-s2', 'dc-t4'),
 ('${T}', 'dc-s3', 'dc-t5')
ON CONFLICT (session_id, trainee_id) DO NOTHING;

-- Repart d'un émargement démo propre (les tests utilisaient des images factices)
DELETE FROM attendances WHERE tenant_id = '${T}';

-- QCM de positionnement de démonstration sur la session dc-s1
UPDATE app_sessions SET quiz = '[
  {"q":"Le management hybride combine :","options":["Uniquement du presentiel","Presentiel et distanciel","Uniquement du distanciel"],"correct":1},
  {"q":"Un bon manager a distance privilegie :","options":["Le controle permanent","La confiance et des points reguliers","Aucune communication"],"correct":1}
]'::jsonb
WHERE id = 'dc-s1' AND tenant_id = '${T}';
`;

  try {
    await client.connect();
    await client.query(sql);
    const { rows } = await client.query(
      'SELECT (SELECT count(*)::int FROM app_sessions WHERE tenant_id=$1) AS sessions, ' +
      '(SELECT count(*)::int FROM app_trainees WHERE tenant_id=$1) AS stagiaires, ' +
      '(SELECT count(*)::int FROM indicator_status WHERE tenant_id=$1) AS indicateurs', [T]);
    console.log('OK - Compte démo prêt : demo@certivia.app / DemoCertivia2026');
    console.log('     Données :', rows[0]);
  } catch (e) {
    console.error('Echec seed démo :', e.message);
    process.exit(1);
  } finally {
    await client.end();
  }
})();
