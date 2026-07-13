/* Source unique des informations légales de l'éditeur.
   ⚠️ Remplace chaque [À COMPLÉTER ...] par tes vraies informations avant d'ouvrir au public. */
export const COMPANY = {
  brand: 'Certivia',
  site: 'certivia.app',
  siteUrl: 'https://certivia.app',

  // Identité de l'éditeur (obligatoire dans les mentions légales)
  legalName: 'ENKEL SOLUTIONS',
  legalForm: 'SAS (société par actions simplifiée)',
  capital: '[À COMPLÉTER : capital social, ex. 1 000 €]',
  siren: '107 255 366',
  rcs: 'RCS Paris 107 255 366',
  vat: '', // laisser vide tant que non communiqué
  address: '8 bis rue Abel, 75012 Paris',
  domiciliation: 'I DOM YOU PARIS', // société domiciliée chez ce prestataire
  publisher: 'Sokaina ED-DIM',

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
