import {
  Accessibility,
  ArrowRight,
  CalendarDays,
  Car,
  CheckCircle2,
  Coffee,
  Compass,
  Euro,
  Info,
  MapPin,
  Maximize,
  MonitorPlay,
  Users,
  Wifi,
} from 'lucide-react';
import {motion} from 'motion/react';
import type {ComponentType, ReactNode} from 'react';
import {lazy, Suspense, useEffect, useState} from 'react';
import {desks} from '../data/desks';
import {galleryData, type GalleryKey} from '../data/gallery';
import {rooms} from '../data/rooms';
import {siteConfig} from '../data/site';
import {applyJsonLd, applySeo} from '../lib/seo';
import type {ReservationPrefill} from '../components/ReservationForm';

const GalleryModal = lazy(async () => {
  const module = await import('../components/GalleryModal');
  return {default: module.GalleryModal as ComponentType<{activeGallery: GalleryKey | null; onClose: () => void}>};
});

const ReservationForm = lazy(async () => {
  const module = await import('../components/ReservationForm');
  return {default: module.ReservationForm as ComponentType<{prefill: ReservationPrefill}>};
});

const eventFormats = [
  {
    id: 'atelier',
    title: 'Atelier ou formation',
    description: 'Pour réunir une équipe, un comité ou un groupe projet sur un format cadré.',
  },
  {
    id: 'teamday',
    title: "Journée d'équipe",
    description: 'Pour mixer temps de travail, pauses et moments plus informels dans les espaces communs.',
  },
  {
    id: 'afterwork',
    title: 'Afterwork ou lancement',
    description: 'Pour recevoir des invités dans un cadre professionnel, flexible et convivial.',
  },
] as const;

const heroImages = [
  {
    src: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=1200',
    alt: 'Bureau privé lumineux à louer près de Rennes',
  },
  {
    src: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=1200',
    alt: 'Salle de réunion proche de Rennes',
  },
  {
    src: 'https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&q=80&w=1200',
    alt: 'Espace de travail partagé près de Rennes',
  },
] as const;

const sharedSpaceShapes = [
  'rounded-[0_0_10rem_10rem]',
  'rounded-[50%_50%_50%_0]',
  'rounded-[10rem_10rem_0_0]',
  'rounded-[5rem_0_5rem_0]',
  'rounded-[0_50%_50%_50%]',
  'rounded-full',
] as const;

export function HomePage() {
  const [activeGallery, setActiveGallery] = useState<GalleryKey | null>(null);
  const [prefill, setPrefill] = useState<ReservationPrefill>(null);
  const [heroImageIndex, setHeroImageIndex] = useState(0);
  const [heroCycle, setHeroCycle] = useState(0);

  useEffect(() => {
    applySeo({
      title: siteConfig.seo.defaultTitle,
      description: siteConfig.seo.defaultDescription,
      canonicalPath: '/',
    });

    applyJsonLd('local-business', {
      '@context': 'https://schema.org',
      '@type': 'CoworkingSpace',
      name: siteConfig.brand,
      url: siteConfig.siteUrl,
      email: siteConfig.email,
      telephone: siteConfig.phoneDisplay,
      address: {
        '@type': 'PostalAddress',
        streetAddress: siteConfig.address.street,
        postalCode: siteConfig.address.postalCode,
        addressLocality: siteConfig.address.city,
        addressCountry: 'FR',
      },
      areaServed: ['Rennes', 'Chartres-de-Bretagne', 'Ille-et-Vilaine'],
      description: siteConfig.seo.defaultDescription,
      keywords: ['location de bureaux à Rennes', 'bureaux à louer près de Rennes', 'bureaux privatifs près de Rennes'],
    });
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setHeroImageIndex((currentIndex) => {
        if (currentIndex === heroImages.length - 1) {
          setHeroCycle((currentCycle) => currentCycle + 1);
          return 0;
        }

        return currentIndex + 1;
      });
    }, 3000);

    return () => window.clearInterval(interval);
  }, []);

  const scrollToReservation = () => {
    document.getElementById('reservation')?.scrollIntoView({behavior: 'smooth', block: 'start'});
  };

  return (
    <main className="relative overflow-hidden bg-white">
      <div className="fixed left-10 top-20 -z-10 h-64 w-64 rounded-full bg-primary/5 blur-3xl animate-pulse-soft" />
      <div className="fixed bottom-40 right-10 -z-10 h-96 w-96 rounded-full bg-primary/10 blur-3xl animate-pulse-soft" style={{animationDelay: '2s'}} />
      <div className="absolute right-[10%] top-[20%] -z-10 h-20 w-20 rounded-full border-4 border-primary/20 animate-float" />
      <div className="absolute left-[5%] top-[40%] -z-10 h-12 w-12 rotate-45 rounded-lg bg-primary/10 animate-float-delayed" />
      <div className="absolute right-[15%] top-[70%] -z-10 h-16 w-16 rounded-full border-4 border-primary/20 animate-float" />

      {activeGallery ? (
        <Suspense fallback={null}>
          <GalleryModal activeGallery={activeGallery} onClose={() => setActiveGallery(null)} />
        </Suspense>
      ) : null}

      <section id="hero" className="mx-auto max-w-[1400px] scroll-mt-24 px-6 pb-24 pt-20 md:px-12 md:pt-28">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex w-full max-w-[560px] flex-col items-start justify-center gap-10 text-left">
            <div className="space-y-6">
              <motion.h1
                initial={{opacity: 0, y: 20}}
                whileInView={{opacity: 1, y: 0}}
                viewport={{once: true}}
                transition={{duration: 0.6}}
                className="relative inline-block font-serif text-4xl font-black leading-[1.15] tracking-tight text-gray-900 sm:text-5xl md:text-6xl"
              >
                Un espace de travail
                <br />
                <span className="relative inline-block">
                  partagé et vivant
                  <svg
                    className="absolute -bottom-2 left-0 h-3 w-full text-primary"
                    viewBox="0 0 100 20"
                    preserveAspectRatio="none"
                  >
                    <motion.path
                      initial={{pathLength: 0}}
                      whileInView={{pathLength: 0.999}}
                      viewport={{once: true, margin: '-50px'}}
                      transition={{duration: 0.8, delay: 0.5}}
                      d="M0,15 Q50,0 100,15"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <span className="absolute -right-4 -top-1 font-serif text-3xl text-primary">’</span>
              </motion.h1>

              <p className="mt-6 max-w-md text-sm font-medium leading-relaxed text-gray-600 md:text-base">
                Vous recherchez une <strong>location de bureaux à Rennes</strong> ? Découvrez nos bureaux privés à louer
                à Chartres-de-Bretagne, à environ 15 minutes de Rennes, avec un cadre professionnel clair,
                parking, accès rapide et services sur place.
              </p>
            </div>

            <div className="flex w-full flex-col items-start gap-4 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  setPrefill({reservationType: 'bureau'});
                  scrollToReservation();
                }}
                className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-primary px-8 py-4 font-bold text-white shadow-lg transition-colors hover:bg-primary/90 sm:w-auto"
              >
                Planifier une visite des bureaux
                <ArrowRight size={18} />
              </button>
              <a
                href="#bureaux"
                className="inline-flex w-full items-center justify-center gap-3 rounded-full border border-gray-200 bg-white px-8 py-4 font-bold text-gray-900 transition-colors hover:border-primary/30 hover:text-primary sm:w-auto"
              >
                Voir les bureaux
              </a>
            </div>
          </div>

          <div className="relative mx-auto flex w-full max-w-[560px] items-center lg:h-[640px]">
            <div className="w-full rounded-[2.5rem] border border-gray-100 bg-white p-5 shadow-2xl">
              <div className="relative h-[320px] overflow-hidden rounded-[2rem] md:h-[380px]">
                {heroImages.map((image, index) => (
                  <img
                    key={image.src}
                    src={image.src}
                    alt={image.alt}
                    className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                      index === heroImageIndex ? 'opacity-100' : 'opacity-0'
                    }`}
                    referrerPolicy="no-referrer"
                    loading={index === 0 ? 'eager' : 'lazy'}
                    fetchPriority={index === 0 ? 'high' : 'auto'}
                  />
                ))}
                <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
                <div className="absolute inset-x-6 bottom-6 flex gap-3">
                  {heroImages.map((image, index) => (
                    <div
                      key={image.alt}
                      className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/25"
                    >
                      <motion.div
                        key={`${image.alt}-${heroCycle}`}
                        initial={{width: 0}}
                        animate={{width: heroImageIndex === index ? '100%' : index < heroImageIndex ? '100%' : '0%'}}
                        transition={heroImageIndex === index ? {duration: 3, ease: 'linear'} : {duration: 0.35, ease: 'easeOut'}}
                        className="h-full rounded-full bg-white"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <motion.div
              initial={{opacity: 0, scale: 0.9, rotate: 10}}
              whileInView={{opacity: 1, scale: 1, rotate: -6}}
              viewport={{once: true}}
              transition={{duration: 0.5, delay: 0.4, type: 'spring'}}
              className="absolute right-4 top-6 z-20 flex items-center gap-2 rounded-xl border border-gray-100 bg-white px-4 py-2 text-sm font-bold text-gray-900 shadow-xl md:-right-6 md:top-20 md:px-6 md:py-3 md:text-base"
            >
              <MapPin className="text-primary" size={18} />
              Chartres-de-Bretagne
            </motion.div>
          </div>
        </div>
      </section>

      <section id="bureaux" className="scroll-mt-24 bg-primary py-32">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <div>
              <h2 className="font-serif text-4xl font-black text-white md:text-5xl">Vos bureaux à louer</h2>
              <p className="mt-6 text-lg leading-relaxed text-white/80">
                Des bureaux fermés, lumineux et immédiatement opérationnels pour toute recherche de
                <strong> location de bureaux à Rennes</strong>, avec une implantation à Chartres-de-Bretagne, proche de Rennes.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {desks.map((desk) => (
              <button
                key={desk.id}
                type="button"
                onClick={() => {
                  setPrefill({reservationType: 'bureau', deskId: desk.id});
                  scrollToReservation();
                }}
                className={`group flex flex-col overflow-hidden rounded-[2rem] bg-gray-50 text-left text-gray-900 shadow-lg transition-transform duration-300 ${
                  desk.available ? 'hover:-translate-y-2 hover:shadow-2xl' : 'opacity-80'
                }`}
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={desk.image}
                    alt={desk.name}
                    className={`h-full w-full object-cover ${!desk.available ? 'grayscale' : ''}`}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute left-4 top-4 rounded-full bg-white/90 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-primary backdrop-blur">
                    {desk.available ? 'Disponible' : 'Loué'}
                  </div>
                  {!desk.available && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                      <span className="rounded-full bg-white px-6 py-2 text-lg font-bold text-gray-900 shadow-lg">
                        Déjà loué
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-8">
                  <h3 className="mb-6 font-serif text-2xl font-bold text-gray-900">{desk.name}</h3>
                  <div className="mb-8 grid grid-cols-2 gap-x-2 gap-y-4 text-sm text-gray-700">
                    <div className="flex items-center gap-2"><Maximize size={16} className="text-primary" /> {desk.size}</div>
                    <div className="flex items-center gap-2"><Compass size={16} className="text-primary" /> {desk.orientation}</div>
                    <div className="flex items-center gap-2"><Users size={16} className="text-primary" /> {desk.capacity}</div>
                    <div className="flex items-center gap-2 font-bold text-gray-900"><Euro size={16} className="text-primary" /> {desk.price}</div>
                  </div>
                  <div className="mt-auto rounded-xl border border-primary/20 bg-white px-4 py-3 text-center text-sm font-bold text-primary transition-colors group-hover:border-primary group-hover:bg-primary group-hover:text-white">
                    Prendre rendez-vous
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section id="salles-reunions" className="overflow-hidden bg-gray-50 py-32">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <div className="mb-24 text-center">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-primary/70">Réunions et ateliers</p>
            <h2 className="mb-6 font-serif text-4xl font-black text-gray-900 md:text-5xl">Salles de réunion</h2>
            <p className="mx-auto mb-12 max-w-3xl text-lg text-gray-600">
              Des salles disponibles pour vos réunions, ateliers, formations et rendez-vous clients, dans le même
              environnement professionnel que les bureaux.
            </p>

            <div className="flex flex-wrap justify-center gap-6 text-gray-700 md:gap-12">
              <Feature icon={<Wifi size={24} />} label="Fibre très haut débit" />
              <Feature icon={<Coffee size={24} />} label="Pauses café intégrées au lieu" />
              <Feature icon={<Accessibility size={24} />} label="Accessibilité PMR" />
            </div>
          </div>

          {rooms.map((room, index) => (
            <div
              key={room.id}
              className={`relative flex flex-col items-center ${
                index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
              } ${index !== rooms.length - 1 ? 'mb-32' : ''} ${!room.available ? 'opacity-80' : ''}`}
            >
              <motion.div
                initial={{height: 0}}
                whileInView={{height: '60%'}}
                viewport={{once: true}}
                transition={{duration: 0.8, delay: 0.2}}
                className={`absolute top-[20%] z-0 hidden w-2 rounded-full bg-primary lg:block ${
                  index % 2 === 0 ? '-left-8' : '-right-8'
                }`}
              />
              <div className="relative z-10 h-[400px] w-full overflow-hidden rounded-[3rem] shadow-2xl lg:h-[600px] lg:w-2/3">
                <img
                  src={room.image}
                  alt={room.name}
                  className={`h-full w-full object-cover transition-transform duration-700 ${
                    room.available ? 'hover:scale-105' : 'grayscale'
                  }`}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  decoding="async"
                />
                {!room.available && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                    <span className="rounded-full bg-white px-8 py-3 text-2xl font-bold text-gray-900 shadow-lg">
                      Déjà louée
                    </span>
                  </div>
                )}
              </div>
              <div className={`relative z-20 -mt-20 w-full rounded-[3rem] border border-gray-100 bg-white/90 p-10 shadow-2xl backdrop-blur-xl lg:mt-0 lg:w-1/2 lg:p-16 ${
                index % 2 === 0 ? 'lg:-ml-32' : 'lg:-mr-32'
              }`}>
                <h3 className="mb-4 font-serif text-3xl font-black text-gray-900">{room.name}</h3>
                <div className="mb-6 flex items-center gap-4">
                  <div className="rounded-lg border border-gray-200 px-4 py-2">
                    <span className="text-2xl font-bold text-gray-900">{room.priceHour}</span>
                    <span className="ml-1 text-sm text-gray-500">HT / heure</span>
                  </div>
                  <div className="rounded-lg border border-gray-200 px-4 py-2">
                    <span className="text-2xl font-bold text-gray-900">{room.priceDay}</span>
                    <span className="ml-1 text-sm text-gray-500">HT / jour</span>
                  </div>
                </div>
                <p className="mb-8 leading-relaxed text-gray-600">{room.description}</p>
                <ul className="mb-8 space-y-3 text-sm font-medium text-gray-700">
                  {room.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <CheckCircle2 size={18} className="text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                {room.available ? (
                  <button
                    type="button"
                    onClick={() => {
                      setPrefill({reservationType: 'salle', roomId: room.id});
                      scrollToReservation();
                    }}
                    className="inline-block rounded-xl bg-primary px-8 py-4 font-bold text-white transition-colors hover:bg-primary/90"
                  >
                    Réserver {room.name.replace('Salle ', '').replace(/"/g, '')}
                  </button>
                ) : (
                  <button disabled className="inline-block cursor-not-allowed rounded-xl border-2 border-gray-200 bg-gray-100 px-8 py-4 font-bold text-gray-400">
                    Indisponible
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="espaces-partages" className="relative overflow-hidden bg-primary py-32 text-white">
        <div className="absolute left-0 top-0 h-32 w-full bg-gradient-to-b from-white to-transparent opacity-10" />
        <div className="absolute -right-20 top-20 h-64 w-64 rounded-full border-[20px] border-white/5 animate-float" />
        <div className="absolute -left-10 bottom-20 h-40 w-40 rotate-12 rounded-3xl bg-white/5 animate-float-delayed" />

        <div className="relative z-10 mx-auto max-w-[1400px] px-6 md:px-12">
          <div className="mb-20 text-center">
            <h2 className="mb-6 font-serif text-4xl font-black md:text-5xl">Espaces partagés</h2>
            <p className="mx-auto max-w-2xl text-lg text-white/80">
              Des lieux de vie conçus pour favoriser les échanges, la créativité et la détente entre deux sessions de travail.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {(Object.entries(galleryData) as [GalleryKey, (typeof galleryData)[GalleryKey]][]).map(([key, gallery], index) => {
              const shapeClass = sharedSpaceShapes[index % sharedSpaceShapes.length];

              return (
                <button
                  key={key}
                  type="button"
                  className="group flex flex-col items-center text-center transition-transform duration-300 hover:-translate-y-2"
                  onClick={() => setActiveGallery(key)}
                  aria-haspopup="dialog"
                  aria-label={`Ouvrir la galerie ${gallery.title}`}
                >
                  <div className={`relative mb-8 h-64 w-64 overflow-hidden shadow-2xl [transform:translateZ(0)] isolation-isolate [-webkit-mask-image:-webkit-radial-gradient(white,black)] md:h-80 md:w-80 ${shapeClass}`}>
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                      <span className="rounded-full bg-primary/80 px-4 py-2 font-bold text-white backdrop-blur-sm">Voir plus</span>
                    </div>
                    <img
                      src={gallery.images[0]}
                      alt={gallery.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                      decoding="async"
                    />
                  </div>
                  <div className="max-w-[260px]">
                    <h3 className="text-2xl font-bold text-white">{gallery.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-white/75">{gallery.summary}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section id="localisation" className="bg-gray-50 py-32">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <div className="grid grid-cols-1 items-stretch gap-16 lg:grid-cols-2">
            <motion.div
              initial={{opacity: 0, x: -40}}
              whileInView={{opacity: 1, x: 0}}
              viewport={{once: true}}
              transition={{duration: 0.8}}
            >
              <h2 className="mb-8 font-serif text-4xl font-black leading-[1.1] text-gray-900 md:text-5xl">
                Un emplacement stratégique
              </h2>
              <p className="mb-10 text-lg text-gray-600">
                Profitez d’un cadre de travail calme tout en restant connecté à Rennes. Pour une recherche
                de <strong>location de bureaux à Rennes</strong>, le site combine proximité, accessibilité et confort.
              </p>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <LocationCard icon={<Car className="text-primary" size={28} />} title="Parking gratuit" description="Stationnement facile et gratuit pour vous et vos clients." />
                <LocationCard icon={<MapPin className="text-primary" size={28} />} title="Accès rapide" description="À 5 minutes de la rocade (D177) et 15 min de Rennes centre." />
                <LocationCard icon={<Coffee className="text-primary" size={28} />} title="Commerces" description="Boulangeries, restaurants à moins de 5 min à pied et food trucks à disposition." />
                <LocationCard icon={<Info className="text-primary" size={28} />} title="Espaces verts" description="Parcs et chemins de balade à proximité pour s’aérer l’esprit." />
              </div>
            </motion.div>

            <motion.div
              initial={{opacity: 0, y: 40}}
              whileInView={{opacity: 1, y: 0}}
              viewport={{once: true}}
              transition={{duration: 0.8, delay: 0.2}}
              className="relative min-h-[400px] overflow-hidden rounded-[3rem] shadow-xl"
            >
              <iframe
                title={`Carte Google Maps - ${siteConfig.address.street}, ${siteConfig.address.city}`}
                src="https://www.google.com/maps?q=16%20rue%20L%C3%A9o%20Lagrange%2C%2035131%20Chartres-de-Bretagne&z=16&output=embed"
                className="h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />

              <div className="pointer-events-none absolute inset-x-6 bottom-6">
                <div className="inline-flex max-w-full items-center gap-2 rounded-full bg-gray-900/90 px-5 py-3 text-sm font-bold text-white shadow-2xl backdrop-blur">
                  <MapPin size={16} className="text-primary" />
                  <span className="truncate">{siteConfig.address.street}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <div className="grid grid-cols-1 items-stretch gap-16 lg:grid-cols-2">
            <motion.div
              initial={{opacity: 0, x: -40}}
              whileInView={{opacity: 1, x: 0}}
              viewport={{once: true}}
              transition={{duration: 0.8}}
            >
            <h2 className="font-serif text-4xl font-black text-gray-900 md:text-5xl">
              Une alternative claire et professionnelle pour louer des bureaux près de Rennes
            </h2>
            <p className="mt-5 text-base leading-relaxed text-gray-600">
              Pour une entreprise qui cherche une <strong>location de bureaux à Rennes</strong>, la proximité réelle,
              la simplicité d’accès et la lisibilité du lieu comptent autant que l’adresse elle-même. Ici, vous
              bénéficiez de bureaux privés à louer près de Rennes, dans un environnement plus calme, plus fluide
              et plus simple à projeter pour vos équipes comme pour vos clients.
            </p>
            <p className="mt-4 text-base leading-relaxed text-gray-600">
              Ici, tout a été pensé pour rendre la recherche plus simple et plus concrète :
              trouver des bureaux privés à louer près de Rennes, identifier rapidement un espace adapté
              et pouvoir organiser une visite sans friction.
            </p>
            </motion.div>

            <motion.div
              initial={{opacity: 0, y: 40}}
              whileInView={{opacity: 1, y: 0}}
              viewport={{once: true}}
              transition={{duration: 0.8, delay: 0.2}}
              className="relative min-h-[400px] overflow-hidden rounded-[3rem] shadow-xl"
            >
              <img
                src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=1200"
                alt="Bureaux lumineux dans un environnement professionnel"
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
                loading="lazy"
                decoding="async"
              />
            </motion.div>
          </div>
        </div>
      </section>

      <section id="reservation" className="bg-primary py-32">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <div className="mb-12 text-center">
            <h2 className="font-serif text-4xl font-black text-white md:text-5xl">Demander une visite de bureau près de Rennes</h2>
          </div>

          <div className="mx-auto max-w-2xl">
            <Suspense fallback={<div className="rounded-3xl bg-white/10 p-8 text-center text-white/80">Chargement du formulaire…</div>}>
              <ReservationForm prefill={prefill} />
            </Suspense>
          </div>
        </div>
      </section>
    </main>
  );
}

function InfoCard({value, label}: {value: string; label: string}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <p className="text-3xl font-black text-gray-900">{value}</p>
      <p className="mt-1 text-sm font-medium text-gray-500">{label}</p>
    </div>
  );
}

function HighlightCard({icon, title, description}: {icon: ReactNode; title: string; description: string}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5 shadow-sm">
      {icon}
      <p className="mt-4 font-bold text-gray-900">{title}</p>
      <p className="mt-2 text-sm text-gray-600">{description}</p>
    </div>
  );
}

function Feature({icon, label}: {icon: ReactNode; label: string}) {
  return (
    <div className="flex items-center gap-3 font-medium">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
        {icon}
      </div>
      <span>{label}</span>
    </div>
  );
}

function LocationCard({icon, title, description}: {icon: ReactNode; title: string; description: string}) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      {icon}
      <h3 className="mb-2 mt-4 font-bold text-gray-900">{title}</h3>
      <p className="flex-grow text-sm text-gray-500">{description}</p>
    </div>
  );
}
