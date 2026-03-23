import type {ReactNode} from 'react';
import {Route, Routes} from 'react-router-dom';
import {LegalPageLayout} from './components/LegalPageLayout';
import {ScrollToTop} from './components/ScrollToTop';
import {SiteFooter} from './components/SiteFooter';
import {SiteHeader} from './components/SiteHeader';
import {HomePage} from './pages/HomePage';
import {siteConfig} from './data/site';

function MentionsLegalesPage() {
  return (
    <LegalPageLayout
      title="Mentions légales"
      description="Informations de propriété, de publication et d’hébergement du site. Les éléments marqués “à compléter” doivent être validés avant une mise en ligne définitive."
    >
      <Section title="Propriétaire du site">
        <p><strong>Raison sociale :</strong> {siteConfig.legal.publisherName}</p>
        <p><strong>Adresse :</strong> {siteConfig.legal.ownerAddress.street}, {siteConfig.legal.ownerAddress.postalCode} {siteConfig.legal.ownerAddress.city}, France</p>
      </Section>

      <Section title="Coordonnées de contact">
        <p><strong>Email :</strong> <a href={`mailto:${siteConfig.email}`} className="text-primary underline underline-offset-4">{siteConfig.email}</a></p>
        <p><strong>Téléphone :</strong> <a href={`tel:${siteConfig.phoneLink}`} className="text-primary underline underline-offset-4">{siteConfig.phoneDisplay}</a></p>
      </Section>

      <Section title="Informations légales de l'entreprise">
        <p><strong>Forme juridique :</strong> {siteConfig.legal.legalForm}</p>
        <p><strong>Capital social :</strong> {siteConfig.legal.shareCapital}</p>
        <p><strong>SIREN :</strong> {siteConfig.legal.siren}</p>
        <p><strong>SIRET :</strong> {siteConfig.legal.siret}</p>
        <p><strong>TVA intracommunautaire :</strong> {siteConfig.legal.vatNumber}</p>
      </Section>

      <Section title="Responsable de publication">
        <p><strong>Nom :</strong> {siteConfig.legal.publicationDirector}</p>
        <p><strong>Email :</strong> <a href={`mailto:${siteConfig.legal.publicationDirectorEmail}`} className="text-primary underline underline-offset-4">{siteConfig.legal.publicationDirectorEmail}</a></p>
      </Section>

      <Section title="Hébergement">
        <p><strong>Hébergeur :</strong> {siteConfig.legal.hostName}</p>
        <p><strong>Site web :</strong> <a href={siteConfig.legal.hostWebsite} className="text-primary underline underline-offset-4">{siteConfig.legal.hostWebsite}</a></p>
      </Section>

      <Section title="Propriété intellectuelle">
        <p>
          L’ensemble des contenus du site, notamment les textes, visuels, logos, éléments graphiques
          et structure, est protégé par le droit d’auteur et le droit de la propriété intellectuelle.
          Toute reproduction, diffusion ou adaptation sans autorisation préalable est interdite.
        </p>
      </Section>

      <Section title="Mise à jour nécessaire">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          Les champs administratifs “forme juridique”, “capital social” et “TVA”
          sont actuellement marqués à compléter. Ils doivent être remplacés
          par les informations exactes de l’entreprise avant publication officielle.
        </div>
      </Section>
    </LegalPageLayout>
  );
}

function PrivacyPolicyPage() {
  return (
    <LegalPageLayout
      title="Politique de confidentialité"
      description="Traitement des données collectées via les formulaires de contact et de réservation du site."
    >
      <Section title="Données collectées">
        <p>
          Dans le cadre de l’utilisation des formulaires présents sur ce site internet,
          l’entreprise {siteConfig.legal.publisherName}, siège social : {siteConfig.legal.ownerAddress.street}, {siteConfig.legal.ownerAddress.postalCode} {siteConfig.legal.ownerAddress.city},
          numéro de Siret : {siteConfig.legal.siret}, est susceptible de collecter les catégories de données suivantes :
        </p>
        <ul className="list-disc pl-5">
          <li>nom et prénom ;</li>
          <li>adresse email ;</li>
          <li>numéro de téléphone ;</li>
          <li>nom de l’entreprise ;</li>
          <li>activité, besoin exprimé ou type de demande ;</li>
          <li>nombre de participants ou besoin en postes, selon le formulaire ;</li>
          <li>date et créneau souhaités ;</li>
          <li>message libre transmis via le formulaire.</li>
        </ul>
      </Section>

      <Section title="Finalités du traitement">
        <p>Ces données sont utilisées uniquement pour :</p>
        <ul className="list-disc pl-5">
          <li>répondre à votre demande de contact ;</li>
          <li>traiter une demande de réservation de bureau, de salle ou d’événement ;</li>
          <li>organiser un échange commercial ou une visite du lieu.</li>
        </ul>
      </Section>

      <Section title="Base légale">
        <p>
          Le traitement repose sur les démarches initiées par l’utilisateur et sur l’intérêt légitime
          de l’éditeur à répondre aux demandes commerciales reçues.
        </p>
      </Section>

      <Section title="Destinataires">
        <p>
          Les informations sont destinées à {siteConfig.legal.publisherName}. Elles ne sont ni revendues,
          ni cédées à des tiers en dehors des prestataires techniques nécessaires à l’hébergement du site.
        </p>
      </Section>

      <Section title="Durée de conservation">
        <p>
          Les demandes commerciales sont conservées pendant une durée maximale de 3 ans à compter du dernier
          échange, sauf obligation légale contraire.
        </p>
      </Section>

      <Section title="Vos droits">
        <p>
          Vous disposez d’un droit d’accès, de rectification, d’effacement, d’opposition, de limitation
          du traitement et de portabilité de vos données lorsque la réglementation le permet.
        </p>
        <p>
          Pour exercer vos droits, vous pouvez écrire à <a href={`mailto:${siteConfig.email}`} className="text-primary underline underline-offset-4">{siteConfig.email}</a>.
        </p>
      </Section>

      <Section title="Cookies">
        <p>
          Le site ne déploie pas à ce stade de bannière cookie dédiée ni d’outil marketing configuré.
          Si des outils d’analyse, de paiement ou de suivi sont ajoutés ultérieurement, cette politique devra être mise à jour.
        </p>
      </Section>
    </LegalPageLayout>
  );
}

function CgvPage() {
  return (
    <LegalPageLayout
      title="CGV et conditions de réservation"
      description="Cadre contractuel provisoire applicable aux demandes envoyées depuis le site, dans l’attente d’une réservation et d’un paiement en ligne automatisés."
    >
      <Section title="Objet">
        <p>
          Le site permet de solliciter la location de bureaux privés, de salles de réunion et
          l’organisation d’événements professionnels. À ce stade, les demandes transmises via le site
          donnent lieu à une prise de contact manuelle avec l’équipe commerciale.
        </p>
      </Section>

      <Section title="Formation de la réservation">
        <p>
          Une demande envoyée via le site ne vaut pas confirmation définitive. La réservation n’est considérée
          comme acceptée qu’après validation expresse par email ou par téléphone.
        </p>
      </Section>

      <Section title="Tarifs">
        <p>
          Les tarifs affichés sur le site sont fournis à titre indicatif. Ils peuvent être ajustés selon
          la durée, les options retenues et les besoins spécifiques formulés lors de la demande.
        </p>
      </Section>

      <Section title="Paiement">
        <p>
          Les bureaux privés font actuellement l’objet d’une prise de contact avant contractualisation.
          Un parcours de paiement en ligne via Stripe est prévu ultérieurement pour certaines réservations
          de salles de réunion et d’événements.
        </p>
      </Section>

      <Section title="Annulation et modification">
        <p>
          Les conditions d’annulation, de report et d’éventuels frais associés sont précisées au moment
          de la confirmation de réservation. En l’absence de confirmation, aucune somme n’est due via le site.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Toute question relative à une réservation peut être adressée à <a href={`mailto:${siteConfig.email}`} className="text-primary underline underline-offset-4">{siteConfig.email}</a>.
        </p>
      </Section>
    </LegalPageLayout>
  );
}

function Section({title, children}: {title: string; children: ReactNode}) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      <div className="space-y-2 text-base leading-relaxed text-gray-600">{children}</div>
    </section>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-primary selection:text-white">
      <ScrollToTop />
      <SiteHeader />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/mentions-legales" element={<MentionsLegalesPage />} />
        <Route path="/politique-confidentialite" element={<PrivacyPolicyPage />} />
        <Route path="/cgv" element={<CgvPage />} />
      </Routes>
      <SiteFooter />
    </div>
  );
}
