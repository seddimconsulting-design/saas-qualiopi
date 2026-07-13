/* Source unique des informations légales de l'éditeur.
   ⚠️ Remplace chaque [À COMPLÉTER ...] par tes vraies informations avant d'ouvrir au public. */
export const COMPANY = {
  brand: 'Certivia',
  site: 'certivia.app',
  siteUrl: 'https://certivia.app',

  // Identité de l'éditeur (obligatoire dans les mentions légales)
  legalName: '[À COMPLÉTER : raison sociale ou nom de l’exploitant]',
  legalForm: '[À COMPLÉTER : forme juridique — micro-entreprise, SASU, SAS…]',
  siret: '[À COMPLÉTER : n° SIRET]',
  rcs: '[À COMPLÉTER : ville d’immatriculation RCS, le cas échéant]',
  capital: '', // ex. "1 000 €" si société — laisser vide si non applicable
  vat: '[À COMPLÉTER : n° TVA intracommunautaire, le cas échéant]',
  address: '[À COMPLÉTER : adresse du siège / de l’exploitant]',
  publisher: '[À COMPLÉTER : nom du directeur de la publication]',

  // Contact (exercice des droits RGPD, support)
  contactEmail: 'seddim.consulting@gmail.com',

  // Hébergeur (obligatoire dans les mentions légales)
  host: 'Vercel Inc.',
  hostDetails: '340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis — https://vercel.com',

  // Date de dernière mise à jour des documents
  updatedAt: '13 juillet 2026',
};

// Sous-traitants (RGPD) — prestataires ayant accès aux données pour faire fonctionner le service.
export const SUBPROCESSORS = [
  { name: 'Vercel Inc. (États-Unis)', role: 'Hébergement de l’application' },
  { name: 'Neon Inc. (base hébergée aux États-Unis)', role: 'Hébergement de la base de données' },
  { name: 'Resend (États-Unis)', role: 'Envoi des e-mails transactionnels (réinitialisation de mot de passe)' },
];
