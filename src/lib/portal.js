import crypto from 'crypto';
import { q } from '@/lib/db';

const sha = (t) => crypto.createHash('sha256').update(t).digest('hex');

/* Crée (ou remplace) le jeton d'accès d'un stagiaire et renvoie le jeton brut.
   Durée de validité : 120 jours. */
export async function issueTraineeToken(traineeId, tenantId) {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString();
  await q('DELETE FROM trainee_tokens WHERE trainee_id = $1', [traineeId]);
  await q('INSERT INTO trainee_tokens (token_hash, trainee_id, tenant_id, expires_at) VALUES ($1, $2, $3, $4)',
    [sha(token), traineeId, tenantId, expires]);
  return token;
}

/* Vérifie un jeton stagiaire. Renvoie { traineeId, tenantId } ou null. */
export async function verifyTraineeToken(token) {
  if (!token) return null;
  const rows = await q('SELECT trainee_id, tenant_id, expires_at FROM trainee_tokens WHERE token_hash = $1', [sha(token)]);
  const rec = rows[0];
  if (!rec || new Date(rec.expires_at) < new Date()) return null;
  return { traineeId: rec.trainee_id, tenantId: rec.tenant_id };
}
