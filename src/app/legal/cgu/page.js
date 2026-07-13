import { COMPANY } from '../company';
import { H1, Lead, H2, P, UL } from '../ui';

export const metadata = { title: 'Conditions générales d’utilisation — Certivia' };

export default function Cgu() {
  return (
    <article>
      <H1>Conditions générales d’utilisation</H1>
      <Lead>En vigueur au {COMPANY.updatedAt}</Lead>

      <H2>1. Objet</H2>
      <P>
        Les présentes conditions générales d’utilisation (CGU) définissent les modalités d’accès et
        d’utilisation de l’application {COMPANY.brand} (ci-après « le Service »), éditée par {COMPANY.legalName}.
        En créant un compte, vous acceptez sans réserve les présentes CGU.
      </P>

      <H2>2. Description du Service</H2>
      <P>
        {COMPANY.brand} est un outil en ligne destiné aux organismes de formation pour piloter leur conformité
        Qualiopi : suivi des indicateurs, rattachement des preuves, génération de documents et suivi de la
        qualité. Le Service est fourni sous forme d’abonnement ou, le cas échéant, dans le cadre d’une période
        d’essai ou d’une version bêta.
      </P>

      <H2>3. Compte et accès</H2>
      <UL>
        <li>La création d’un compte nécessite une adresse e-mail valide et l’acceptation des présentes CGU.</li>
        <li>Vous êtes responsable de la confidentialité de vos identifiants et des activités réalisées depuis votre compte.</li>
        <li>Chaque organisme dispose d’un espace de données isolé ; vous pouvez inviter des utilisateurs de votre équipe selon les rôles disponibles.</li>
      </UL>

      <H2>4. Obligations de l’utilisateur</H2>
      <UL>
        <li>Utiliser le Service conformément à la loi et aux présentes CGU.</li>
        <li>Ne saisir que des données dont vous êtes en droit de disposer, et informer les personnes concernées (notamment vos stagiaires) du traitement de leurs données.</li>
        <li>Ne pas tenter de porter atteinte à la sécurité, à l’intégrité ou à la disponibilité du Service.</li>
      </UL>

      <H2>5. Disponibilité et évolutions</H2>
      <P>
        L’éditeur s’efforce d’assurer la disponibilité du Service mais ne peut la garantir sans interruption.
        Des opérations de maintenance ou des évolutions peuvent intervenir. En phase d’essai ou de bêta, le
        Service est fourni « en l’état », sans garantie de résultat.
      </P>

      <H2>6. Propriété intellectuelle</H2>
      <P>
        L’éditeur conserve l’ensemble des droits de propriété intellectuelle sur le Service. Vous conservez la
        pleine propriété des données que vous saisissez, que vous pouvez exporter et supprimer.
      </P>

      <H2>7. Données personnelles</H2>
      <P>
        Le traitement des données personnelles est régi par la{' '}
        <a className="text-emerald-600 font-medium" href="/legal/confidentialite">Politique de confidentialité</a>.
      </P>

      <H2>8. Responsabilité</H2>
      <P>
        Le Service est un outil d’aide au pilotage ; il ne se substitue pas à la responsabilité de l’organisme
        de formation quant à sa conformité Qualiopi et au respect de ses obligations. L’éditeur ne saurait être
        tenu responsable des décisions prises sur la base des informations fournies par le Service, ni des
        conséquences d’un audit.
      </P>

      <H2>9. Résiliation</H2>
      <P>
        Vous pouvez cesser d’utiliser le Service et demander la suppression de votre compte à tout moment en
        écrivant à {COMPANY.contactEmail}. L’éditeur peut suspendre un compte en cas de manquement aux présentes CGU.
      </P>

      <H2>10. Droit applicable</H2>
      <P>
        Les présentes CGU sont soumises au droit français. À défaut de résolution amiable, tout litige relèvera
        de la compétence des tribunaux français.
      </P>

      <H2>11. Contact</H2>
      <P>
        Pour toute question : <a className="text-emerald-600 font-medium" href={`mailto:${COMPANY.contactEmail}`}>{COMPANY.contactEmail}</a>.
      </P>
    </article>
  );
}
