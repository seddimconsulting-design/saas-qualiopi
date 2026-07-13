/* Source unique des informations légales de l'éditeur.
   ⚠️ Remplace chaque [À COMPLÉTER ...] par tes vraies informations avant d'ouvrir au public. */
export const COMPANY = {
  brand: 'Certivia',
  site: 'certivia.app',
  siteUrl: 'https://certivia.app',

  // Identité de l'éditeur (obligatoire dans les mentions légales)
  legalName: 'Certivia',
  legalForm: 'Entrepreneur individuel (EI)',
  siret: '977 463 900 00018',
  rcs: '', // non applicable pour un EI
  capital: '', // non applicable pour un EI
  vat: '', // laisser vide si franchise en base de TVA
  address: '10 Grande Rue des Fabres, 13800 Istres',
  publisher: '[À COMPLÉTER : ton nom et prénom (obligatoire pour un EI)]',

  // Contact (exercice des droits RGPD, support)
  contactEmail: 'contact@certivia.app',

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
