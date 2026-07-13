import crypto from 'crypto';
import { q } from '@/lib/db';
import { sendVerificationEmail } from '@/lib/mail';

/* Génère un jeton de vérification (usage unique, 7 jours), le stocke haché
   et envoie l'e-mail de confirmation. */
export async function issueEmailVerification(userId, email, origin) {
  const token = crypto.randomBytes(32).toString('hex');
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  await q('DELETE FROM email_verifications WHERE user_id = $1', [userId]);
  await q('INSERT INTO email_verifications (token_hash, user_id, expires_at) VALUES ($1, $2, $3)', [hash, userId, expires]);
  const link = `${origin}/verify?token=${token}`;
  return sendVerificationEmail(email, link);
}
