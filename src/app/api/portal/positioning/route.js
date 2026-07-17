import { NextResponse } from 'next/server';
import { q } from '@/lib/db';
import { genId } from '@/lib/auth';
import { verifyTraineeToken } from '@/lib/portal';
import { validateNeeds, scoreQuiz } from '@/lib/positioning';
import { clientIp, rateLimit, tooMany } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/* Dépôt du positionnement (analyse du besoin + QCM) par le stagiaire. */
export async function POST(req) {
  const rl = await rateLimit(req, { name: 'portal-positioning', max: 30, windowSec: 900 });
  if (!rl.ok) return tooMany(rl.retryAfter);

  const { token, sessionId, answers, quizAnswers } = await req.json();
  const auth = await verifyTraineeToken(token);
  if (!auth) return NextResponse.json({ error: 'Lien invalide ou expiré.' }, { status: 401 });
  if (!sessionId || !validateNeeds(answers)) {
    return NextResponse.json({ error: 'Merci de renseigner vos objectifs et votre niveau.' }, { status: 400 });
  }

  const rows = await q(
    `SELECT s.quiz FROM session_trainees st JOIN app_sessions s ON s.id = st.session_id
      WHERE st.session_id = $1 AND st.trainee_id = $2 AND st.tenant_id = $3`,
    [sessionId, auth.traineeId, auth.tenantId]
  );
  if (!rows.length) return NextResponse.json({ error: 'Session non autorisée.' }, { status: 403 });

  const scored = scoreQuiz(rows[0].quiz, quizAnswers);
  const cleanAnswers = {
    objectives: (answers.objectives || '').toString().slice(0, 2000),
    level: answers.level,
    experience: (answers.experience || '').toString().slice(0, 2000),
    constraints: (answers.constraints || '').toString().slice(0, 2000),
  };

  await q(
    `INSERT INTO positionings (id, tenant_id, session_id, trainee_id, answers, quiz_answers, score, signer_ip, submitted_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now())
     ON CONFLICT (session_id, trainee_id)
       DO UPDATE SET answers = EXCLUDED.answers, quiz_answers = EXCLUDED.quiz_answers, score = EXCLUDED.score, signer_ip = EXCLUDED.signer_ip, submitted_at = now()`,
    [genId('pos'), auth.tenantId, sessionId, auth.traineeId, JSON.stringify(cleanAnswers),
     JSON.stringify(Array.isArray(quizAnswers) ? quizAnswers : []), scored.total ? scored.score : null, clientIp(req)]
  );

  // Répercute sur le stagiaire (indicateur 8) : % si QCM, sinon le niveau déclaré.
  const posScore = scored.total ? `${scored.score}%` : (cleanAnswers.level || 'Fait');
  await q('UPDATE app_trainees SET positioning_score = $1 WHERE id = $2 AND tenant_id = $3',
    [posScore, auth.traineeId, auth.tenantId]);

  return NextResponse.json({ ok: true });
}
