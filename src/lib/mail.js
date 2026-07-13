/* Envoi d'e-mail via Resend (API HTTP). Sans RESEND_API_KEY : ne fait rien. */
async function send({ to, subject, html }) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM || 'Certivia <onboarding@resend.dev>';
  if (!key) return { sent: false, reason: 'no-key' };
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to, subject, html }),
    });
    if (!res.ok) return { sent: false, reason: await res.text() };
    return { sent: true };
  } catch (e) {
    return { sent: false, reason: e.message };
  }
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
