import {
  Accessibility,
  ArrowRight,
  CalendarDays,
  Car,
  ChevronLeft,
  ChevronRight,
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
import {AnimatePresence, motion} from 'motion/react';
import type {CSSProperties, ComponentType, ReactNode, TouchEvent} from 'react';
import {lazy, Suspense, useEffect, useRef, useState} from 'react';
import {desks} from '../data/desks';
import {galleryData} from '../data/gallery';
import {rooms} from '../data/rooms';
import {
  getAvailableRoomOptions,
  getRoomBookingMode,
  type RoomBookingMode,
} from '../lib/reservation';
import {siteConfig} from '../data/site';
import {applyJsonLd, applySeo} from '../lib/seo';
import type {ReservationPrefill} from '../components/ReservationForm';

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

const roomComparisonLayouts = [
  {
    id: 'boardroom',
    label: 'Réunions',
    capacities: {
      atelier: '8',
      board: '10',
    },
  },
  {
    id: 'ushape',
    label: 'Présentation',
    capacities: {
      atelier: '8',
      board: '9',
    },
  },
  {
    id: 'theatre',
    label: 'Formation',
    capacities: {
      atelier: '10',
      board: '-',
    },
  },
] as const;

const roomComparisonHighlights = [
  {
    label: 'Lumière du jour',
    atelier: 'Oui, espace très lumineux',
    board: 'Semi-naturelle, ambiance feutrée',
  },
  {
    label: 'Usage idéal',
    atelier: 'Ateliers, formations, présentations',
    board: "Réunions d'équipes, rendez-vous client, ateliers",
  },
  {
    label: 'Atout principal',
    atelier: 'Salle ouverte, spacieuse, configuration souple',
    board: 'Cadre confidentiel, table plus grande',
  },
  {
    label: 'Équipement',
    atelier: 'TV 65 pouces 4K AirPlay',
    board: 'Système de vidéo-projecteur',
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

const sharedSpaceBaseRadii = ['0 0 10rem 10rem', '50% 50% 50% 0', '10rem 10rem 0 0'] as const;

function getSharedSpaceImageOrder(sourceIndex: number) {
  if (sourceIndex === 1) {
    return [1, 0, 2] as const;
  }

  if (sourceIndex === 2) {
    return [2, 1, 0] as const;
  }

  return [0, 1, 2] as const;
}

function getSharedSpaceMotionOffset(slotIndex: number, sourceIndex: number) {
  if (slotIndex === sourceIndex) {
    return '0px';
  }

  return `calc(${sourceIndex - slotIndex} * (100% + 2rem))`;
}

export function HomePage() {
  const [hoveredSharedSpace, setHoveredSharedSpace] = useState<{key: string; index: number} | null>(null);
  const [pausedSharedSpaceRail, setPausedSharedSpaceRail] = useState<string | null>(null);
  const [prefill, setPrefill] = useState<ReservationPrefill>(null);
  const [deskImageIndexes, setDeskImageIndexes] = useState<Record<string, number>>({});
  const [roomImageIndexes, setRoomImageIndexes] = useState<Record<string, number>>({});
  const [roomCycles, setRoomCycles] = useState<Record<string, number>>({});
  const [roomCardSelections, setRoomCardSelections] = useState<Record<string, {mode: RoomBookingMode | null; options: string[]}>>({});
  const deskTouchStartX = useRef<Record<string, number>>({});
  const deskTouchStartY = useRef<Record<string, number>>({});

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
      setRoomImageIndexes((current) => {
        const next = {...current};
        const cycledRoomIds: string[] = [];

        rooms.forEach((room) => {
          const images = (room.images.length ? room.images : [room.image]).slice(0, 3);
          const currentIndex = current[room.id] ?? 0;

          if (currentIndex === images.length - 1) {
            next[room.id] = 0;
            cycledRoomIds.push(room.id);
          } else {
            next[room.id] = currentIndex + 1;
          }
        });

        if (cycledRoomIds.length > 0) {
          setRoomCycles((cycles) => {
            const nextCycles = {...cycles};

            cycledRoomIds.forEach((roomId) => {
              nextCycles[roomId] = (cycles[roomId] ?? 0) + 1;
            });

            return nextCycles;
          });
        }

        return next;
      });
    }, 3000);

    return () => window.clearInterval(interval);
  }, []);

  const scrollToReservation = () => {
    document.getElementById('reservation')?.scrollIntoView({behavior: 'smooth', block: 'start'});
  };

  const goToDeskImage = (deskId: string, direction: 'prev' | 'next', imageCount: number) => {
    setDeskImageIndexes((current) => {
      const currentIndex = current[deskId] ?? 0;
      const nextIndex =
        direction === 'next'
          ? (currentIndex + 1) % imageCount
          : (currentIndex - 1 + imageCount) % imageCount;

      return {...current, [deskId]: nextIndex};
    });
  };

  const handleDeskTouchStart = (deskId: string, event: TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    if (!touch) {
      return;
    }

    deskTouchStartX.current[deskId] = touch.clientX;
    deskTouchStartY.current[deskId] = touch.clientY;
  };

  const handleDeskTouchEnd = (deskId: string, imageCount: number, event: TouchEvent<HTMLDivElement>) => {
    const startX = deskTouchStartX.current[deskId];
    const startY = deskTouchStartY.current[deskId];
    const touch = event.changedTouches[0];

    if (startX === undefined || startY === undefined || !touch) {
      return;
    }

    const deltaX = touch.clientX - startX;
    const deltaY = touch.clientY - startY;

    delete deskTouchStartX.current[deskId];
    delete deskTouchStartY.current[deskId];

    if (Math.abs(deltaX) < 40 || Math.abs(deltaX) <= Math.abs(deltaY)) {
      return;
    }

    goToDeskImage(deskId, deltaX < 0 ? 'next' : 'prev', imageCount);
  };

  const updateRoomCardSelection = (roomId: string, nextSelection: {mode: RoomBookingMode | null; options: string[]}) => {
    setRoomCardSelections((current) => ({...current, [roomId]: nextSelection}));
  };

  const sharedSpaces = Object.entries(galleryData);
  const activeSharedSpaceState = hoveredSharedSpace;
  const activeSharedSpace = activeSharedSpaceState ? galleryData[activeSharedSpaceState.key as keyof typeof galleryData] : null;
  const displayedSharedSpaces = activeSharedSpaceState
    ? getSharedSpaceImageOrder(activeSharedSpaceState.index).map((imageIndex, slotIndex) => ({
        slotKey: `hover-slot-${slotIndex}`,
        galleryKey: activeSharedSpaceState.key,
        image: galleryData[activeSharedSpaceState.key as keyof typeof galleryData].images.slice(0, 3)[imageIndex],
        title: galleryData[activeSharedSpaceState.key as keyof typeof galleryData].title,
        summary: galleryData[activeSharedSpaceState.key as keyof typeof galleryData].summary,
        isHoveredState: true,
        slotIndex,
        sourceSlotIndex: activeSharedSpaceState.index,
      }))
    : sharedSpaces.map(([key, gallery], index) => ({
        slotKey: `base-slot-${index}`,
        galleryKey: key,
        image: gallery.images[0],
        title: gallery.title,
        summary: gallery.summary,
        isHoveredState: false,
        slotIndex: index,
        sourceSlotIndex: index,
      }));

  return (
    <main className="relative overflow-hidden bg-white">
      <div className="fixed left-10 top-20 -z-10 hidden h-64 w-64 rounded-full bg-primary/5 blur-3xl animate-pulse-soft md:block" />
      <div className="fixed bottom-40 right-10 -z-10 hidden h-96 w-96 rounded-full bg-primary/10 blur-3xl animate-pulse-soft md:block" style={{animationDelay: '2s'}} />
      <div className="absolute right-[10%] top-[20%] -z-10 hidden h-20 w-20 rounded-full border-4 border-primary/20 animate-float md:block" />
      <div className="absolute left-[5%] top-[40%] -z-10 hidden h-12 w-12 rotate-45 rounded-lg bg-primary/10 animate-float-delayed md:block" />
      <div className="absolute right-[15%] top-[70%] -z-10 hidden h-16 w-16 rounded-full border-4 border-primary/20 animate-float md:block" />
      <section id="hero" className="mx-auto max-w-[1400px] scroll-mt-24 px-6 pb-20 pt-16 md:px-12 md:pb-24 md:pt-28">
        <div className="grid grid-cols-1 items-center gap-12 md:gap-16 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex w-full max-w-[560px] flex-col items-start justify-center gap-8 md:gap-10 text-left">
            <div className="space-y-6">
              <motion.h1
                initial={{opacity: 0, y: 20}}
                whileInView={{opacity: 1, y: 0}}
                viewport={{once: true}}
                transition={{duration: 0.6}}
                className="relative inline-block font-serif text-[2.15rem] font-black leading-[1.15] tracking-tight text-gray-900 sm:text-5xl md:text-6xl"
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
                <span className="absolute -right-2 -top-1 font-serif text-2xl text-primary sm:-right-4 sm:text-3xl">’</span>
              </motion.h1>

              <p className="mt-5 max-w-md text-sm font-medium leading-relaxed text-gray-600 md:mt-6 md:text-base">
                Vous recherchez une location de bureaux à Rennes ? Découvrez nos bureaux privés à louer
                à Chartres-de-Bretagne, à environ 10 minutes de Rennes, avec un cadre professionnel clair,
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

          <div className="relative mx-auto w-full max-w-[620px]">
            <div className="grid grid-cols-3 gap-3 md:gap-4">
              {heroImages.map((image, index) => (
                <motion.div
                  key={image.src}
                  initial={{opacity: 0, y: 28}}
                  whileInView={{opacity: 1, y: 0}}
                  viewport={{once: true}}
                  transition={{duration: 0.6, delay: 0.15 * index}}
                  className={`relative h-[260px] overflow-hidden border border-primary/20 bg-[#f7f5ef] sm:h-[300px] md:h-[460px] ${
                    index === 1
                      ? 'rounded-[0_3.75rem_0_3.75rem] md:rounded-[0_5.5rem_0_5.5rem]'
                      : 'rounded-[3.75rem_0_3.75rem_0] md:rounded-[5.5rem_0_5.5rem_0]'
                  }`}
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                    loading={index === 0 ? 'eager' : 'lazy'}
                    fetchPriority={index === 0 ? 'high' : 'auto'}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/12 via-transparent to-white/10" />
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{opacity: 0, scale: 0.9, rotate: 10}}
              whileInView={{opacity: 1, scale: 1, rotate: -4}}
              viewport={{once: true}}
              transition={{duration: 0.5, delay: 0.35, type: 'spring'}}
              className="absolute right-3 top-3 z-20 flex items-center gap-2 rounded-xl border border-gray-100 bg-white px-3 py-2 text-xs font-bold text-gray-900 shadow-xl sm:right-4 sm:top-4 sm:px-4 sm:text-sm md:right-0 md:top-10 md:px-6 md:py-3 md:text-base"
            >
              <MapPin className="text-primary" size={18} />
              Chartres-de-Bretagne
            </motion.div>
          </div>
        </div>

      </section>

      <section id="bureaux" className="scroll-mt-24 bg-primary py-32">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <div className="mx-auto mb-14 max-w-3xl text-center md:mb-16">
            <div>
              <h2 className="font-serif text-4xl font-black text-white md:text-5xl">Vos bureaux à louer</h2>
              <p className="mt-5 text-base leading-relaxed text-white/80 md:mt-6 md:text-lg">
                Des bureaux fermés, lumineux et immédiatement opérationnels pour toute recherche de
                location de bureaux à Rennes, avec une implantation à Chartres-de-Bretagne, proche de Rennes.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
            {desks.map((desk) => (
              <article
                key={desk.id}
                className={`group flex flex-col overflow-hidden rounded-3xl bg-gray-50 text-left text-gray-900 shadow-lg transition-transform duration-300 ${
                  desk.available ? 'hover:-translate-y-2 hover:shadow-2xl' : 'opacity-80'
                }`}
              >
                <div
                  className="relative h-56 overflow-hidden sm:h-64"
                  onTouchStart={(event) => handleDeskTouchStart(desk.id, event)}
                  onTouchEnd={(event) => handleDeskTouchEnd(desk.id, desk.images.length, event)}
                  style={{touchAction: 'pan-y'}}
                >
                  {desk.images.map((image, index) => (
                    <img
                      key={`${desk.id}-${image}`}
                      src={image}
                      alt={`${desk.name} ${index + 1}`}
                      className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
                        index === (deskImageIndexes[desk.id] ?? 0) ? 'opacity-100' : 'opacity-0'
                      } ${!desk.available ? 'grayscale' : ''}`}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      decoding="async"
                    />
                  ))}
                  <button
                    type="button"
                    aria-label={`Photo précédente pour ${desk.name}`}
                    onClick={() => goToDeskImage(desk.id, 'prev', desk.images.length)}
                    className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow-md transition-colors hover:bg-white sm:h-10 sm:w-10"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    aria-label={`Photo suivante pour ${desk.name}`}
                    onClick={() => goToDeskImage(desk.id, 'next', desk.images.length)}
                    className="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow-md transition-colors hover:bg-white sm:h-10 sm:w-10"
                  >
                    <ChevronRight size={18} />
                  </button>
                  <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-primary backdrop-blur sm:left-4 sm:top-4 sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.18em]">
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
                <div className="flex flex-1 flex-col p-6 md:p-8">
                  <h3 className="mb-5 font-serif text-[1.35rem] font-bold text-gray-900 sm:text-2xl">{desk.name}</h3>
                  <div className="mb-7 grid grid-cols-2 gap-x-2 gap-y-4 text-sm text-gray-700">
                    <div className="flex items-center gap-2"><Maximize size={16} className="text-primary" /> {desk.size}</div>
                    <div className="flex items-center gap-2"><Compass size={16} className="text-primary" /> {desk.orientation}</div>
                    <div className="flex items-center gap-2"><Users size={16} className="text-primary" /> {desk.capacity}</div>
                    <div className="flex items-center gap-2 font-bold text-gray-900"><Euro size={16} className="text-primary" /> {desk.price}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPrefill({reservationType: 'bureau', deskId: desk.id});
                      scrollToReservation();
                    }}
                    className="mt-auto rounded-xl border border-primary/20 bg-white px-4 py-3 text-center text-sm font-bold text-primary transition-colors hover:border-primary hover:bg-primary hover:text-white"
                  >
                    Visiter le bureau
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="salles-reunions" className="overflow-hidden bg-gray-50 py-24 md:py-32">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <div className="mb-16 text-center md:mb-24">
            <h2 className="mb-6 font-serif text-4xl font-black text-gray-900 md:text-5xl">Salles de réunion</h2>
            <p className="mx-auto mb-10 max-w-3xl text-base text-gray-600 md:mb-12 md:text-lg">
              Des salles disponibles pour vos réunions, ateliers, formations et rendez-vous clients, dans un
              environnement professionnel et calme.
            </p>

            <div className="flex flex-wrap justify-center gap-6 text-gray-700 md:gap-12">
              <Feature icon={<Wifi size={24} />} label="Fibre haut débit" />
              <Feature icon={<Coffee size={24} />} label="Espace pause café" />
              <Feature icon={<Accessibility size={24} />} label="Accessibilité PMR" />
            </div>
          </div>

          {rooms.map((room, index) => {
            const roomImages = (room.images.length ? room.images : [room.image]).slice(0, 3);
            const activeRoomImageIndex = roomImageIndexes[room.id] ?? 0;
            const roomRates = room.rates ?? [
              {label: "À l'heure", price: room.priceHour},
              {label: 'Journée', price: room.priceDay},
            ];
            const roomCardSelection = roomCardSelections[room.id] ?? {mode: null, options: []};
            const selectableOptions = getAvailableRoomOptions({
              allOptions: room.options ?? [],
              mode: roomCardSelection.mode,
            });
            const compactBadges = [
              room.features[0]
                ? {
                    icon: <Users size={14} className="text-white" />,
                    label: room.features[0].match(/\d+/)?.[0] ?? room.features[0],
                  }
                : null,
              room.features[1]
                ? {
                    icon: <MonitorPlay size={14} className="text-white" />,
                    label: room.features[1]
                      .replace(/,\s*/g, ' ')
                      .replace(/^Système de\s*/i, '')
                      .trim(),
                  }
                : null,
              room.features[2]
                ? {
                    icon: <Coffee size={14} className="text-white" />,
                    label: room.features[2].replace(/\s+disponible$/i, '').trim(),
                  }
                : null,
            ].filter((item): item is NonNullable<typeof item> => item !== null);

            return (
              <div
                key={room.id}
                className={`relative flex flex-col items-center ${
                  index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                } ${index !== rooms.length - 1 ? 'mb-20 md:mb-32' : ''} ${!room.available ? 'opacity-80' : ''}`}
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
                <div className="relative z-10 h-[340px] w-full overflow-hidden rounded-3xl shadow-2xl sm:h-[400px] lg:h-[600px] lg:w-2/3">
                  {roomImages.map((image, imageIndex) => (
                    <img
                      key={`${room.id}-${image}`}
                      src={image}
                      alt={`${room.name} ${imageIndex + 1}`}
                      className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                        imageIndex === activeRoomImageIndex ? 'opacity-100' : 'opacity-0'
                      } ${room.available ? 'hover:scale-105' : 'grayscale'}`}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      decoding="async"
                    />
                  ))}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
                  <div className="absolute left-4 top-4 right-4 flex flex-wrap gap-2 sm:left-6 sm:top-6 sm:right-6">
                    <div className={`flex flex-wrap gap-2 ${room.id === 'board' ? 'sm:ml-auto sm:justify-end' : ''}`}>
                      {room.tag ? (
                        <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold tracking-[0.12em] text-primary backdrop-blur sm:px-3 sm:text-xs sm:tracking-[0.14em]">
                          {room.tag}
                        </span>
                      ) : null}
                      {compactBadges.map((badge) => (
                        <span
                          key={`${room.id}-${badge.label}`}
                          className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-primary/88 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur sm:gap-2 sm:px-3 sm:text-xs"
                        >
                          <span className="shrink-0">{badge.icon}</span>
                          <span className="truncate">{badge.label}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="absolute inset-x-4 bottom-4 flex gap-2 sm:inset-x-6 sm:bottom-6 sm:gap-3">
                    {roomImages.map((image, imageIndex) => (
                      <div
                        key={`${room.id}-gauge-${image}`}
                        className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/25"
                      >
                        <motion.div
                          key={`${room.id}-${roomCycles[room.id] ?? 0}-${imageIndex}`}
                          initial={{width: 0}}
                          animate={{width: activeRoomImageIndex === imageIndex ? '100%' : imageIndex < activeRoomImageIndex ? '100%' : '0%'}}
                          transition={activeRoomImageIndex === imageIndex ? {duration: 3, ease: 'linear'} : {duration: 0.35, ease: 'easeOut'}}
                          className="h-full rounded-full bg-white"
                        />
                      </div>
                    ))}
                  </div>
                  {!room.available && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                      <span className="rounded-full bg-white px-8 py-3 text-2xl font-bold text-gray-900 shadow-lg">
                        Déjà louée
                      </span>
                    </div>
                  )}
                </div>
                <div className={`relative z-20 -mt-14 w-full rounded-3xl border border-gray-100 bg-white p-6 shadow-2xl sm:-mt-20 sm:p-8 lg:mt-0 lg:w-1/2 lg:p-12 ${
                  index % 2 === 0 ? 'lg:-ml-32' : 'lg:-mr-32'
                }`}>
                  <div className="mb-7 border-b border-gray-100 pb-7 md:mb-8 md:pb-8">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <h3 className="font-serif text-[1.8rem] font-black text-gray-900 sm:text-3xl">{room.name}</h3>
                      {room.surface ? (
                        <p className="text-sm font-medium text-gray-500 sm:pt-2">{room.surface}</p>
                      ) : null}
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-gray-600 sm:text-base">{room.description}</p>
                  </div>

                  <div className="space-y-8">
                    <div>
                      <div className="grid gap-3 sm:grid-cols-3">
                        {roomRates.map((rate) => (
                          <button
                            key={`${room.id}-${rate.label}`}
                            type="button"
                            onClick={() => {
                              const mode = getRoomBookingMode(rate.label);
                              const nextOptions = getAvailableRoomOptions({
                                allOptions: room.options ?? [],
                                mode,
                              });

                              updateRoomCardSelection(room.id, {
                                mode,
                                options: roomCardSelection.options.filter((option) => nextOptions.includes(option)),
                              });
                            }}
                            className={`rounded-3xl border px-4 py-4 text-center transition-all sm:px-5 ${
                              roomCardSelection.mode === getRoomBookingMode(rate.label)
                                ? 'border-primary bg-primary text-white shadow-md'
                                : 'border-gray-200 bg-gray-50 text-gray-900 hover:border-primary/30 hover:bg-white'
                            }`}
                          >
                            <p className={`text-xs font-bold uppercase tracking-[0.16em] ${
                              roomCardSelection.mode === getRoomBookingMode(rate.label) ? 'text-white/75' : 'text-gray-500'
                            }`}>
                              {rate.label}
                            </p>
                            <div className={`mt-3 inline-flex items-baseline gap-1 rounded-xl px-4 py-2.5 ${
                              roomCardSelection.mode === getRoomBookingMode(rate.label) ? 'bg-white/14' : 'bg-white'
                            }`}>
                              <span className={`text-xl font-bold ${
                                roomCardSelection.mode === getRoomBookingMode(rate.label) ? 'text-white' : 'text-gray-900'
                              }`}>
                                {rate.price}
                              </span>
                              <span className={`text-sm ${
                                roomCardSelection.mode === getRoomBookingMode(rate.label) ? 'text-white/80' : 'text-gray-500'
                              }`}>
                                HT
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {room.options?.length ? (
                      <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4">
                        <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-primary">Options</p>
                        <div className="space-y-3">
                          {room.options.map((option) => {
                            const [label, price] = option.split(':');
                            const isSelectable = selectableOptions.includes(option);
                            const isSelected = roomCardSelection.options.includes(option);

                            return (
                              <button
                                key={option}
                                type="button"
                                disabled={!isSelectable}
                                onClick={() => {
                                  if (!isSelectable) {
                                    return;
                                  }

                                  updateRoomCardSelection(room.id, {
                                    mode: roomCardSelection.mode,
                                    options: isSelected
                                      ? roomCardSelection.options.filter((item) => item !== option)
                                      : [...roomCardSelection.options, option],
                                  });
                                }}
                                className={`w-full rounded-xl border px-4 py-3 text-left transition-all ${
                                  isSelected
                                    ? 'border-primary bg-white shadow-sm'
                                    : isSelectable
                                      ? 'border-transparent bg-white/90 hover:border-primary/30'
                                      : 'border-transparent bg-white/55 text-gray-400 opacity-60'
                                }`}
                              >
                                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-4">
                                  <div className="flex items-start gap-3">
                                    <CheckCircle2
                                      size={18}
                                      className={`mt-0.5 shrink-0 ${isSelectable ? 'text-primary' : 'text-gray-300'}`}
                                    />
                                    <span className={`text-sm font-medium leading-relaxed ${
                                      isSelectable ? 'text-gray-800' : 'text-gray-400'
                                    }`}>
                                      {label.trim()}
                                    </span>
                                  </div>
                                  <span className={`text-sm font-bold md:whitespace-nowrap ${
                                    isSelectable ? 'text-gray-900' : 'text-gray-400'
                                  }`}>
                                    {price ? price.trim() : ''}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-6 border-t border-gray-100 pt-6">
                    {room.available ? (
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="sm:min-h-[42px] sm:flex sm:flex-1 sm:items-center sm:pr-4">
                          <p className="min-h-[20px] text-sm leading-snug text-gray-500">
                          {roomCardSelection.mode === 'hourly'
                            ? 'Les options sont indisponibles pour une réservation à l’heure.'
                            : roomCardSelection.mode === null
                              ? 'Choisissez d’abord un tarif pour activer la réservation.'
                              : ''}
                          </p>
                        </div>
                        <button
                          type="button"
                          disabled={!roomCardSelection.mode}
                          onClick={() => {
                            setPrefill({
                              reservationType: 'salle',
                              roomId: room.id,
                              roomBookingMode: roomCardSelection.mode ?? undefined,
                              selectedRoomOptions: roomCardSelection.options,
                            });
                            scrollToReservation();
                          }}
                          className="inline-flex w-full shrink-0 items-center justify-center whitespace-nowrap rounded-xl bg-primary px-8 py-4 font-bold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                        >
                          {roomCardSelection.mode ? `Réserver ${room.name.replace('Salle ', '').replace(/"/g, '')}` : 'Choisir un tarif'}
                        </button>
                      </div>
                    ) : (
                      <button disabled className="inline-flex w-full cursor-not-allowed items-center justify-center rounded-xl border-2 border-gray-200 bg-gray-100 px-8 py-4 font-bold text-gray-400 sm:w-auto">
                        Indisponible
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          <div className="mt-20 rounded-3xl border border-gray-200 bg-white p-6 shadow-xl sm:p-8 md:mt-24 md:p-10">
            <div className="mb-10 text-center">
              <h3 className="font-serif text-3xl font-black text-gray-900 md:text-4xl">Comparer les deux salles</h3>
              <p className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-gray-600 md:text-base">
                Un tableau simple pour comprendre les configurations possibles et choisir la salle la plus adaptée
                à votre format de réunion.
              </p>
            </div>

            <div className="overflow-hidden rounded-3xl border border-gray-200">
              <div className="grid grid-cols-[1.1fr_repeat(3,minmax(0,1fr))] border-b border-gray-200 bg-gray-50">
                <div className="px-4 py-5 sm:px-6" />
                {roomComparisonLayouts.map((layout) => (
                  <div key={layout.id} className="flex flex-col items-center justify-center gap-3 px-4 py-5 text-center sm:px-6">
                    <RoomLayoutIcon layout={layout.id} />
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">{layout.label}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-[1.1fr_repeat(3,minmax(0,1fr))] border-b border-gray-200">
                <div className="flex items-center border-r border-gray-200 px-4 py-5 sm:px-6">
                  <div>
                    <p className="font-serif text-2xl font-black text-gray-900">La Place</p>
                    <p className="mt-1 text-sm text-gray-500">Ouverte, lumineuse, polyvalente</p>
                  </div>
                </div>
                {roomComparisonLayouts.map((layout) => (
                  <div key={`atelier-${layout.id}`} className="flex items-center justify-center border-r border-gray-200 px-4 py-5 text-2xl font-black text-gray-900 last:border-r-0 sm:text-[2rem]">
                    {layout.capacities.atelier}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-[1.1fr_repeat(3,minmax(0,1fr))]">
                <div className="flex items-center border-r border-gray-200 px-4 py-5 sm:px-6">
                  <div>
                    <p className="font-serif text-2xl font-black text-gray-900">L&apos;Annexe</p>
                    <p className="mt-1 text-sm text-gray-500">Fermée, confidentielle</p>
                  </div>
                </div>
                {roomComparisonLayouts.map((layout) => (
                  <div key={`board-${layout.id}`} className="flex items-center justify-center border-r border-gray-200 px-4 py-5 text-2xl font-black text-gray-900 last:border-r-0 sm:text-[2rem]">
                    {layout.capacities.board}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 overflow-hidden rounded-3xl border border-gray-200">
              <div className="hidden bg-gray-50 md:grid md:grid-cols-[0.8fr_1fr_1fr]">
                <div className="border-r border-gray-200 px-4 py-4 md:px-6" />
                <div className="border-r border-gray-200 px-4 py-4 text-center md:px-6">
                  <p className="font-serif text-xl font-black text-gray-900">La Place</p>
                </div>
                <div className="px-4 py-4 text-center md:px-6">
                  <p className="font-serif text-xl font-black text-gray-900">L&apos;Annexe</p>
                </div>
              </div>

              {roomComparisonHighlights.map((item, index) => (
                <div
                  key={item.label}
                  className={`grid gap-0 md:grid-cols-[0.8fr_1fr_1fr] ${
                    index !== roomComparisonHighlights.length - 1 ? 'border-t border-gray-200' : 'border-t border-gray-200'
                  }`}
                >
                  <div className="border-b border-gray-200 bg-gray-50 px-4 py-4 text-sm font-bold text-gray-900 md:border-b-0 md:border-r md:px-6">
                    {item.label}
                  </div>
                  <div className="border-b border-gray-200 px-4 py-4 text-sm leading-relaxed text-gray-600 md:border-b-0 md:border-r md:px-6">
                    {item.atelier}
                  </div>
                  <div className="px-4 py-4 text-sm leading-relaxed text-gray-600 md:px-6">
                    {item.board}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 flex justify-center md:mt-14">
            <button
              type="button"
              onClick={() => {
                setPrefill({reservationType: 'salle'});
                scrollToReservation();
              }}
              className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 text-sm font-bold text-white shadow-lg transition-colors hover:bg-primary/90 sm:text-base"
            >
              Planifier une réunion
            </button>
          </div>
        </div>
      </section>

      <section id="espaces-partages" className="relative overflow-hidden bg-primary py-24 text-white md:py-32">
        <div className="absolute left-0 top-0 h-32 w-full bg-gradient-to-b from-white to-transparent opacity-10" />
        <div className="absolute -right-20 top-20 hidden h-64 w-64 rounded-full border-[20px] border-white/5 animate-float md:block" />
        <div className="absolute -left-10 bottom-20 hidden h-40 w-40 rotate-12 rounded-3xl bg-white/5 animate-float-delayed md:block" />

        <div className="relative z-10 mx-auto max-w-[1400px] px-6 md:px-12">
          <div className="mb-14 text-center md:mb-20">
            <h2 className="mb-6 font-serif text-4xl font-black md:text-5xl">Espaces partagés</h2>
            <p className="mx-auto max-w-2xl text-base text-white/80 md:text-lg">
              Des lieux de vie conçus pour favoriser les échanges, la créativité et la détente entre deux sessions de travail.
            </p>
          </div>

          <div className="space-y-10 lg:hidden">
            {sharedSpaces.map(([key, gallery], index) => {
              const loopingImages = [...gallery.images, ...gallery.images];
              const isPaused = pausedSharedSpaceRail === key;
              const marqueeStyle = {
                '--shared-marquee-duration': `${34 + index * 3}s`,
                '--shared-marquee-gap': '0.875rem',
              } as CSSProperties;

              return (
                <div key={key} className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-white">{gallery.title}</h3>
                    <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-white/75">
                      {gallery.summary}
                    </p>
                  </div>

                  <div
                    className="relative overflow-hidden py-1"
                    onTouchStart={() => setPausedSharedSpaceRail(key)}
                    onTouchEnd={() => setPausedSharedSpaceRail((current) => (current === key ? null : current))}
                    onTouchCancel={() => setPausedSharedSpaceRail((current) => (current === key ? null : current))}
                  >
                    <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-14 bg-gradient-to-r from-primary via-primary/90 to-transparent" />
                    <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-14 bg-gradient-to-l from-primary via-primary/90 to-transparent" />

                    <div
                      className={`shared-marquee-track ${index % 2 === 1 ? 'shared-marquee-right' : 'shared-marquee-left'} ${isPaused ? 'shared-marquee-paused' : ''}`}
                      style={marqueeStyle}
                    >
                      {loopingImages.map((image, imageIndex) => (
                        <div
                          key={`${key}-${imageIndex}`}
                          style={{borderRadius: sharedSpaceBaseRadii[index]}}
                          className="relative h-40 w-52 flex-none overflow-hidden shadow-2xl [transform:translateZ(0)] isolation-isolate [-webkit-mask-image:-webkit-radial-gradient(white,black)] sm:h-44 sm:w-60"
                        >
                          <img
                            src={image}
                            alt={gallery.title}
                            className="h-full w-full object-cover"
                            referrerPolicy="no-referrer"
                            decoding="async"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div
            className="hidden grid-cols-1 gap-10 md:grid-cols-3 md:gap-8 lg:grid"
            onMouseLeave={() => setHoveredSharedSpace(null)}
          >
            {displayedSharedSpaces.map((space, index) => (
              <div
                key={`shared-slot-${index}-${activeSharedSpaceState?.key ?? 'base'}-${activeSharedSpaceState?.index ?? 'base'}`}
                className="flex flex-col items-center text-center"
              >
                <div className="mb-6 inline-block md:mb-8">
                  <div className="relative h-56 w-56 sm:h-64 sm:w-64 md:h-80 md:w-80">
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        key={`shared-image-${index}-${space.galleryKey}-${space.image}-${space.isHoveredState ? 'hover' : 'base'}`}
                        initial={space.isHoveredState
                          ? {
                              opacity: space.slotIndex === space.sourceSlotIndex ? 1 : 0.04,
                              scale: space.slotIndex === space.sourceSlotIndex ? 1 : 0.988,
                              x: getSharedSpaceMotionOffset(space.slotIndex, space.sourceSlotIndex),
                              filter: space.slotIndex === space.sourceSlotIndex ? 'blur(0px)' : 'blur(6px)',
                            }
                          : {
                              opacity: 1,
                              scale: 1,
                            }}
                        animate={{opacity: 1, scale: 1, x: 0, filter: 'blur(0px)'}}
                        exit={space.isHoveredState
                          ? {
                              opacity: space.slotIndex === space.sourceSlotIndex ? 0.94 : 0.56,
                              scale: space.slotIndex === space.sourceSlotIndex ? 0.998 : 0.972,
                              x: getSharedSpaceMotionOffset(space.slotIndex, space.sourceSlotIndex),
                              filter: space.slotIndex === space.sourceSlotIndex ? 'blur(0px)' : 'blur(3px)',
                              transition: space.slotIndex === space.sourceSlotIndex
                                ? {
                                    opacity: {duration: 0.62, ease: [0.16, 1, 0.3, 1]},
                                    scale: {duration: 0.72, ease: [0.16, 1, 0.3, 1]},
                                    x: {duration: 0.78, ease: [0.16, 1, 0.3, 1]},
                                    filter: {duration: 0.52, ease: [0.16, 1, 0.3, 1]},
                                  }
                                : {
                                    opacity: {duration: 2.2, ease: [0.16, 1, 0.3, 1]},
                                    scale: {duration: 2.35, ease: [0.16, 1, 0.3, 1]},
                                    x: {duration: 2.65, ease: [0.16, 1, 0.3, 1]},
                                    filter: {duration: 1.95, ease: [0.16, 1, 0.3, 1]},
                                  },
                            }
                          : {
                              opacity: 1,
                              scale: 1,
                            }}
                        transition={{
                          opacity: {
                            duration: space.slotIndex === space.sourceSlotIndex ? 0.58 : 2.35,
                            ease: [0.16, 1, 0.3, 1],
                            delay: space.slotIndex === space.sourceSlotIndex ? 0 : 0.18,
                          },
                          scale: {
                            duration: space.slotIndex === space.sourceSlotIndex ? 0.62 : 2.45,
                            ease: [0.16, 1, 0.3, 1],
                          },
                          x: {
                            duration: space.slotIndex === space.sourceSlotIndex ? 0.68 : 2.8,
                            ease: [0.16, 1, 0.3, 1],
                          },
                          filter: {
                            duration: space.slotIndex === space.sourceSlotIndex ? 0.48 : 2.1,
                            ease: [0.16, 1, 0.3, 1],
                            delay: space.slotIndex === space.sourceSlotIndex ? 0 : 0.12,
                          },
                        }}
                        onMouseEnter={() => {
                          if (!space.isHoveredState) {
                            setHoveredSharedSpace({key: space.galleryKey, index});
                          }
                        }}
                        onMouseLeave={() => setHoveredSharedSpace(null)}
                        style={{
                          borderRadius: activeSharedSpaceState
                            ? sharedSpaceBaseRadii[space.sourceSlotIndex]
                            : sharedSpaceBaseRadii[index],
                          clipPath: activeSharedSpaceState
                            ? `inset(0 round ${sharedSpaceBaseRadii[space.sourceSlotIndex]})`
                            : `inset(0 round ${sharedSpaceBaseRadii[index]})`,
                          zIndex: space.isHoveredState && space.slotIndex === space.sourceSlotIndex ? 3 : 1,
                        }}
                        className="absolute inset-0 overflow-hidden shadow-2xl [transform:translateZ(0)] isolation-isolate [-webkit-mask-image:-webkit-radial-gradient(white,black)]"
                      >
                        <img
                          src={space.image}
                          alt={space.title}
                          className="absolute inset-0 h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                          decoding="async"
                        />
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>

                {!activeSharedSpaceState ? (
                  <motion.div
                    initial={false}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.48, ease: [0.25, 0.1, 0.25, 1]}}
                    className="max-w-[260px]"
                  >
                    <h3 className="text-xl font-bold text-white sm:text-2xl">{space.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-white/75">{space.summary}</p>
                  </motion.div>
                ) : (
                  <div className="max-w-[260px] opacity-0">
                    <h3 className="text-xl font-bold sm:text-2xl">.</h3>
                    <p className="mt-3 text-sm leading-relaxed">.</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 hidden min-h-[84px] text-center md:mt-10 md:min-h-[112px] lg:block">
            <AnimatePresence mode="wait">
              {activeSharedSpace ? (
                <motion.div
                  key={activeSharedSpaceState?.key}
                  initial={{opacity: 0, y: 18, scale: 0.98}}
                  animate={{opacity: 1, y: 0, scale: 1}}
                  exit={{opacity: 0, y: 10, scale: 0.98}}
                  transition={{duration: 0.6, ease: [0.16, 1, 0.3, 1]}}
                >
                  <h3 className="text-2xl font-bold text-white md:text-4xl">
                    {activeSharedSpace.title}
                  </h3>
                  <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-white/75 md:text-base">
                    {activeSharedSpace.summary}
                  </p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </section>

      <section id="localisation" className="bg-gray-50 py-24 md:py-32">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <div className="grid grid-cols-1 items-stretch gap-12 md:gap-16 lg:grid-cols-2">
            <motion.div
              initial={{opacity: 0, x: -40}}
              whileInView={{opacity: 1, x: 0}}
              viewport={{once: true}}
              transition={{duration: 0.8}}
            >
              <h2 className="mb-6 font-serif text-3xl font-black leading-[1.1] text-gray-900 md:mb-8 md:text-5xl">
                Un emplacement stratégique
              </h2>
              <p className="mb-8 text-base text-gray-600 md:mb-10 md:text-lg">
                Profitez d’un cadre de travail calme tout en restant connecté à Rennes. Pour une recherche
                de location de bureaux à Rennes, le site combine proximité, accessibilité et confort.
              </p>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <LocationCard icon={<Car className="text-primary" size={28} />} title="Parking gratuit" description="Stationnement facile et gratuit pour vous et vos clients." />
                <LocationCard icon={<MapPin className="text-primary" size={28} />} title="Accès rapide" description="À 5 minutes de la rocade (D177) et 10 min de Rennes centre." />
                <LocationCard icon={<Coffee className="text-primary" size={28} />} title="Commerces" description="Boulangeries, restaurants à moins de 10 min à pied et food trucks à proximité." />
                <LocationCard icon={<Info className="text-primary" size={28} />} title="Espaces verts" description="Parcs et chemins de balade à proximité pour s’aérer l’esprit." />
              </div>
            </motion.div>

            <motion.div
              initial={{opacity: 0, y: 40}}
              whileInView={{opacity: 1, y: 0}}
              viewport={{once: true}}
              transition={{duration: 0.8, delay: 0.2}}
              className="relative min-h-[320px] overflow-hidden rounded-3xl shadow-xl sm:min-h-[400px]"
            >
              <iframe
                title={`Carte Google Maps - ${siteConfig.address.street}, ${siteConfig.address.city}`}
                src="https://www.google.com/maps?q=16%20rue%20L%C3%A9o%20Lagrange%2C%2035131%20Chartres-de-Bretagne&z=16&output=embed"
                className="h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />

              <div className="pointer-events-none absolute inset-x-4 bottom-4 sm:inset-x-6 sm:bottom-6">
                <div className="inline-flex max-w-full items-center gap-2 rounded-full bg-gray-900/90 px-4 py-2.5 text-xs font-bold text-white shadow-2xl backdrop-blur sm:px-5 sm:py-3 sm:text-sm">
                  <MapPin size={16} className="text-primary" />
                  <span className="truncate">{siteConfig.address.street}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="bg-[#f7f8f4] py-20 md:py-24">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <div className="border-t border-b border-gray-200 py-10 md:py-12">
            <div className="grid grid-cols-1 gap-10 md:gap-12 lg:grid-cols-[1.12fr_0.88fr] lg:items-start">
              <motion.div
              initial={{opacity: 0, y: 30}}
              whileInView={{opacity: 1, y: 0}}
              viewport={{once: true}}
              transition={{duration: 0.7}}
            >
                <h2 className="mt-3 max-w-3xl font-serif text-3xl font-black leading-[1.08] text-gray-900 md:mt-4 md:text-5xl">
                  Pourquoi l&apos;esquisse commune
                </h2>
                <div className="mt-5 max-w-3xl space-y-4 text-sm leading-relaxed text-gray-600 md:mt-6 md:space-y-5 md:text-base">
                  <p>
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 font-semibold text-primary">Esquisse</span> : première étude d’une composition picturale, sculpturale ou architecturale, qui en trace les grandes lignes et sert de base à sa réalisation.
                    <br />
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 font-semibold text-primary">Commune</span> : ce qui se fait ensemble, à plusieurs, dans le partage et la mise en relation.
                  </p>

                  <p>
                    L’Esquisse Commune est née de cette idée simple : un lieu où les projets prennent forme, mais jamais tout à fait seuls. Imaginé avec Losange Architectes, cet espace a été conçu comme un cadre d’activité où peuvent se croiser les idées, les métiers et les énergies. On y crée, on y échange, on y tisse des liens humains. <span className="rounded-full bg-primary/10 px-2.5 py-1 font-semibold text-primary">Le collectif</span> y a toute sa place, sans jamais effacer le besoin d’intimité.
                  </p>

                  <p>
                    Ici, chaque entrepreneur, indépendant ou petite entreprise, développe son activité à son rythme, dans son bureau fermé et privatif, tout en profitant d’espaces partagés pensés pour <span className="rounded-full bg-primary/10 px-2.5 py-1 font-semibold text-primary">se retrouver, collaborer et avancer</span> dans un environnement stimulant. L’esquisse commune est donc le lieu idéal si vous recherchez une location de bureaux à Rennes, en ayant accès à des salles de réunions et phonebox, alliant confort, proximité et partage.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{opacity: 0, y: 30}}
                whileInView={{opacity: 1, y: 0}}
                viewport={{once: true}}
                transition={{duration: 0.7, delay: 0.15}}
                className="border-t border-gray-200 pt-10 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-[3.8rem]"
              >
                <div className="flex flex-col items-center gap-6 md:flex-row md:items-start md:gap-8">
                  <div className="shrink-0 overflow-hidden rounded-full bg-[#ececec]">
                    <img
                      src="/marika.png"
                      alt="Portrait de Marika"
                      className="h-36 w-36 object-cover md:h-44 md:w-44"
                    />
                  </div>

                  <div className="flex-1 text-center md:text-left">
                    <h3 className="font-serif text-3xl font-black text-gray-900 md:text-4xl">Marika</h3>
                    <p className="mt-3 max-w-md text-sm leading-relaxed text-gray-600 md:mt-4 md:text-base">
                      Je suis à votre écoute pour vous présenter le lieu, comprendre votre activité et vous orienter
                      vers le bureau le plus adapté à vos besoins.
                    </p>
                    <a
                      href={`tel:${siteConfig.phoneLink}`}
                      className="mt-5 inline-flex w-full items-center justify-center gap-3 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-primary/90 sm:w-auto md:mt-6"
                    >
                      Me contacter
                      <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-[0.12em] text-white/90">
                        {siteConfig.phoneDisplay}
                      </span>
                    </a>
                  </div>
                </div>

                <div className="mt-6 border-t border-gray-200 pt-6 md:mt-8 md:pt-8">
                  <p className="mt-1 max-w-lg font-serif text-lg leading-tight text-primary md:text-[1.65rem]">
                    “Un lieu simple, vivant et professionnel, pensé pour accueillir les entreprises près de Rennes.”
                  </p>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{opacity: 0, y: 30}}
              whileInView={{opacity: 1, y: 0}}
              viewport={{once: true}}
              transition={{duration: 0.7, delay: 0.1}}
              className="mt-10 overflow-hidden rounded-3xl md:mt-12"
            >
              <img
                src="/esquisse-exterieur.jpg"
                alt="Façade du bâtiment de l'esquisse commune"
                className="h-[260px] w-full object-cover sm:h-[320px] md:h-[420px]"
                loading="lazy"
                decoding="async"
              />
            </motion.div>
          </div>
        </div>
      </section>

      <section id="reservation" className="bg-primary py-24 md:py-32">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <div className="mb-10 text-center md:mb-12">
            <h2 className="font-serif text-3xl font-black text-white md:text-5xl">Demander une visite de bureau près de Rennes</h2>
          </div>

          <div className="mx-auto max-w-6xl">
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

function RoomLayoutIcon({layout}: {layout: 'boardroom' | 'ushape' | 'theatre'}) {
  if (layout === 'boardroom') {
    return (
      <svg viewBox="0 0 120 86" className="h-14 w-24 text-primary" aria-hidden="true">
        <rect x="31" y="24" width="58" height="30" rx="2" fill="currentColor" />
        <circle cx="23" cy="39" r="4.5" fill="currentColor" />
        <circle cx="97" cy="39" r="4.5" fill="currentColor" />
        <circle cx="43" cy="15" r="4.5" fill="currentColor" />
        <circle cx="60" cy="15" r="4.5" fill="currentColor" />
        <circle cx="77" cy="15" r="4.5" fill="currentColor" />
        <circle cx="43" cy="63" r="4.5" fill="currentColor" />
        <circle cx="60" cy="63" r="4.5" fill="currentColor" />
        <circle cx="77" cy="63" r="4.5" fill="currentColor" />
      </svg>
    );
  }

  if (layout === 'ushape') {
    return (
      <svg viewBox="0 0 120 86" className="h-14 w-24 text-primary" aria-hidden="true">
        <rect x="30" y="24" width="54" height="30" rx="2" fill="currentColor" />
        <rect x="96" y="14" width="6" height="50" rx="1" fill="currentColor" />
        <circle cx="42" cy="15" r="4.5" fill="currentColor" />
        <circle cx="59" cy="15" r="4.5" fill="currentColor" />
        <circle cx="76" cy="15" r="4.5" fill="currentColor" />
        <circle cx="42" cy="63" r="4.5" fill="currentColor" />
        <circle cx="59" cy="63" r="4.5" fill="currentColor" />
        <circle cx="76" cy="63" r="4.5" fill="currentColor" />
        <circle cx="18" cy="31" r="4.5" fill="currentColor" />
        <circle cx="18" cy="47" r="4.5" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 120 86" className="h-14 w-24 text-primary" aria-hidden="true">
      <rect x="24" y="18" width="62" height="6" rx="1" fill="currentColor" />
      <circle cx="23" cy="42" r="4.5" fill="currentColor" />
      <circle cx="39" cy="42" r="4.5" fill="currentColor" />
      <circle cx="55" cy="42" r="4.5" fill="currentColor" />
      <circle cx="71" cy="42" r="4.5" fill="currentColor" />
      <circle cx="87" cy="42" r="4.5" fill="currentColor" />
      <circle cx="23" cy="58" r="4.5" fill="currentColor" />
      <circle cx="39" cy="58" r="4.5" fill="currentColor" />
      <circle cx="55" cy="58" r="4.5" fill="currentColor" />
      <circle cx="71" cy="58" r="4.5" fill="currentColor" />
      <circle cx="87" cy="58" r="4.5" fill="currentColor" />
    </svg>
  );
}
