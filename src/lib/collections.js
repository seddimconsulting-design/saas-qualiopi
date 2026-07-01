import { q } from './db';

/*
 * Configuration des collections manipulées par le prototype.
 * `fields` mappe les clés JS (côté front) aux colonnes SQL.
 * `json` liste les colonnes stockées en JSONB.
 */
export const COLLECTIONS = {
  sessions: {
    table: 'app_sessions',
    order: 'created_at',
    fields: {
      title: 'title', trainer: 'trainer', start: 'start_date', end: 'end_date',
      duration: 'duration', status: 'status', trainees: 'trainees_count',
      handicap: 'handicap', handicapNote: 'handicap_note', price: 'price',
      modality: 'modality', docs: 'docs',
    },
    json: ['docs'],
    numbers: ['trainees', 'price'],
  },
  trainees: {
    table: 'app_trainees',
    order: 'created_at',
    fields: {
      first: 'first_name', last: 'last_name', email: 'email', phone: 'phone',
      disability: 'disability', score: 'positioning_score', satHot: 'sat_hot', satCold: 'sat_cold',
    },
    json: [],
  },
  veilles: {
    table: 'veilles',
    order: 'created_at',
    fields: { type: 'type', source: 'source', summary: 'summary', exploit: 'exploit', date: 'veille_date' },
    json: [],
  },
  reclamations: {
    table: 'reclamations',
    order: 'created_at',
    fields: { issuer: 'issuer', role: 'role', desc: 'description', status: 'status', reply: 'reply', date: 'rec_date' },
    json: [],
  },
  pac: {
    table: 'pac',
    order: 'created_at',
    fields: { action: 'action', indicator: 'indicator', trigger: 'trigger_event', owner: 'owner', deadline: 'deadline', status: 'status' },
    json: [],
  },
  clients: {
    table: 'clients',
    order: 'created_at',
    fields: { name: 'name', type: 'type', contact: 'contact', email: 'email', phone: 'phone', ca: 'ca' },
    json: [],
    numbers: ['ca'],
  },
  devis: {
    table: 'devis',
    order: 'created_at',
    fields: { client: 'client', session: 'session', amount: 'amount', status: 'status', date: 'devis_date' },
    json: [],
    numbers: ['amount'],
  },
  documents: {
    table: 'documents',
    order: 'created_at',
    fields: { filename: 'filename', indicator: 'indicator_id', confidence: 'confidence', justification: 'justification', status: 'status' },
    json: [],
    numbers: ['indicator', 'confidence'],
  },
};

const genId = (prefix) => `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}`;

/* Transforme une ligne SQL en objet côté front (clés JS). */
function fromRow(cfg, row) {
  const out = { id: row.id };
  const nums = cfg.numbers || [];
  for (const [js, col] of Object.entries(cfg.fields)) {
    let v = row[col];
    if (nums.includes(js) && v !== null && v !== undefined) v = Number(v);
    out[js] = v;
  }
  return out;
}

/* Normalise une valeur entrante avant insertion SQL. */
function toValue(cfg, js, raw) {
  if (cfg.json.includes(js)) return JSON.stringify(raw ?? {});
  if (raw === '' || raw === undefined) return null;
  return raw;
}

export async function listAll(name) {
  const cfg = COLLECTIONS[name];
  const rows = await q(`SELECT * FROM ${cfg.table} ORDER BY ${cfg.order} ASC`);
  return rows.map(r => fromRow(cfg, r));
}

export async function createOne(name, body) {
  const cfg = COLLECTIONS[name];
  const id = body.id || genId(name[0]);
  const cols = ['id'];
  const vals = [id];
  for (const [js, col] of Object.entries(cfg.fields)) {
    cols.push(col);
    vals.push(toValue(cfg, js, body[js]));
  }
  const ph = cols.map((_, i) => `$${i + 1}`).join(', ');
  const rows = await q(`INSERT INTO ${cfg.table} (${cols.join(', ')}) VALUES (${ph}) RETURNING *`, vals);
  return fromRow(cfg, rows[0]);
}

export async function updateOne(name, id, patch) {
  const cfg = COLLECTIONS[name];
  const sets = [];
  const vals = [];
  let i = 1;
  for (const [js, col] of Object.entries(cfg.fields)) {
    if (js in patch) {
      sets.push(`${col} = $${i++}`);
      vals.push(toValue(cfg, js, patch[js]));
    }
  }
  if (!sets.length) { const rows = await q(`SELECT * FROM ${cfg.table} WHERE id = $1`, [id]); return fromRow(cfg, rows[0]); }
  vals.push(id);
  const rows = await q(`UPDATE ${cfg.table} SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`, vals);
  return fromRow(cfg, rows[0]);
}

export async function deleteOne(name, id) {
  const cfg = COLLECTIONS[name];
  await q(`DELETE FROM ${cfg.table} WHERE id = $1`, [id]);
  return { ok: true };
}

/* Statuts manuels d'indicateurs (overrides). */
export async function listIndicatorStatus() {
  const rows = await q('SELECT indicator_id, status FROM indicator_status');
  const map = {};
  for (const r of rows) map[r.indicator_id] = r.status;
  return map;
}

export async function setIndicatorStatus(indicatorId, status) {
  await q(
    `INSERT INTO indicator_status (indicator_id, status) VALUES ($1, $2)
     ON CONFLICT (indicator_id) DO UPDATE SET status = EXCLUDED.status`,
    [indicatorId, status]
  );
  return { ok: true };
}
