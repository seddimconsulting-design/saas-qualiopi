/* Envoi d'e-mail via Resend (API HTTP). Sans RESEND_API_KEY : ne fait rien. */
async function send({ to, subject, html, replyTo }) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM || 'Certivia <onboarding@resend.dev>';
  if (!key) return { sent: false, reason: 'no-key' };
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to, subject, html, ...(replyTo ? { reply_to: replyTo } : {}) }),
    });
    if (!res.ok) return { sent: false, reason: await res.text() };
    return { sent: true };
  } catch (e) {
    return { sent: false, reason: e.message };
  }
}

const esc = (s) => String(s).replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));

export function sendTraineeAccessEmail(to, traineeName, ofName, link) {
  return send({
    to,
    subject: `Votre espace formation${ofName ? ` — ${ofName}` : ''}`,
    html: wrap(`
      <p>Bonjour ${esc(traineeName || '')},</p>
      <p>${esc(ofName || 'Votre organisme de formation')} met à votre disposition un espace personnel pour signer votre présence (émargement) et suivre votre formation.</p>
      <p><a href="${link}" style="color:#059669;font-weight:bold">Accéder à mon espace</a></p>
      <p style="color:#777;font-size:12px">Ce lien vous est personnel, ne le partagez pas.</p>`),
  });
}

export function sendColdSurveyEmail(to, traineeName, ofName, link) {
  return send({
    to,
    subject: `Votre avis, 3 mois après votre formation${ofName ? ` — ${ofName}` : ''}`,
    html: wrap(`
      <p>Bonjour ${esc(traineeName || '')},</p>
      <p>Vous avez suivi une formation avec ${esc(ofName || 'notre organisme')} il y a environ 3 mois.
      Afin de mesurer les bénéfices dans la durée, merci de répondre à une courte évaluation « à froid » depuis votre espace :</p>
      <p><a href="${link}" style="color:#059669;font-weight:bold">Répondre à l'évaluation à froid</a></p>
      <p style="color:#777;font-size:12px">Ce lien vous est personnel, ne le partagez pas.</p>`),
  });
}

export function sendConvocationEmail(to, traineeName, ofName, session, link) {
  const dates = [session.start_date, session.end_date].filter(Boolean).join(' au ');
  return send({
    to,
    subject: `Convocation — ${session.title || 'votre formation'}`,
    html: wrap(`
      <p>Bonjour ${esc(traineeName || '')},</p>
      <p>Nous vous confirmons votre inscription à la formation <strong>${esc(session.title || '')}</strong>
      organisée par ${esc(ofName || 'notre organisme')}.</p>
      <ul>
        ${dates ? `<li><strong>Dates :</strong> ${esc(dates)}</li>` : ''}
        ${session.duration ? `<li><strong>Durée :</strong> ${esc(session.duration)}</li>` : ''}
        ${session.modality ? `<li><strong>Modalité :</strong> ${esc(session.modality)}</li>` : ''}
        ${session.trainer ? `<li><strong>Formateur :</strong> ${esc(session.trainer)}</li>` : ''}
      </ul>
      <p>Depuis votre espace personnel, vous pourrez signer votre présence à chaque demi-journée,
      remplir votre positionnement et récupérer vos documents :</p>
      <p><a href="${link}" style="color:#059669;font-weight:bold">Accéder à mon espace stagiaire</a></p>
      <p style="color:#777;font-size:12px">Besoin d'un aménagement (situation de handicap) ? Répondez à cet e-mail.</p>`),
  });
}

export function sendFeedbackEmail({ from, ofName, message }) {
  const to = process.env.FEEDBACK_TO || 'contact@certivia.app';
  return send({
    to,
    replyTo: from,
    subject: `Feedback Certivia — ${ofName || from}`,
    html: wrap(`
      <p><strong>De :</strong> ${esc(from)}${ofName ? ` (${esc(ofName)})` : ''}</p>
      <hr style="border:none;border-top:1px solid #eee;margin:12px 0" />
      <p style="white-space:pre-wrap">${esc(message)}</p>`),
  });
}

const wrap = (inner) => `<div style="font-family:Arial,sans-serif;font-size:14px;color:#1f2a44">${inner}</div>`;

export function sendResetEmail(to, link) {
  return send({
    to,
    subject: 'Réinitialisation de votre mot de passe',
    html: wrap(`
      <p>Bonjour,</p>
      <p>Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le lien ci-dessous (valable 1&nbsp;heure) :</p>
      <p><a href="${link}" style="color:#059669">${link}</a></p>
      <p style="color:#777">Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.</p>`),
  });
}

export function sendVerificationEmail(to, link) {
  return send({
    to,
    subject: 'Confirmez votre adresse e-mail — Certivia',
    html: wrap(`
      <p>Bienvenue sur Certivia&nbsp;!</p>
      <p>Pour activer pleinement votre compte, confirmez votre adresse e-mail en cliquant sur le lien ci-dessous (valable 7&nbsp;jours) :</p>
      <p><a href="${link}" style="color:#059669">${link}</a></p>
      <p style="color:#777">Si vous n'êtes pas à l'origine de cette inscription, ignorez cet e-mail.</p>`),
  });
}
