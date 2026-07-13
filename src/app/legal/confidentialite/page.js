import { COMPANY, SUBPROCESSORS } from '../company';
import { H1, Lead, H2, P, UL, Note } from '../ui';

export const metadata = { title: 'Politique de confidentialité — Certivia' };

export default function Confidentialite() {
  return (
    <article>
      <H1>Politique de confidentialité</H1>
      <Lead>En vigueur au {COMPANY.updatedAt}</Lead>

      <P>
        {COMPANY.brand} attache une grande importance à la protection des données personnelles. La présente
        politique explique quelles données sont traitées, pourquoi, pendant combien de temps, et quels sont
        vos droits, conformément au Règlement général sur la protection des données (RGPD) et à la loi
        « Informatique et Libertés ».
      </P>

      <H2>1. Deux rôles distincts</H2>
      <P>
        <strong>Pour les données de votre compte</strong> (identité de l’utilisateur et de l’organisme de
        formation), {COMPANY.legalName} agit en tant que <strong>responsable de traitement</strong>.
      </P>
      <P>
        <strong>Pour les données que vous saisissez dans l’application</strong> (vos stagiaires, sessions,
        preuves, etc.), c’est <strong>votre organisme de formation qui est responsable de traitement</strong> :
        {COMPANY.brand} agit alors comme <strong>sous-traitant</strong>, au sens de l’article 28 du RGPD, et ne
        traite ces données que pour vous fournir le service, selon vos instructions.
      </P>
      <Note>
        Un accord de sous-traitance (DPA) encadrant ce rôle est disponible sur demande à{' '}
        <a className="font-semibold underline" href={`mailto:${COMPANY.contactEmail}`}>{COMPANY.contactEmail}</a>.
        Il est recommandé de le formaliser avant de saisir des données réelles de stagiaires.
      </Note>

      <H2>2. Données collectées</H2>
      <UL>
        <li><strong>Compte :</strong> adresse e-mail, nom, nom de l’organisme, mot de passe (stocké chiffré), rôle.</li>
        <li><strong>Données saisies dans l’outil :</strong> sessions de formation, stagiaires (nom, e-mail, téléphone), documents et preuves, indicateurs, éléments commerciaux.</li>
        <li><strong>Données sensibles :</strong> l’outil permet de renseigner des informations liées au handicap d’un stagiaire (donnée de santé, catégorie particulière — art. 9 RGPD). Ne les renseignez qu’avec une base légale appropriée et l’information de la personne concernée.</li>
        <li><strong>Données techniques :</strong> un cookie de session strictement nécessaire à l’authentification. Aucun cookie publicitaire ni de traçage n’est utilisé.</li>
      </UL>

      <H2>3. Finalités et bases légales</H2>
      <UL>
        <li>Fournir et sécuriser l’accès à l’application — exécution du contrat.</li>
        <li>Gérer votre compte et vous envoyer les e-mails de service (ex. réinitialisation de mot de passe) — exécution du contrat.</li>
        <li>Assurer la sécurité et prévenir les abus — intérêt légitime.</li>
        <li>Répondre à vos demandes de support — intérêt légitime / exécution du contrat.</li>
      </UL>

      <H2>4. Destinataires et sous-traitants</H2>
      <P>Vos données ne sont jamais vendues. Elles sont accessibles aux prestataires techniques strictement nécessaires au fonctionnement du service :</P>
      <UL>
        {SUBPROCESSORS.map((s) => (
          <li key={s.name}><strong>{s.name}</strong> — {s.role}.</li>
        ))}
      </UL>
      <P>
        Certains de ces prestataires sont situés en dehors de l’Union européenne (États-Unis). Ces transferts
        sont encadrés par les garanties appropriées prévues par le RGPD (clauses contractuelles types de la
        Commission européenne).
      </P>

      <H2>5. Durée de conservation</H2>
      <UL>
        <li>Données de compte : pendant toute la durée d’utilisation du service, puis supprimées ou anonymisées dans un délai raisonnable après la clôture du compte.</li>
        <li>Données saisies dans l’outil : conservées tant que votre organisme les maintient dans l’application ; supprimées sur votre demande ou à la clôture du compte.</li>
        <li>Jetons de réinitialisation de mot de passe : 1 heure maximum.</li>
      </UL>

      <H2>6. Sécurité</H2>
      <P>
        Les mots de passe sont stockés sous forme chiffrée (hachage), les échanges sont chiffrés (HTTPS), et
        chaque organisme dispose d’un espace de données isolé (cloisonnement multi-locataire). L’accès aux
        données est restreint aux personnes autorisées.
      </P>

      <H2>7. Vos droits</H2>
      <P>Vous disposez des droits d’accès, de rectification, d’effacement, de limitation, d’opposition et de portabilité de vos données.</P>
      <P>
        Pour les exercer, écrivez à{' '}
        <a className="text-emerald-600 font-medium" href={`mailto:${COMPANY.contactEmail}`}>{COMPANY.contactEmail}</a>.
        Vous pouvez également introduire une réclamation auprès de la CNIL (www.cnil.fr).
      </P>
      <P>
        S’agissant des données de vos stagiaires (dont votre organisme est responsable), les demandes des
        personnes concernées doivent être adressées à votre organisme ; {COMPANY.brand} vous assiste pour y
        répondre.
      </P>

      <H2>8. Modifications</H2>
      <P>
        La présente politique peut être mise à jour. La date de dernière mise à jour figure en haut de page.
      </P>
    </article>
  );
}
