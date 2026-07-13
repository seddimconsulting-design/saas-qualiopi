import { COMPANY } from '../company';
import { H1, Lead, H2, P, UL } from '../ui';

export const metadata = { title: 'Mentions légales — Certivia' };

export default function MentionsLegales() {
  return (
    <article>
      <H1>Mentions légales</H1>
      <Lead>En vigueur au {COMPANY.updatedAt}</Lead>

      <H2>Éditeur du site</H2>
      <P>Le site et l’application <strong>{COMPANY.brand}</strong> (accessibles à l’adresse {COMPANY.siteUrl}) sont édités par :</P>
      <UL>
        <li>Dénomination : {COMPANY.legalName}</li>
        <li>Forme juridique : {COMPANY.legalForm}</li>
        {COMPANY.capital ? <li>Capital social : {COMPANY.capital}</li> : null}
        <li>SIRET : {COMPANY.siret}</li>
        <li>RCS : {COMPANY.rcs}</li>
        <li>TVA intracommunautaire : {COMPANY.vat}</li>
        <li>Siège / adresse : {COMPANY.address}</li>
        <li>Contact : <a className="text-emerald-600 font-medium" href={`mailto:${COMPANY.contactEmail}`}>{COMPANY.contactEmail}</a></li>
      </UL>

      <H2>Directeur de la publication</H2>
      <P>{COMPANY.publisher}</P>

      <H2>Hébergement</H2>
      <P>
        L’application est hébergée par {COMPANY.host} — {COMPANY.hostDetails}.
        La base de données est hébergée par Neon Inc.
      </P>

      <H2>Propriété intellectuelle</H2>
      <P>
        L’ensemble des éléments composant le site et l’application {COMPANY.brand} (marque, logo, textes,
        interfaces, code) est protégé par le droit de la propriété intellectuelle et demeure la propriété
        exclusive de l’éditeur, sauf mention contraire. Toute reproduction ou représentation, totale ou
        partielle, sans autorisation écrite préalable, est interdite.
      </P>

      <H2>Données personnelles</H2>
      <P>
        Le traitement des données personnelles est décrit dans la{' '}
        <a className="text-emerald-600 font-medium" href="/legal/confidentialite">Politique de confidentialité</a>.
      </P>

      <H2>Contact</H2>
      <P>
        Pour toute question relative au site ou à l’application, vous pouvez écrire à{' '}
        <a className="text-emerald-600 font-medium" href={`mailto:${COMPANY.contactEmail}`}>{COMPANY.contactEmail}</a>.
      </P>
    </article>
  );
}
