import Stripe from 'stripe';

/* Offres proposées. Le montant réel est défini dans Stripe ; `priceEnv` donne
   le nom de la variable d'environnement contenant l'ID du prix Stripe. */
export const PLANS = [
  {
    id: 'essentiel',
    name: 'Essentiel',
    price: '29 €',
    period: '/ mois HT',
    tagline: 'Pour démarrer sereinement',
    priceEnv: 'STRIPE_PRICE_ESSENTIEL',
    features: [
      'Cockpit des 32 indicateurs Qualiopi',
      'Sessions, stagiaires, satisfaction',
      'Bibliothèque de documents (PDF & Word)',
      'Espace stagiaire : émargement signé',
      '1 utilisateur',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '59 €',
    period: '/ mois HT',
    tagline: 'Pour les organismes structurés',
    highlight: true,
    priceEnv: 'STRIPE_PRICE_PRO',
    features: [
      'Tout de l’offre Essentiel',
      'Utilisateurs illimités',
      'Positionnement & tests de niveau en ligne',
      'Copilote IA et moteur de preuves',
      'Support prioritaire',
    ],
  },
];

export const planById = (id) => PLANS.find((p) => p.id === id);

/* Client Stripe (null si la facturation n'est pas configurée). */
export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  return key ? new Stripe(key) : null;
}

export const billingEnabled = () => !!process.env.STRIPE_SECRET_KEY;
