/* Référentiel National Qualité (RNQ) — Qualiopi.
   Source : arrêté du 6 juin 2019 modifié et Guide de lecture du ministère du Travail.
   32 indicateurs répartis en 7 critères : 22 relèvent du socle commun,
   10 sont conditionnels (certification, apprentissage/CFA, sous-traitance, AFEST).

   `requires` : null = socle commun (toujours applicable) ;
   sinon liste de profils d'activité dont AU MOINS UN doit être actif. */

export const CRITERES = {
  1: "Information du public",
  2: "Identification des objectifs et adaptation des prestations",
  3: "Accueil, suivi et évaluation des bénéficiaires",
  4: "Moyens pédagogiques, techniques et d'encadrement",
  5: "Qualification et développement des connaissances du personnel",
  6: "Inscription dans son environnement professionnel",
  7: "Recueil et prise en compte des appréciations et réclamations",
};

/* Profils d'activité de l'organisme (déterminent les indicateurs applicables). */
export const PROFILS = [
  { id: 'certifiant', label: 'Formations certifiantes (RNCP/RS)' },
  { id: 'apprentissage', label: 'Apprentissage / alternance (CFA)' },
  { id: 'sousTraitance', label: 'Recours à la sous-traitance / portage salarial' },
  { id: 'afest', label: 'Formation en situation de travail (AFEST)' },
];

export const INDICATEURS_CATALOG = [
  // ── Critère 1 — Information du public ──
  { id: 1, crit: 1, requires: null, label: "Information accessible, détaillée et vérifiable sur les prestations",
    attendu: "Diffuser une information publique complète : prérequis, objectifs, durée, modalités, délais d'accès, tarifs, contacts, accessibilité.",
    kw: ["catalogue", "information du public", "fiche formation", "prérequis", "délai d'accès", "tarif"] },
  { id: 2, crit: 1, requires: null, label: "Diffusion d'indicateurs de résultats",
    attendu: "Publier des indicateurs de résultats adaptés aux prestations et aux publics (satisfaction, réussite, assiduité).",
    kw: ["taux de réussite", "taux de satisfaction", "indicateurs de résultats", "statistiques"] },
  { id: 3, crit: 1, requires: ['certifiant', 'apprentissage'], label: "Taux d'obtention, passerelles, suites de parcours et débouchés",
    attendu: "Informer sur les taux d'obtention de la certification, blocs de compétences, équivalences, passerelles et débouchés.",
    kw: ["taux d'obtention", "bloc de compétences", "passerelle", "équivalence", "débouché", "rncp"] },

  // ── Critère 2 — Objectifs et adaptation ──
  { id: 4, crit: 2, requires: null, label: "Analyse du besoin du bénéficiaire",
    attendu: "Analyser le besoin du bénéficiaire en lien avec l'entreprise et/ou le financeur avant l'entrée en formation.",
    kw: ["analyse du besoin", "recueil du besoin", "cahier des charges", "entretien préalable", "expression du besoin"] },
  { id: 5, crit: 2, requires: null, label: "Objectifs opérationnels et évaluables",
    attendu: "Définir des objectifs pédagogiques opérationnels, précis et évaluables pour chaque prestation.",
    kw: ["objectifs pédagogiques", "objectifs opérationnels", "compétences visées"] },
  { id: 6, crit: 2, requires: null, label: "Contenus et modalités adaptés aux objectifs et aux publics",
    attendu: "Adapter contenus, durées, modalités et méthodes pédagogiques aux objectifs et aux publics visés.",
    kw: ["programme de formation", "contenu pédagogique", "modalités pédagogiques", "méthodes pédagogiques", "déroulé"] },
  { id: 7, crit: 2, requires: ['certifiant', 'apprentissage'], label: "Adéquation des contenus aux exigences de la certification",
    attendu: "Vérifier l'adéquation du contenu de la formation au référentiel de la certification visée.",
    kw: ["référentiel de certification", "adéquation", "bloc de compétences", "exigences de la certification"] },
  { id: 8, crit: 2, requires: null, label: "Positionnement et évaluation des acquis à l'entrée",
    attendu: "Formaliser les procédures de positionnement et d'évaluation des acquis à l'entrée de la prestation.",
    kw: ["positionnement", "test d'entrée", "évaluation amont", "diagnostic initial", "prérequis vérifiés"] },

  // ── Critère 3 — Accueil, suivi et évaluation ──
  { id: 9, crit: 3, requires: null, label: "Information sur les conditions de déroulement",
    attendu: "Informer les bénéficiaires des conditions de déroulement : lieux, horaires, règlement intérieur, contacts, modalités d'évaluation.",
    kw: ["convocation", "règlement intérieur", "livret d'accueil", "conditions de déroulement", "convention"] },
  { id: 10, crit: 3, requires: null, label: "Mise en œuvre et adaptation de la prestation et du suivi",
    attendu: "Mettre en œuvre et adapter la prestation, l'accompagnement et le suivi aux publics bénéficiaires.",
    kw: ["adaptation", "accompagnement", "suivi individualisé", "aménagement du parcours"] },
  { id: 11, crit: 3, requires: null, label: "Évaluation de l'atteinte des objectifs",
    attendu: "Évaluer l'atteinte des objectifs par les bénéficiaires (en cours et en fin de prestation) et en conserver la trace.",
    kw: ["évaluation des acquis", "évaluation finale", "certificat de réalisation", "attestation de fin", "quiz", "test"] },
  { id: 12, crit: 3, requires: null, label: "Engagement des bénéficiaires et prévention des ruptures",
    attendu: "Mettre en œuvre des mesures favorisant l'engagement (assiduité, émargement, relances) et prévenant les abandons.",
    kw: ["émargement", "feuille de présence", "assiduité", "engagement", "abandon", "rupture de parcours"] },
  { id: 13, crit: 3, requires: ['apprentissage'], label: "Coordination et progressivité entre centre et entreprise",
    attendu: "Assurer la coordination et la progressivité des apprentissages entre le centre de formation et l'entreprise.",
    kw: ["livret d'apprentissage", "maître d'apprentissage", "tuteur", "coordination entreprise"] },
  { id: 14, crit: 3, requires: ['apprentissage'], label: "Accompagnement socio-professionnel et citoyenneté",
    attendu: "Assurer un accompagnement socio-professionnel, éducatif et relatif à l'exercice de la citoyenneté.",
    kw: ["accompagnement socio-professionnel", "citoyenneté", "médiateur", "vie scolaire"] },
  { id: 15, crit: 3, requires: ['apprentissage'], label: "Information des apprentis sur droits, devoirs et santé-sécurité",
    attendu: "Informer les apprentis de leurs droits et devoirs ainsi que des règles de santé et sécurité.",
    kw: ["droits et devoirs", "santé sécurité", "règlement apprenti", "sécurité au travail"] },
  { id: 16, crit: 3, requires: ['certifiant', 'apprentissage'], label: "Respect des exigences de l'autorité de certification",
    attendu: "Respecter les exigences formelles de l'autorité de certification pour la présentation des candidats.",
    kw: ["autorité de certification", "présentation des candidats", "jury", "inscription à l'examen"] },

  // ── Critère 4 — Moyens ──
  { id: 17, crit: 4, requires: null, label: "Moyens humains, techniques et environnement approprié",
    attendu: "Mettre à disposition des moyens humains et techniques adaptés et un environnement approprié (locaux, équipements).",
    kw: ["moyens techniques", "locaux", "salle de formation", "matériel", "plateforme", "moyens humains"] },
  { id: 18, crit: 4, requires: null, label: "Mobilisation et coordination des intervenants",
    attendu: "Mobiliser et coordonner les intervenants internes et externes concourant à la prestation.",
    kw: ["coordination", "réunion pédagogique", "intervenants", "équipe pédagogique"] },
  { id: 19, crit: 4, requires: null, label: "Ressources pédagogiques et appropriation par les bénéficiaires",
    attendu: "Mettre à disposition des ressources pédagogiques et s'assurer de leur appropriation par les bénéficiaires.",
    kw: ["support de cours", "ressources pédagogiques", "supports remis", "documentation"] },
  { id: 20, crit: 4, requires: ['apprentissage'], label: "Personnel dédié (mobilité, référent handicap, conseil de perfectionnement)",
    attendu: "Disposer d'un personnel dédié à la mobilité, d'un référent handicap et d'un conseil de perfectionnement.",
    kw: ["conseil de perfectionnement", "référent mobilité", "référent handicap", "personnel dédié"] },

  // ── Critère 5 — Personnel ──
  { id: 21, crit: 5, requires: null, label: "Compétences des intervenants déterminées, mobilisées et évaluées",
    attendu: "Déterminer, mobiliser et évaluer les compétences des intervenants (CV, diplômes, expérience, évaluation).",
    kw: ["cv", "curriculum", "diplôme", "qualification", "formateur", "compétences intervenants"] },
  { id: 22, crit: 5, requires: null, label: "Entretien et développement des compétences des salariés",
    attendu: "Entretenir et développer les compétences des personnels (plan de développement, formations suivies).",
    kw: ["plan de développement des compétences", "formation des formateurs", "entretien professionnel"] },

  // ── Critère 6 — Environnement professionnel ──
  { id: 23, crit: 6, requires: null, label: "Veille légale et réglementaire",
    attendu: "Réaliser une veille légale et réglementaire sur la formation professionnelle et en exploiter les enseignements.",
    kw: ["veille légale", "veille réglementaire", "décret", "journal officiel", "loi", "réglementation"] },
  { id: 24, crit: 6, requires: null, label: "Veille sur les compétences, métiers et emplois",
    attendu: "Réaliser une veille sur les évolutions des compétences, des métiers et des emplois de ses secteurs.",
    kw: ["veille métier", "évolution des métiers", "emploi", "branche professionnelle", "compétences du secteur"] },
  { id: 25, crit: 6, requires: null, label: "Veille sur les innovations pédagogiques et technologiques",
    attendu: "Réaliser une veille sur les innovations pédagogiques et technologiques et faire évoluer ses prestations.",
    kw: ["innovation pédagogique", "veille technologique", "nouvelle méthode", "outil numérique", "digital learning"] },
  { id: 26, crit: 6, requires: null, label: "Accueil des publics en situation de handicap",
    attendu: "Mobiliser expertises, outils et réseaux pour accueillir les personnes en situation de handicap (référent, adaptations, partenaires).",
    kw: ["handicap", "accessibilité", "psh", "agefiph", "aménagement", "référent handicap", "compensation"] },
  { id: 27, crit: 6, requires: ['sousTraitance'], label: "Conformité des sous-traitants et salariés portés",
    attendu: "Vérifier le respect des exigences du référentiel par les sous-traitants ou salariés portés (contrats, contrôle).",
    kw: ["sous-traitance", "sous-traitant", "contrat-cadre", "portage salarial", "prestataire externe"] },
  { id: 28, crit: 6, requires: ['afest'], label: "Réseau de partenaires et accueil en entreprise (AFEST)",
    attendu: "Mobiliser un réseau de partenaires pour co-construire l'ingénierie et favoriser l'accueil en entreprise.",
    kw: ["afest", "situation de travail", "partenaires", "co-construction", "tuteur entreprise"] },
  { id: 29, crit: 6, requires: ['apprentissage'], label: "Actions d'insertion professionnelle et poursuite d'études",
    attendu: "Développer des actions concourant à l'insertion professionnelle ou à la poursuite d'études.",
    kw: ["insertion professionnelle", "poursuite d'études", "placement", "forum emploi"] },

  // ── Critère 7 — Appréciations et amélioration ──
  { id: 30, crit: 7, requires: null, label: "Recueil des appréciations des parties prenantes",
    attendu: "Recueillir les appréciations des bénéficiaires, financeurs, entreprises et équipes (satisfaction à chaud et à froid).",
    kw: ["satisfaction", "questionnaire", "enquête", "appréciation", "évaluation à chaud", "à froid", "parties prenantes"] },
  { id: 31, crit: 7, requires: null, label: "Traitement des difficultés, réclamations et aléas",
    attendu: "Mettre en œuvre des modalités de traitement des difficultés rencontrées, des réclamations et des aléas.",
    kw: ["réclamation", "plainte", "litige", "aléa", "incident", "non-conformité", "action corrective"] },
  { id: 32, crit: 7, requires: null, label: "Mesures d'amélioration continue",
    attendu: "Mettre en œuvre des mesures d'amélioration à partir de l'analyse des appréciations et réclamations.",
    kw: ["amélioration continue", "plan d'amélioration", "action préventive", "pac", "bilan qualité"] },
];

/* Attendu d'un indicateur par id. */
export const attenduOf = (id) => INDICATEURS_CATALOG.find(i => i.id === id)?.attendu || null;

/* Référentiel injecté dans le prompt IA (grounding). */
export const catalogForPrompt = () =>
  INDICATEURS_CATALOG.map(i => `${i.id}. ${i.label} — attendu : ${i.attendu}`).join("\n");

/* Un indicateur s'applique-t-il au profil d'activité de l'organisme ? */
export function isApplicable(indicator, profil = {}) {
  if (!indicator.requires) return true;
  return indicator.requires.some(flag => !!profil[flag]);
}

/* Liste des indicateurs applicables à un profil donné. */
export const applicableIndicators = (profil = {}) =>
  INDICATEURS_CATALOG.filter(i => isApplicable(i, profil));
