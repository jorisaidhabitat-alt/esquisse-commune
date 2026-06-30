import {
  ArrowRight,
  CalendarDays,
  Car,
  Check,
  Clock3,
  Coffee,
  ChevronRight,
  Mail,
  MapPin,
  MonitorPlay,
  Phone,
} from 'lucide-react';
import {useEffect} from 'react';
import {Link} from 'react-router-dom';
import {desks} from '../data/desks';
import {rooms} from '../data/rooms';
import {siteConfig} from '../data/site';
import {
  BUSINESS_PAGE_FAQS,
  BUSINESS_PAGE_PATHS,
  BUSINESS_PAGE_SEO,
  getBusinessPageJsonLd,
  type BusinessPageKey,
} from '../lib/business-pages';
import {applyJsonLd, applySeo} from '../lib/seo';

function BusinessPageLayout({
  pageKey,
  eyebrow,
  title,
  description,
  primaryLabel = 'Demander une visite',
  children,
}: {
  pageKey: BusinessPageKey;
  eyebrow: string;
  title: string;
  description: string;
  primaryLabel?: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    applySeo(BUSINESS_PAGE_SEO[pageKey]);
    getBusinessPageJsonLd(pageKey).forEach(({id, data}) => applyJsonLd(id, data));
  }, [pageKey]);

  return (
    <main className="bg-gray-50">
      <section className="mx-auto max-w-[1400px] px-6 pb-10 pt-16 md:px-12 md:pb-12 md:pt-24">
        <div className="mx-auto max-w-4xl text-center">
          <nav
            aria-label="Fil d'Ariane"
            className="mb-5 flex flex-wrap items-center justify-center gap-2 text-sm text-gray-500"
          >
            <Link to="/" className="transition-colors hover:text-primary">
              Accueil
            </Link>
            <ChevronRight size={14} className="text-gray-300" />
            <span className="text-gray-700">{title}</span>
          </nav>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">{eyebrow}</p>
          <h1 className="mt-5 font-serif text-4xl font-black leading-tight text-gray-900 md:text-6xl">{title}</h1>
          <p className="mt-6 text-base leading-relaxed text-gray-600 md:text-xl">{description}</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="/#reservation"
              className="inline-flex items-center justify-center gap-3 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
            >
              {primaryLabel}
              <ArrowRight size={16} />
            </a>
            <a
              href={`tel:${siteConfig.phoneLink}`}
              className="inline-flex items-center justify-center gap-3 rounded-full border border-primary/15 bg-white px-7 py-3.5 text-sm font-semibold text-primary transition-colors hover:border-primary/35"
            >
              <Phone size={16} />
              {siteConfig.phoneDisplay}
            </a>
          </div>
        </div>
      </section>
      {children}
    </main>
  );
}

function SectionTitle({
  title,
  description,
  inverse = false,
}: {
  title: string;
  description?: string;
  inverse?: boolean;
}) {
  return (
    <div className="mb-10 md:mb-12">
      <h2 className={`font-serif text-3xl font-black md:text-5xl ${inverse ? 'text-white' : 'text-gray-900'}`}>{title}</h2>
      {description ? (
        <p className={`mt-4 max-w-3xl text-base leading-relaxed md:text-lg ${inverse ? 'text-white/80' : 'text-gray-600'}`}>
          {description}
        </p>
      ) : null}
    </div>
  );
}

function FaqItem({question, answer}: {question: string; answer: string}) {
  return (
    <div className="rounded-[1.75rem] border border-gray-100 bg-white p-6 shadow-sm md:p-8">
      <h3 className="text-lg font-bold text-gray-900 md:text-xl">{question}</h3>
      <p className="mt-3 text-base leading-relaxed text-gray-600">{answer}</p>
    </div>
  );
}

export function DeskRentalPage() {
  return (
    <BusinessPageLayout
      pageKey="desks"
      eyebrow="Bureaux privés"
      title="Bureaux privés à Chartres-de-Bretagne"
      description="Des bureaux privés lumineux, disponibles immédiatement à Chartres-de-Bretagne, à environ 10 minutes de Rennes. Charges comprises, parking gratuit, espaces partagés et visite sur rendez-vous."
      primaryLabel="Demander une visite"
    >
      <section className="pb-12">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <div className="grid gap-6 md:grid-cols-3 md:gap-8">
            {desks.map((desk) => (
              <article key={desk.id} className="overflow-hidden rounded-[2rem] bg-white shadow-sm">
                <div className="h-64 overflow-hidden">
                  <img src={desk.image} alt={desk.name} className="h-full w-full object-cover" loading="lazy" />
                </div>
                <div className="p-6 md:p-7">
                  <h2 className="font-serif text-3xl font-black text-gray-900">{desk.name}</h2>
                  <p className="mt-2 text-sm font-medium text-primary">Bureau privé avec accès aux espaces partagés</p>
                  <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <Metric label="Superficie" value={desk.size} />
                    <Metric label="Orientation" value={desk.orientation} />
                    <Metric label="Capacité" value={desk.capacity} />
                    <Metric label="Prix" value={desk.price} />
                  </div>
                  <p className="mt-5 text-sm leading-relaxed text-gray-500">
                    Charges comprises : eau, électricité, chauffage, internet et accès aux espaces partagés.
                  </p>
                  <a
                    href="/#reservation"
                    className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary"
                  >
                    Demander une visite
                    <ArrowRight size={16} />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-12 pt-10 md:pb-16">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <SectionTitle
            title="Pourquoi louer vos bureaux ici"
            description="Le lieu a été pensé pour des indépendants, équipes projet et petites structures qui cherchent un cadre clair, professionnel et accessible sans les contraintes du centre-ville."
          />
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <FeatureCard icon={<Car className="text-primary" size={22} />} title="Parking gratuit" description="Un accès simple pour vous, vos collaborateurs et vos clients, sans stress de stationnement." />
            <FeatureCard icon={<MapPin className="text-primary" size={22} />} title="Rennes Sud" description="Un emplacement à Chartres-de-Bretagne, proche de la rocade et rapidement accessible depuis Rennes." />
            <FeatureCard icon={<Coffee className="text-primary" size={22} />} title="Espaces partagés" description="Pause café, cafétéria et phone box pour travailler dans un cadre vivant mais structuré." />
            <FeatureCard icon={<CalendarDays className="text-primary" size={22} />} title="Visite rapide" description="Nous organisons des visites sur rendez-vous pour vous orienter vers le bureau le plus adapté." />
          </div>
        </div>
      </section>

      <section className="pb-12 pt-10 md:pb-16">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <div className="grid gap-8 overflow-hidden rounded-[2rem] bg-primary text-white shadow-sm lg:grid-cols-[1.1fr_0.9fr]">
            <div className="px-6 py-8 md:px-8 md:py-10">
              <SectionTitle title="Ce qui est inclus" inverse />
              <div className="grid gap-4 text-sm text-white/90 md:grid-cols-2">
                <IncludedLine text="Charges comprises dans le prix" />
                <IncludedLine text="Internet fibre haut débit" />
                <IncludedLine text="Accès aux espaces partagés" />
                <IncludedLine text="Stationnement facile" />
                <IncludedLine text="Cadre calme et professionnel" />
                <IncludedLine text="Visite et prise de contact directe" />
              </div>
            </div>
            <div className="min-h-[280px] bg-white/10 lg:min-h-full">
              <img src="/desks/bureau-6-1.jpg" alt="Bureau privatif à Chartres-de-Bretagne" className="h-full w-full object-cover" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      <section className="pb-12 pt-10 md:pb-16">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <SectionTitle title="Questions fréquentes" />
          <div className="grid gap-6 md:grid-cols-2">
            {BUSINESS_PAGE_FAQS.desks.map((faq) => (
              <FaqItem key={faq.question} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </section>

      <section className="pb-20 pt-10 md:pb-24">
        <div className="mx-auto max-w-[1200px] px-6 md:px-12">
          <div className="rounded-[2rem] bg-white p-8 shadow-sm md:p-12">
            <h2 className="font-serif text-3xl font-black text-gray-900 md:text-4xl">Demander une visite de bureau</h2>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-gray-600">
              Vous pouvez nous joindre directement pour vérifier les disponibilités, comparer les surfaces ou organiser une visite sur place à Chartres-de-Bretagne.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <a href="/#reservation" className="inline-flex items-center justify-center gap-3 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90">
                Envoyer une demande
              </a>
              <a href={`mailto:${siteConfig.email}`} className="inline-flex items-center justify-center gap-3 rounded-full border border-gray-200 px-7 py-3.5 text-sm font-semibold text-gray-900 transition-colors hover:border-primary/30 hover:text-primary">
                <Mail size={16} />
                {siteConfig.email}
              </a>
            </div>
          </div>
        </div>
      </section>
    </BusinessPageLayout>
  );
}

export function MeetingRoomPage() {
  return (
    <BusinessPageLayout
      pageKey="rooms"
      eyebrow="Salle de réunion"
      title="Salle de réunion à Chartres-de-Bretagne"
      description="Deux salles de réunion équipées à Chartres-de-Bretagne, près de Rennes, pour vos rendez-vous clients, formations, ateliers et réunions d’équipe. Réservation à l’heure, à la demi-journée ou à la journée."
      primaryLabel="Réserver un créneau"
    >
      <section className="pb-12">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <div className="grid gap-8 lg:grid-cols-2">
            {rooms.map((room) => (
              <article key={room.id} className="overflow-hidden rounded-[2rem] bg-white shadow-sm">
                <div className="h-72 overflow-hidden">
                  <img src={room.image} alt={room.name} className="h-full w-full object-cover" loading="lazy" />
                </div>
                <div className="p-6 md:p-7">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="font-serif text-3xl font-black text-gray-900">{room.name}</h2>
                    <span className="rounded-full bg-primary/8 px-3 py-1 text-sm font-semibold text-primary">{room.surface}</span>
                  </div>
                  <p className="mt-3 text-base leading-relaxed text-gray-600">{room.description}</p>
                  <ul className="mt-5 space-y-3 text-sm text-gray-600">
                    {room.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check size={16} className="mt-0.5 shrink-0 text-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    {(room.rates ?? []).map((rate) => (
                      <div key={rate.label} className="rounded-[1.25rem] border border-primary/12 bg-primary/5 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">{rate.label}</p>
                        <p className="mt-2 text-2xl font-black text-gray-900">{rate.price}</p>
                        {rate.details ? <p className="mt-2 text-sm text-gray-500">{rate.details}</p> : null}
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3 text-sm text-gray-500">
                    {room.options?.map((option) => (
                      <span key={option} className="rounded-full border border-gray-200 px-3.5 py-2">
                        {option}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-12 pt-10 md:pb-16">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <SectionTitle
            title="Un format simple pour vos réunions"
            description="Les salles ont été pensées pour des usages commerciaux concrets : rendez-vous clients, ateliers, formations, présentations, comités et temps de travail d’équipe."
          />
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <FeatureCard icon={<Clock3 className="text-primary" size={22} />} title="À l’heure ou à la journée" description="Réservation flexible selon votre besoin : rendez-vous ponctuel, demi-journée ou journée complète." />
            <FeatureCard icon={<MonitorPlay className="text-primary" size={22} />} title="Équipements inclus" description="TV 4K AirPlay ou vidéoprojecteur selon la salle, pour présenter vos supports sans friction." />
            <FeatureCard icon={<Coffee className="text-primary" size={22} />} title="Pause café et options" description="Petit déjeuner, déjeuner et accès aux espaces communs pour organiser des réunions plus confortables." />
            <FeatureCard icon={<Car className="text-primary" size={22} />} title="Parking gratuit" description="Un vrai avantage pour des participants venant de Rennes, de Chartres-de-Bretagne ou de la périphérie sud." />
          </div>
        </div>
      </section>

      <section className="pb-12 pt-10 md:pb-16">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <div className="grid gap-8 overflow-hidden rounded-[2rem] bg-primary text-white shadow-sm lg:grid-cols-[1.1fr_0.9fr]">
            <div className="px-6 py-8 md:px-8 md:py-10">
              <SectionTitle title="Pourquoi réserver ici" inverse />
              <div className="grid gap-4 text-sm text-white/90 md:grid-cols-2">
                <IncludedLine text="Adresse claire et facile d’accès" />
                <IncludedLine text="Parking gratuit pour vos invités" />
                <IncludedLine text="Formats de réservation lisibles" />
                <IncludedLine text="Cadre calme à Rennes Sud" />
                <IncludedLine text="Options petit déjeuner et déjeuner" />
                <IncludedLine text="Demande rapide depuis le site" />
              </div>
            </div>
            <div className="min-h-[280px] bg-white/10 lg:min-h-full">
              <img src="/rooms/annexe-9.jpg" alt="Salle de réunion à Chartres-de-Bretagne" className="h-full w-full object-cover" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      <section className="pb-12 pt-10 md:pb-16">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <SectionTitle title="Questions fréquentes" />
          <div className="grid gap-6 md:grid-cols-2">
            {BUSINESS_PAGE_FAQS.rooms.map((faq) => (
              <FaqItem key={faq.question} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </section>

      <section className="pb-20 pt-10 md:pb-24">
        <div className="mx-auto max-w-[1200px] px-6 md:px-12">
          <div className="rounded-[2rem] bg-white p-8 shadow-sm md:p-12">
            <h2 className="font-serif text-3xl font-black text-gray-900 md:text-4xl">Réserver une salle de réunion</h2>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-gray-600">
              Vérifiez les formats disponibles, envoyez votre demande et précisez votre besoin : réunion, formation, rendez-vous client ou atelier.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <a href="/#reservation" className="inline-flex items-center justify-center gap-3 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90">
                Envoyer une demande
              </a>
              <a href={`mailto:${siteConfig.email}`} className="inline-flex items-center justify-center gap-3 rounded-full border border-gray-200 px-7 py-3.5 text-sm font-semibold text-gray-900 transition-colors hover:border-primary/30 hover:text-primary">
                <Mail size={16} />
                {siteConfig.email}
              </a>
            </div>
          </div>
        </div>
      </section>
    </BusinessPageLayout>
  );
}

function Metric({label, value}: {label: string; value: string}) {
  return (
    <div className="rounded-[1.15rem] bg-gray-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">{label}</p>
      <p className="mt-2 text-base font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[1.75rem] bg-white p-6 shadow-sm">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/8">{icon}</div>
      <h3 className="mt-5 text-lg font-bold text-gray-900">{title}</h3>
      <p className="mt-3 text-base leading-relaxed text-gray-600">{description}</p>
    </div>
  );
}

function IncludedLine({text}: {text: string}) {
  return (
    <div className="flex items-start gap-3 rounded-[1.15rem] bg-white/8 px-4 py-3">
      <Check size={16} className="mt-0.5 shrink-0 text-white" />
      <span>{text}</span>
    </div>
  );
}
