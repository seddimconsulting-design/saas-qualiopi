-- Schéma applicatif pragmatique : colle 1:1 aux objets du prototype (mono-tenant).
-- Le schéma normalisé "cible" reste dans schema.sql.

CREATE TABLE IF NOT EXISTS app_sessions (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    trainer TEXT,
    start_date TEXT,
    end_date TEXT,
    duration TEXT,
    status TEXT DEFAULT 'Projet',
    trainees_count INT DEFAULT 0,
    handicap BOOLEAN DEFAULT FALSE,
    handicap_note TEXT,
    price NUMERIC(10,2) DEFAULT 0,
    modality TEXT DEFAULT 'Présentiel',
    docs JSONB DEFAULT '{"convention":false,"positioning":false,"attendance":false,"certificate":false}',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS app_trainees (
    id TEXT PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    disability TEXT,
    positioning_score TEXT DEFAULT 'Non fait',
    sat_hot INT,
    sat_cold INT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS veilles (
    id TEXT PRIMARY KEY,
    type TEXT,
    source TEXT,
    summary TEXT,
    exploit TEXT,
    veille_date TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reclamations (
    id TEXT PRIMARY KEY,
    issuer TEXT,
    role TEXT,
    description TEXT,
    status TEXT DEFAULT 'En cours',
    reply TEXT,
    rec_date TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pac (
    id TEXT PRIMARY KEY,
    action TEXT,
    indicator TEXT,
    trigger_event TEXT,
    owner TEXT,
    deadline TEXT,
    status TEXT DEFAULT 'En cours',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT,
    contact TEXT,
    email TEXT,
    phone TEXT,
    ca NUMERIC(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS devis (
    id TEXT PRIMARY KEY,
    client TEXT,
    session TEXT,
    amount NUMERIC(10,2) DEFAULT 0,
    status TEXT DEFAULT 'En attente',
    devis_date TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS indicator_status (
    indicator_id INT PRIMARY KEY,
    status TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    filename TEXT,
    indicator_id INT,
    confidence NUMERIC(4,3),
    justification TEXT,
    status TEXT DEFAULT 'proposé',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Données de démonstration (idempotent) ───
INSERT INTO app_sessions (id, title, trainer, start_date, end_date, duration, status, trainees_count, handicap, handicap_note, price, modality, docs) VALUES
 ('s1', 'Développement Web Next.js', 'Guillaume S.', '2026-07-10', '2026-07-12', '14h', 'Projet', 5, TRUE, 'Supports en gros caractères pour Laurence Martin.', 2800, 'Présentiel', '{"convention":false,"positioning":false,"attendance":false,"certificate":false}'),
 ('s2', 'S''installer et pérenniser son OF', 'Thomas M.', '2026-06-15', '2026-06-18', '21h', 'Actif', 8, FALSE, '', 4200, 'Présentiel', '{"convention":true,"positioning":true,"attendance":false,"certificate":false}'),
 ('s3', 'RGPD & Gestion des données', 'Marie D.', '2026-05-01', '2026-05-02', '7h', 'Terminé', 4, FALSE, '', 1400, 'Distanciel', '{"convention":true,"positioning":true,"attendance":true,"certificate":true}')
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_trainees (id, first_name, last_name, email, phone, disability, positioning_score, sat_hot, sat_cold) VALUES
 ('t1', 'Laurence', 'Martin', 'l.martin@test.fr', '06 12 34 56 78', 'Déficience visuelle légère', '85%', 4, NULL),
 ('t2', 'Julien', 'Dupont', 'j.dupont@test.fr', '06 98 76 54 32', '', 'Non fait', 5, 4),
 ('t3', 'Sarah', 'Alami', 's.alami@test.fr', '07 11 22 33 44', '', '90%', 5, 5)
ON CONFLICT (id) DO NOTHING;

INSERT INTO veilles (id, type, source, summary, exploit, veille_date) VALUES
 ('v1', 'Réglementaire (Ind. 23)', 'Décret JO de la formation', 'Obligations de transparence renforcées sur le CPF dès juillet 2026.', 'Mise à jour des CGV et mention sur le devis standard.', '2026-06-01')
ON CONFLICT (id) DO NOTHING;

INSERT INTO reclamations (id, issuer, role, description, status, reply, rec_date) VALUES
 ('r1', 'OPCO Atlas', 'Financeur', 'Délai trop long pour la réception du certificat de réalisation.', 'Résolue', 'Certificat généré et renvoyé en 5 min. Action préventive intégrée dans le PAC.', '2026-05-10')
ON CONFLICT (id) DO NOTHING;

INSERT INTO pac (id, action, indicator, trigger_event, owner, deadline, status) VALUES
 ('p1', 'Automatiser l''envoi du certificat de réalisation', 'Indicateur 31', 'Réclamation OPCO', 'Resp. Qualité', '2026-06-30', 'Terminé')
ON CONFLICT (id) DO NOTHING;

INSERT INTO clients (id, name, type, contact, email, phone, ca) VALUES
 ('c1', 'OPCO Atlas', 'Financeur', 'Marie Leblanc', 'm.leblanc@opco.fr', '01 23 45 67 89', 4200),
 ('c2', 'BTP Formation', 'Prescripteur', 'Jacques Morin', 'j.morin@btp.fr', '01 98 76 54 32', 2800)
ON CONFLICT (id) DO NOTHING;

INSERT INTO devis (id, client, session, amount, status, devis_date) VALUES
 ('d1', 'BTP Formation', 'Développement Web Next.js', 2800, 'Accepté', '2026-06-10'),
 ('d2', 'OPCO Atlas', 'S''installer et pérenniser son OF', 4200, 'En attente', '2026-06-15')
ON CONFLICT (id) DO NOTHING;

-- ─── Multi-tenant : comptes & isolation des données ───
CREATE TABLE IF NOT EXISTS app_tenants (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    nda TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS app_users (
    id TEXT PRIMARY KEY,
    tenant_id TEXT REFERENCES app_tenants(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Colonne tenant_id sur toutes les tables de données
ALTER TABLE app_sessions ADD COLUMN IF NOT EXISTS tenant_id TEXT;
ALTER TABLE app_trainees ADD COLUMN IF NOT EXISTS tenant_id TEXT;
ALTER TABLE veilles      ADD COLUMN IF NOT EXISTS tenant_id TEXT;
ALTER TABLE reclamations ADD COLUMN IF NOT EXISTS tenant_id TEXT;
ALTER TABLE pac          ADD COLUMN IF NOT EXISTS tenant_id TEXT;
ALTER TABLE clients      ADD COLUMN IF NOT EXISTS tenant_id TEXT;
ALTER TABLE devis        ADD COLUMN IF NOT EXISTS tenant_id TEXT;
ALTER TABLE documents    ADD COLUMN IF NOT EXISTS tenant_id TEXT;

-- Tenant de démonstration (récupère les données d'exemple)
INSERT INTO app_tenants (id, name, nda) VALUES ('demo-tenant', 'Sokai Formation (démo)', '93123456789')
ON CONFLICT (id) DO NOTHING;

UPDATE app_sessions SET tenant_id = 'demo-tenant' WHERE tenant_id IS NULL;
UPDATE app_trainees SET tenant_id = 'demo-tenant' WHERE tenant_id IS NULL;
UPDATE veilles      SET tenant_id = 'demo-tenant' WHERE tenant_id IS NULL;
UPDATE reclamations SET tenant_id = 'demo-tenant' WHERE tenant_id IS NULL;
UPDATE pac          SET tenant_id = 'demo-tenant' WHERE tenant_id IS NULL;
UPDATE clients      SET tenant_id = 'demo-tenant' WHERE tenant_id IS NULL;
UPDATE devis        SET tenant_id = 'demo-tenant' WHERE tenant_id IS NULL;
UPDATE documents    SET tenant_id = 'demo-tenant' WHERE tenant_id IS NULL;

-- indicator_status devient multi-tenant (clé composite tenant_id + indicator_id)
ALTER TABLE indicator_status ADD COLUMN IF NOT EXISTS tenant_id TEXT;
UPDATE indicator_status SET tenant_id = 'demo-tenant' WHERE tenant_id IS NULL;
ALTER TABLE indicator_status DROP CONSTRAINT IF EXISTS indicator_status_pkey;
ALTER TABLE indicator_status ADD CONSTRAINT indicator_status_pkey PRIMARY KEY (tenant_id, indicator_id);

-- ─── Profil de l'organisme + rôles utilisateurs ───
ALTER TABLE app_tenants ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE app_tenants ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE app_tenants ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE app_tenants ADD COLUMN IF NOT EXISTS logo TEXT;
ALTER TABLE app_users   ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'member';

CREATE TABLE IF NOT EXISTS password_resets (
    token_hash TEXT PRIMARY KEY,
    user_id TEXT REFERENCES app_users(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);
-- Le premier utilisateur de chaque organisme est propriétaire
UPDATE app_users u SET role = 'owner'
WHERE role IS DISTINCT FROM 'owner'
  AND NOT EXISTS (SELECT 1 FROM app_users u2 WHERE u2.tenant_id = u.tenant_id AND u2.created_at < u.created_at);

-- ─── Vérification d'e-mail à l'inscription ───
-- DEFAULT TRUE : tous les comptes déjà existants (et ajoutés par un propriétaire)
-- sont considérés vérifiés ; seules les nouvelles inscriptions passent FALSE
-- explicitement (voir la route signup). Idempotent : ré-exécuter ne re-vérifie rien.
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT TRUE;

CREATE TABLE IF NOT EXISTS email_verifications (
    token_hash TEXT PRIMARY KEY,
    user_id TEXT REFERENCES app_users(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Limitation de débit (anti-abus) sur les routes sensibles ───
CREATE TABLE IF NOT EXISTS rate_limits (
    bucket TEXT PRIMARY KEY,
    count INT NOT NULL DEFAULT 0,
    reset_at TIMESTAMPTZ NOT NULL
);

-- ─── Espace stagiaire : inscriptions, accès par lien, émargement signé ───
-- Inscription d'un stagiaire à une session (relation N-N).
CREATE TABLE IF NOT EXISTS session_trainees (
    tenant_id  TEXT NOT NULL,
    session_id TEXT NOT NULL,
    trainee_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (session_id, trainee_id)
);

-- Jeton d'accès stagiaire (lien magique, un actif par stagiaire).
CREATE TABLE IF NOT EXISTS trainee_tokens (
    token_hash TEXT PRIMARY KEY,
    trainee_id TEXT NOT NULL,
    tenant_id  TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Émargement signé (une signature par demi-journée : session + stagiaire + créneau).
CREATE TABLE IF NOT EXISTS attendances (
    id         TEXT PRIMARY KEY,
    tenant_id  TEXT NOT NULL,
    session_id TEXT NOT NULL,
    trainee_id TEXT NOT NULL,
    slot       TEXT NOT NULL DEFAULT 'legacy',  -- créneau demi-journée, ex. 2026-06-02#AM
    signed_at  TIMESTAMPTZ DEFAULT now(),
    signature  TEXT,             -- image de la signature (data URL base64)
    signer_ip  TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (session_id, trainee_id, slot)
);
-- Migration des installations existantes (émargement par demi-journée)
ALTER TABLE attendances ADD COLUMN IF NOT EXISTS slot TEXT;
UPDATE attendances SET slot = 'legacy' WHERE slot IS NULL;
ALTER TABLE attendances ALTER COLUMN slot SET DEFAULT 'legacy';
ALTER TABLE attendances DROP CONSTRAINT IF EXISTS attendances_session_id_trainee_id_key;
DO $mig$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'attendances_session_trainee_slot_key') THEN
    ALTER TABLE attendances ADD CONSTRAINT attendances_session_trainee_slot_key UNIQUE (session_id, trainee_id, slot);
  END IF;
END $mig$;
