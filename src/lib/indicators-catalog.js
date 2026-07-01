/* Base de connaissance serveur des 32 indicateurs Qualiopi (RNQ v9).
   Pour chaque indicateur : libellé court, mots-clés (repli déterministe),
   et « attendu » officiel synthétisé (grounding du moteur IA).
   A valider contre l'arrêté officiel du Référentiel National Qualité V9. */
export const INDICATEURS_CATALOG = [
  { id: 1, label: "Information publics sur objectifs & résultats", attendu: "Diffuser une information accessible, détaillée et vérifiable sur les prestations (objectifs, résultats).", kw: ["catalogue", "information du public", "objectifs de la formation"] },
  { id: 2, label: "Identification des prérequis & profils", attendu: "Communiquer les prérequis, publics visés et objectifs de chaque prestation.", kw: ["prérequis", "public visé", "profil"] },
  { id: 3, label: "Délais et modalités d'accès", attendu: "Indiquer les délais et modalités d'accès aux prestations.", kw: ["délai d'accès", "modalités d'accès", "inscription"] },
  { id: 4, label: "Accessibilité handicap", attendu: "Garantir l'accessibilité des personnes en situation de handicap (référent, adaptations, réseau).", kw: ["handicap", "accessibilit", "psh", "agefiph", "aménagement", "référent handicap"] },
  { id: 5, label: "Contenu et objectifs pédagogiques", attendu: "Définir des objectifs et contenus pédagogiques adaptés et évaluables.", kw: ["objectifs pédagogiques", "programme de formation", "contenu pédagogique"] },
  { id: 6, label: "Adaptation des modalités pédagogiques", attendu: "Adapter les modalités et méthodes pédagogiques aux publics et aux objectifs.", kw: ["modalités pédagogiques", "méthodes pédagogiques", "moyens pédagogiques"] },
  { id: 7, label: "Adéquation ressources humaines", attendu: "Mobiliser des ressources humaines qualifiées et en nombre suffisant.", kw: ["intervenant", "équipe pédagogique", "moyens humains"] },
  { id: 8, label: "Positionnement à l'entrée", attendu: "Réaliser un positionnement et une évaluation à l'entrée de la prestation.", kw: ["positionnement", "test d'entrée", "évaluation amont", "diagnostic initial"] },
  { id: 9, label: "Évaluation des acquis en cours", attendu: "Évaluer l'atteinte des acquis en cours de prestation.", kw: ["évaluation en cours", "quiz", "exercice", "acquis intermédiaires"] },
  { id: 10, label: "Évaluation des acquis en fin", attendu: "Évaluer et attester les acquis en fin de prestation.", kw: ["certificat de réalisation", "évaluation finale", "attestation de fin", "acquis en fin"] },
  { id: 11, label: "Accompagnement des apprenants", attendu: "Assurer l'accompagnement et le suivi individualisé des bénéficiaires.", kw: ["accompagnement", "suivi individualisé", "tutorat"] },
  { id: 12, label: "Suivi de l'assiduité (émargement)", attendu: "Assurer et tracer le suivi de l'assiduité et de l'engagement des bénéficiaires (émargement).", kw: ["émargement", "feuille de présence", "assiduité", "feuille d'émargement"] },
  { id: 13, label: "Satisfaction à chaud", attendu: "Recueillir la satisfaction des bénéficiaires à chaud.", kw: ["satisfaction à chaud", "questionnaire de satisfaction", "évaluation à chaud"] },
  { id: 14, label: "Satisfaction à froid", attendu: "Recueillir la satisfaction et l'impact à froid (post-formation).", kw: ["à froid", "j+90", "satisfaction à froid", "impact"] },
  { id: 15, label: "Exploitation des résultats satisfaction", attendu: "Exploiter les résultats des évaluations pour améliorer les prestations.", kw: ["analyse des évaluations", "synthèse satisfaction", "exploitation"] },
  { id: 16, label: "Indicateurs de résultats communiqués", attendu: "Communiquer des indicateurs de résultats (réussite, satisfaction).", kw: ["taux de réussite", "taux de satisfaction", "indicateurs de résultats"] },
  { id: 17, label: "Coordination des acteurs", attendu: "Coordonner les acteurs internes et externes intervenant sur la prestation.", kw: ["coordination", "réunion pédagogique", "acteurs internes"] },
  { id: 18, label: "Qualification des formateurs", attendu: "Justifier la qualification et les compétences des formateurs (CV, diplômes).", kw: ["cv", "curriculum", "diplôme", "qualification", "formateur"] },
  { id: 19, label: "Développement des compétences formateurs", attendu: "Entretenir et développer les compétences des personnels.", kw: ["formation des formateurs", "développement des compétences", "plan de formation interne"] },
  { id: 20, label: "Moyens techniques et pédagogiques adaptés", attendu: "Mettre à disposition des moyens techniques et pédagogiques adaptés.", kw: ["moyens techniques", "matériel", "plateforme lms"] },
  { id: 21, label: "Locaux accessibles et adaptés", attendu: "Disposer de locaux et équipements accessibles et adaptés.", kw: ["locaux", "salle de formation", "erp"] },
  { id: 22, label: "Gestion des sous-traitants", attendu: "Encadrer la sous-traitance et le portage (contrats, respect des exigences).", kw: ["sous-traitance", "sous-traitant", "contrat-cadre", "prestataire externe"] },
  { id: 23, label: "Veilles réglementaires et sectorielles", attendu: "Réaliser une veille légale et réglementaire et l'appliquer.", kw: ["veille", "décret", "réglementaire", "journal officiel", "actualité légale"] },
  { id: 24, label: "Traçabilité des veilles", attendu: "Réaliser une veille sur les évolutions (compétences, métiers, innovations) et la tracer.", kw: ["journal de veille", "traçabilité de la veille", "exploitation de la veille"] },
  { id: 25, label: "Traçabilité des actions de formation", attendu: "Assurer la traçabilité et la conservation des documents de la prestation.", kw: ["convention de formation", "contrat de formation", "dossier de session", "traçabilité"] },
  { id: 26, label: "Communication avec financeurs/prescripteurs", attendu: "Mobiliser et communiquer avec les financeurs et prescripteurs.", kw: ["opco", "financeur", "prescripteur", "compte rendu"] },
  { id: 27, label: "Recueil besoins prescripteurs/financeurs", attendu: "Recueillir et prendre en compte les besoins des prescripteurs et financeurs.", kw: ["analyse du besoin", "recueil du besoin", "cahier des charges"] },
  { id: 28, label: "Mise en relation prescripteurs/apprenants", attendu: "Assurer la mise en relation et l'orientation des bénéficiaires.", kw: ["mise en relation", "orientation", "partenariat"] },
  { id: 29, label: "Mesure de la satisfaction parties prenantes", attendu: "Mesurer la satisfaction des parties prenantes (stagiaires, financeurs, entreprises).", kw: ["enquête", "parties prenantes", "satisfaction globale"] },
  { id: 30, label: "Traitement des réclamations", attendu: "Recueillir et traiter les réclamations, difficultés et aléas.", kw: ["réclamation", "plainte", "insatisfaction", "litige"] },
  { id: 31, label: "Gestion des non-conformités", attendu: "Mettre en œuvre des mesures de traitement des non-conformités.", kw: ["non-conformité", "non conformité", "action corrective", "fiche d'incident"] },
  { id: 32, label: "Amélioration continue", attendu: "Déployer une démarche d'amélioration continue.", kw: ["amélioration continue", "plan d'amélioration", "action préventive", "pac"] },
];

/* Attendu d'un indicateur par id. */
export const attenduOf = (id) => INDICATEURS_CATALOG.find(i => i.id === id)?.attendu || null;

/* Référentiel injecté dans le prompt IA (grounding). */
export const catalogForPrompt = () =>
  INDICATEURS_CATALOG.map(i => `${i.id}. ${i.label} — attendu : ${i.attendu}`).join("\n");
