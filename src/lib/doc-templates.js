/* Bibliothèque de modèles de documents conformes Qualiopi.
   Chaque modèle est rattaché à un ou plusieurs indicateurs RNQ. Contenu générique à
   personnaliser par l'organisme. Les jetons {{...}} sont remplis avec les données réelles
   (session / stagiaire) lors de la génération. A valider selon votre activité et l'arrêté RNQ V9. */

export const OF = {
  name: 'Sokai Formation',
  nda: '93123456789',
};

export const TEMPLATES = [
  {
    id: 'convention', indicators: [25], title: 'Convention de formation professionnelle',
    intro: "Entre l'organisme de formation soussigné et le client (l'entreprise ou le bénéficiaire), il est convenu ce qui suit, en application des articles L.6353-1 et suivants du Code du travail.",
    sections: [
      { h: 'Article 1 — Objet et nature de l\'action', body: "La présente convention a pour objet la réalisation d'une action de formation professionnelle entrant dans le champ de l'article L.6313-1 du Code du travail." },
      { h: 'Article 2 — Intitulé, durée et effectif', body: "Intitulé de l'action : {{sessionTitle}}. Durée totale : {{duration}}. Dates : du {{startDate}} au {{endDate}}. Nombre de participants : {{traineesCount}}." },
      { h: 'Article 3 — Modalités et moyens pédagogiques', body: "Modalité : {{modality}}. Moyens mobilisés : supports pédagogiques, plateforme, exercices et évaluations. Une attestation de fin de formation sera remise à chaque participant." },
      { h: 'Article 4 — Prix et modalités de règlement', body: "Le coût de l'action s'élève à {{price}} € net de taxe, réglable à réception de facture. En cas de prise en charge par un financeur, le règlement s'effectue selon les modalités convenues avec celui-ci." },
      { h: 'Article 5 — Dédit, abandon et différend', body: "En cas d'annulation à l'initiative du client moins de …… jours avant le début de l'action, ……. En cas de différend, les parties s'efforcent de le régler à l'amiable." },
    ],
    signature: true,
  },
  {
    id: 'reglement-interieur', indicators: [9], title: 'Règlement intérieur',
    intro: "Le présent règlement intérieur s'applique à tous les participants aux actions de formation dispensées par l'organisme, conformément aux articles L.6352-3 et suivants du Code du travail.",
    sections: [
      { h: 'Objet et champ d\'application', body: "Il définit les règles d'hygiène, de sécurité et de discipline applicables durant la formation." },
      { h: 'Horaires et assiduité', body: "Les participants respectent les horaires communiqués et signent la feuille d'émargement par demi-journée. Toute absence doit être justifiée." },
      { h: 'Hygiène et sécurité', body: "Chaque participant respecte les consignes de sécurité du lieu de formation et prend connaissance des consignes d'évacuation." },
      { h: 'Discipline et sanctions', body: "Tout comportement fautif peut faire l'objet d'un avertissement, dans le respect de la procédure contradictoire prévue par le Code du travail." },
      { h: 'Représentation des stagiaires', body: "Pour les actions de plus de 500 heures, il est procédé à l'élection d'un délégué des stagiaires." },
    ],
  },
  {
    id: 'programme', indicators: [2, 5, 6], title: 'Programme de formation',
    intro: "Ce programme précise les objectifs, le contenu et les modalités de l'action de formation.",
    sections: [
      { h: 'Objectifs pédagogiques', body: "À l'issue de la formation, le participant sera capable de : ……… (objectifs opérationnels et évaluables)." },
      { h: 'Public visé et prérequis', body: "Public : ………. Prérequis : ………." },
      { h: 'Contenu', body: "Module 1 : ………. Module 2 : ………. Module 3 : ………." },
      { h: 'Durée et modalités', body: "Durée : {{duration}}. Modalité : {{modality}}. Effectif : de …… à …… participants." },
      { h: 'Méthodes et moyens pédagogiques', body: "Apports théoriques, mises en situation, supports remis, évaluations formatives." },
      { h: 'Modalités d\'évaluation', body: "Évaluation des acquis en cours et en fin de formation (quiz, exercices, mise en situation). Une attestation de fin de formation est délivrée." },
      { h: 'Accessibilité aux personnes en situation de handicap', body: "Pour tout besoin d'adaptation, contactez notre référent handicap (voir fiche dédiée)." },
    ],
  },
  {
    id: 'emargement', indicators: [12], title: 'Feuille d\'émargement',
    intro: "Intitulé de la session : {{sessionTitle}}. Dates : du {{startDate}} au {{endDate}}. Formateur : {{trainer}}. Lieu : …………",
    sections: [
      { h: 'Attestation de présence', body: "Les participants attestent de leur présence à la session par leur signature, par demi-journée." },
      { h: 'Participants (matin / après-midi)', body: "1. Nom Prénom …………………………  Signature matin ……………  Signature après-midi ……………\n2. Nom Prénom …………………………  Signature matin ……………  Signature après-midi ……………\n3. Nom Prénom …………………………  Signature matin ……………  Signature après-midi ……………\n4. Nom Prénom …………………………  Signature matin ……………  Signature après-midi ……………" },
      { h: 'Formateur', body: "Nom du formateur : {{trainer}}  Signature : ……………" },
    ],
  },
  {
    id: 'positionnement', indicators: [8, 27], title: 'Fiche de positionnement et d\'analyse du besoin',
    intro: "Cette fiche est renseignée avant l'entrée en formation afin d'adapter la prestation au bénéficiaire.",
    sections: [
      { h: 'Identité du bénéficiaire', body: "Nom / Prénom : {{traineeName}}. Courriel : {{traineeEmail}}. Fonction : ………. Entreprise : ………." },
      { h: 'Attentes et objectifs', body: "Objectifs visés par le bénéficiaire / l'entreprise : ………." },
      { h: 'Prérequis et niveau initial', body: "Prérequis vérifiés : oui / non. Niveau initial estimé : ………." },
      { h: 'Adaptations nécessaires', body: "Besoin d'aménagement (handicap, contraintes) : ……… (voir référent handicap si besoin)." },
    ],
  },
  {
    id: 'satisfaction-chaud', indicators: [13, 29], title: 'Questionnaire de satisfaction à chaud',
    intro: "Merci de donner votre avis à l'issue de la formation (1 = pas du tout satisfait, 5 = très satisfait).",
    sections: [
      { h: 'Organisation et accueil', body: "Qualité de l'organisation et de l'accueil : 1  2  3  4  5" },
      { h: 'Contenu et objectifs', body: "Adéquation du contenu aux objectifs annoncés : 1  2  3  4  5" },
      { h: 'Animation et formateur', body: "Qualité de l'animation et des explications : 1  2  3  4  5" },
      { h: 'Moyens pédagogiques', body: "Qualité des supports et moyens : 1  2  3  4  5" },
      { h: 'Recommandation', body: "Recommanderiez-vous cette formation ? Oui / Non. Commentaires libres : ………." },
    ],
  },
  {
    id: 'satisfaction-froid', indicators: [14], title: 'Questionnaire d\'évaluation à froid (J+90)',
    intro: "Environ 3 mois après la formation, merci d'évaluer sa mise en application.",
    sections: [
      { h: 'Mise en application', body: "Avez-vous mis en pratique les acquis de la formation ? Oui / Partiellement / Non. Précisez : ………." },
      { h: 'Impact', body: "Quel impact sur votre activité professionnelle ? ………." },
      { h: 'Besoins complémentaires', body: "Auriez-vous besoin d'un approfondissement ou d'une autre formation ? ………." },
    ],
  },
  {
    id: 'attestation-fin', indicators: [10], title: 'Certificat de réalisation',
    intro: "L'organisme de formation atteste de la réalisation de l'action de formation ci-dessous.",
    sections: [
      { h: 'Bénéficiaire', body: "Je soussigné(e), représentant de l'organisme, atteste que : Nom / Prénom : {{traineeName}} a suivi l'action de formation suivante." },
      { h: 'Action de formation', body: "Intitulé : {{sessionTitle}}. Nature : action de formation. Durée : {{duration}}. Dates : du {{startDate}} au {{endDate}}." },
      { h: 'Résultat', body: "La formation a été suivie en totalité et les objectifs pédagogiques ont été atteints / partiellement atteints." },
    ],
    signature: true,
  },
  {
    id: 'procedure-reclamation', indicators: [30], title: 'Procédure de traitement des réclamations',
    intro: "Cette procédure décrit les modalités de recueil et de traitement des réclamations des parties prenantes.",
    sections: [
      { h: 'Objet', body: "Garantir le traitement de toute réclamation d'un bénéficiaire, financeur ou partenaire dans une démarche d'amélioration continue." },
      { h: 'Modalités de dépôt', body: "Toute réclamation peut être adressée par e-mail ou courrier à l'organisme, qui en accuse réception sous …… jours ouvrés." },
      { h: 'Traitement et délais', body: "La réclamation est enregistrée dans le registre dédié, analysée, et une réponse est apportée sous …… jours ouvrés." },
      { h: 'Clôture et amélioration', body: "Les réclamations récurrentes alimentent le plan d'amélioration continue (indicateurs 31 et 32)." },
    ],
  },
  {
    id: 'fiche-non-conformite', indicators: [31], title: 'Fiche de non-conformité et action corrective',
    intro: "Cette fiche formalise le traitement d'une non-conformité identifiée.",
    sections: [
      { h: 'Description de la non-conformité', body: "Date : ……/……/………. Origine (audit, réclamation, constat interne) : ………. Description : ………." },
      { h: 'Analyse des causes', body: "Cause(s) racine identifiée(s) : ………." },
      { h: 'Action corrective', body: "Action décidée : ………. Responsable : ………. Échéance : ……/……/………." },
      { h: 'Vérification d\'efficacité', body: "Date de vérification : ……/……/………. L'action est-elle efficace ? Oui / Non. Clôture : ………." },
    ],
  },
  {
    id: 'sous-traitance', indicators: [22], title: 'Contrat-cadre de sous-traitance pédagogique',
    intro: "Entre l'organisme donneur d'ordre et l'intervenant sous-traitant, il est convenu ce qui suit.",
    sections: [
      { h: 'Objet', body: "Le sous-traitant réalise, pour le compte de l'organisme, tout ou partie d'actions de formation confiées ponctuellement." },
      { h: 'Obligations du sous-traitant', body: "Le sous-traitant s'engage à respecter les exigences du Référentiel National Qualité applicables à sa prestation et à fournir les preuves associées (émargements, évaluations)." },
      { h: 'Confidentialité et données', body: "Le sous-traitant respecte la confidentialité et la réglementation applicable aux données personnelles (RGPD)." },
      { h: 'Rémunération et durée', body: "Rémunération : ………. Durée du contrat-cadre : ………, renouvelable." },
    ],
    signature: true,
  },
  {
    id: 'referent-handicap', indicators: [4], title: 'Fiche référent handicap et procédure d\'accessibilité',
    intro: "Cette fiche formalise l'organisation de l'organisme pour l'accueil des personnes en situation de handicap.",
    sections: [
      { h: 'Référent handicap', body: "Nom du référent : ………. Coordonnées (e-mail / téléphone) : ………." },
      { h: 'Procédure d\'accueil', body: "Dès l'expression d'un besoin, un entretien est proposé pour identifier les aménagements nécessaires (pédagogiques, matériels, organisationnels)." },
      { h: 'Réseau de partenaires', body: "L'organisme s'appuie sur un réseau spécialisé : Agefiph, Cap emploi, MDPH, et centres ressources handicap." },
      { h: 'Adaptations possibles', body: "Exemples : supports adaptés, temps majoré, aménagement des locaux, modalités à distance." },
    ],
  },
  {
    id: 'info-publique', indicators: [1, 3], title: 'Fiche d\'information publique (mentions catalogue)',
    intro: "Informations rendues publiques pour chaque action de formation (site web, catalogue, devis).",
    sections: [
      { h: 'Intitulé, objectifs et résultats', body: "Intitulé : ………. Objectifs : ………. Résultats / indicateurs communiqués : ………." },
      { h: 'Public, prérequis et modalités', body: "Public visé : ………. Prérequis : ………. Modalités : présentiel / distanciel." },
      { h: 'Délais et modalités d\'accès', body: "Délai d'accès après demande : ……… jours. Modalités d'inscription : ………. Tarif : ………." },
      { h: 'Accessibilité et contact', body: "Accessibilité aux personnes en situation de handicap : contacter le référent handicap. Contact : ………." },
    ],
  },
  {
    id: 'fiche-formateur', indicators: [7, 18], title: 'Fiche de qualification du formateur',
    intro: "Cette fiche justifie la qualification et les compétences du formateur intervenant.",
    sections: [
      { h: 'Identité et domaine', body: "Nom / Prénom : ………. Domaine d'expertise : ………." },
      { h: 'Diplômes et titres', body: "Diplômes : ………. Certifications / habilitations : ………." },
      { h: 'Expérience professionnelle', body: "Nombre d'années d'expérience : ………. Secteurs : ………." },
      { h: 'Compétences pédagogiques', body: "Expérience de formation, méthodes maîtrisées, formations suivies : ………." },
    ],
  },
  {
    id: 'plan-competences', indicators: [19], title: 'Plan de développement des compétences des personnels',
    intro: "Suivi de l'entretien et du développement des compétences de l'équipe pédagogique et administrative.",
    sections: [
      { h: 'Personnel concerné', body: "Nom : ………. Fonction : ………." },
      { h: 'Actions de développement', body: "Formations, veille, échanges de pratiques prévus : ………." },
      { h: 'Échéances et suivi', body: "Échéance : ………. Réalisé : oui / non. Bilan : ………." },
    ],
  },
  {
    id: 'fiche-moyens', indicators: [20], title: 'Fiche des moyens techniques et pédagogiques',
    intro: "Description des moyens techniques et pédagogiques mis à disposition des apprenants.",
    sections: [
      { h: 'Moyens techniques', body: "Matériel, plateforme LMS, équipements, outils utilisés : ………." },
      { h: 'Ressources pédagogiques', body: "Supports de cours, exercices, ressources en ligne : ………." },
      { h: 'Mise à disposition', body: "Modalités d'accès des apprenants aux ressources : ………." },
    ],
  },
  {
    id: 'attestation-locaux', indicators: [21], title: 'Fiche des locaux et accessibilité',
    intro: "Description des locaux de formation et de leur accessibilité.",
    sections: [
      { h: 'Locaux', body: "Adresse : ………. Capacité d'accueil : ………. Équipements des salles : ………." },
      { h: 'Accessibilité PMR', body: "Conformité ERP / accessibilité aux personnes à mobilité réduite : ………." },
      { h: 'Sécurité', body: "Consignes de sécurité et d'évacuation affichées : oui / non." },
    ],
  },
  {
    id: 'procedure-veille', indicators: [23, 24], title: 'Procédure et journal de veille',
    intro: "Organisation de la veille légale, réglementaire, métiers et innovations pédagogiques.",
    sections: [
      { h: 'Objet et sources', body: "Sources suivies (Journal officiel, OPCO, presse spécialisée, réseaux professionnels) : ………." },
      { h: 'Fréquence', body: "Périodicité de la veille : ………." },
      { h: 'Journal de veille', body: "Date : ……. Sujet / source : ……. Impact et action mise en œuvre : ……." },
      { h: 'Exploitation', body: "Intégration des évolutions dans les pratiques et les programmes : ………." },
    ],
  },
  {
    id: 'fiche-liaison', indicators: [26, 28], title: 'Fiche de liaison financeur / prescripteur',
    intro: "Recueil des besoins et communication avec le financeur ou le prescripteur.",
    sections: [
      { h: 'Financeur / prescripteur', body: "Nom de la structure : ………. Interlocuteur : ………. Contact : ………." },
      { h: 'Besoins exprimés', body: "Attentes, objectifs et contraintes exprimés : ………." },
      { h: 'Suivi et retours', body: "Comptes rendus et bilans transmis, dates : ………." },
    ],
  },
  {
    id: 'bilan-evaluations', indicators: [15, 16], title: 'Bilan et exploitation des évaluations',
    intro: "Synthèse et exploitation des évaluations pour la session {{sessionTitle}}.",
    sections: [
      { h: 'Résultats de satisfaction', body: "Taux de satisfaction moyen : ………. À chaud / à froid : ………." },
      { h: 'Résultats des acquis', body: "Taux de réussite / d'atteinte des objectifs : ………." },
      { h: 'Analyse et actions', body: "Points forts, axes d'amélioration, actions décidées : ………." },
      { h: 'Indicateurs communiqués', body: "Indicateurs de résultats publiés (site, catalogue) : ………." },
    ],
  },
  {
    id: 'fiche-suivi', indicators: [11, 17], title: 'Fiche de suivi individualisé',
    intro: "Suivi de l'accompagnement du bénéficiaire {{traineeName}} pour la session {{sessionTitle}}.",
    sections: [
      { h: 'Objectifs individuels', body: "Objectifs fixés avec le bénéficiaire : ………." },
      { h: 'Accompagnement réalisé', body: "Points de suivi, échanges, adaptations mises en place : ………." },
      { h: 'Coordination des acteurs', body: "Interlocuteurs mobilisés (formateur, tuteur, entreprise) : ………." },
      { h: 'Bilan', body: "Atteinte des objectifs et suites données : ………." },
    ],
  },
  {
    id: 'plan-amelioration', indicators: [32], title: 'Plan d\'amélioration continue',
    intro: "Pilotage des actions d'amélioration issues des évaluations, réclamations et non-conformités.",
    sections: [
      { h: 'Axe d\'amélioration', body: "Axe : ………. Origine (évaluation, réclamation, audit) : ………." },
      { h: 'Action décidée', body: "Action : ………. Responsable : ………. Échéance : ………." },
      { h: 'Suivi d\'efficacité', body: "Indicateur de suivi : ………. Résultat constaté : ………." },
    ],
  },
];
