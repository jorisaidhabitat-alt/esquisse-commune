import {
  Accessibility,
  ArrowRight,
  CalendarDays,
  Car,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Compass,
  Info,
  MapPin,
  Maximize,
  MonitorPlay,
  Users,
  Wallet,
  Wifi,
} from 'lucide-react';
import {AnimatePresence, motion} from 'motion/react';
import type {ComponentType, ImgHTMLAttributes, ReactNode, TouchEvent} from 'react';
import {lazy, Suspense, useEffect, useRef, useState} from 'react';
import {desks} from '../data/desks';
import {galleryData} from '../data/gallery';
import {rooms} from '../data/rooms';
import {
  getRoomBookingMode,
  type RoomBookingMode,
} from '../lib/reservation';
import {siteConfig} from '../data/site';
import {applyJsonLd, applySeo} from '../lib/seo';
import type {ReservationPrefill} from '../components/ReservationForm';

const loadReservationForm = () => import('../components/ReservationForm');

const ReservationForm = lazy(async () => {
  const module = await loadReservationForm();
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
    src: '/gallery/salon-3.jpg',
    alt: 'Salle de pause partagée près de Rennes',
  },
  {
    src: '/gallery/cafet-6.jpg',
    alt: 'Cuisine partagée près de Rennes',
    objectPosition: '64% center',
  },
  {
    src: '/rooms/la-place-1.jpg',
    alt: 'Salle La Place à Chartres-de-Bretagne, proche de Rennes',
    objectPosition: '34% center',
  },
] as const;

const sharedSpaceBaseRadii = ['0 0 10rem 10rem', '50% 50% 50% 0', '10rem 10rem 0 0'] as const;
const sharedSpaces = Object.entries(galleryData);

export function HomePage() {
  const [selectedSharedSpace, setSelectedSharedSpace] = useState<{key: string; index: number} | null>(null);
  const [sharedSpaceCycleReset, setSharedSpaceCycleReset] = useState(0);
  const [isSharedSpacesDesktop, setIsSharedSpacesDesktop] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 768 : false,
  );
  const [hasPointerHover, setHasPointerHover] = useState(false);
  const [openDeskChargesInfo, setOpenDeskChargesInfo] = useState<string | null>(null);
  const [openRoomHighlight, setOpenRoomHighlight] = useState<string | null>(null);
  const [prefill, setPrefill] = useState<ReservationPrefill>(null);
  const [shouldLoadReservationForm, setShouldLoadReservationForm] = useState(false);
  const [deskImageIndexes, setDeskImageIndexes] = useState<Record<string, number>>({});
  const [roomImageIndexes, setRoomImageIndexes] = useState<Record<string, number>>({});
  const [roomCardSelections, setRoomCardSelections] = useState<Record<string, {mode: RoomBookingMode | null; options: string[]}>>({});
  const deskTouchStartX = useRef<Record<string, number>>({});
  const deskTouchStartY = useRef<Record<string, number>>({});
  const reservationSectionRef = useRef<HTMLElement | null>(null);

  const getDeskAmount = (value: string) => Number(value.replace(/[^\d]/g, '')) || 0;

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

    applyJsonLd('website', {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: siteConfig.brand,
      alternateName: siteConfig.brandAlternates,
      url: siteConfig.siteUrl,
      inLanguage: 'fr-FR',
      description: siteConfig.seo.defaultDescription,
    });
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setDeskImageIndexes((current) => {
        const next = {...current};

        desks.forEach((desk) => {
          if (desk.images.length <= 1) {
            next[desk.id] = 0;
            return;
          }

          const currentIndex = current[desk.id] ?? 0;
          next[desk.id] = (currentIndex + 1) % desk.images.length;
        });

        return next;
      });
    }, 5000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    const syncPointerHover = (event?: MediaQueryListEvent) => {
      const nextValue = event ? event.matches : mediaQuery.matches;
      setHasPointerHover(nextValue);

      if (nextValue) {
        setOpenDeskChargesInfo(null);
      }
    };

    syncPointerHover();
    mediaQuery.addEventListener('change', syncPointerHover);

    return () => mediaQuery.removeEventListener('change', syncPointerHover);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setRoomImageIndexes((current) => {
        const next = {...current};

        rooms.forEach((room) => {
          const images = (room.images.length ? room.images : [room.image]).slice(0, 3);
          const currentIndex = current[room.id] ?? 0;
          next[room.id] = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
        });

        return next;
      });
    }, 5000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    const syncSharedSpacesViewport = (event?: MediaQueryListEvent) => {
      setIsSharedSpacesDesktop(event?.matches ?? mediaQuery.matches);
    };

    syncSharedSpacesViewport();
    mediaQuery.addEventListener('change', syncSharedSpacesViewport);

    return () => mediaQuery.removeEventListener('change', syncSharedSpacesViewport);
  }, []);

  useEffect(() => {
    if (shouldLoadReservationForm || !reservationSectionRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoadReservationForm(true);
          observer.disconnect();
        }
      },
      {rootMargin: '600px 0px'},
    );

    observer.observe(reservationSectionRef.current);

    return () => observer.disconnect();
  }, [shouldLoadReservationForm]);

  useEffect(() => {
    if (!shouldLoadReservationForm) {
      return;
    }

    void loadReservationForm();
  }, [shouldLoadReservationForm]);

  const scrollToReservation = () => {
    setShouldLoadReservationForm(true);
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

  const goToRoomImage = (roomId: string, imageIndex: number) => {
    setRoomImageIndexes((current) => ({...current, [roomId]: imageIndex}));
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

  const toggleRoomHighlight = (label: string) => {
    setOpenRoomHighlight((current) => (current === label ? null : label));
  };

  const resetSharedSpaces = () => {
    setSelectedSharedSpace(null);
  };

  const activeSharedSpaceState = selectedSharedSpace;
  const activeSharedSpace = activeSharedSpaceState ? galleryData[activeSharedSpaceState.key as keyof typeof galleryData] : null;
  const desktopSharedSpaceKey = (activeSharedSpaceState?.key ?? sharedSpaces[0]?.[0]) as keyof typeof galleryData;
  const desktopSharedSpace = galleryData[desktopSharedSpaceKey];
  const desktopSharedSpaceImages = desktopSharedSpace.images.slice(0, 3);

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
              {heroImages.map((image, index) => {
                const imageCardClassName = `relative aspect-[196/460] overflow-hidden border border-primary/20 bg-[#f7f5ef] md:h-[460px] md:aspect-auto ${
                  index === 1
                    ? 'rounded-[0_3.75rem_0_3.75rem] md:rounded-[0_5.5rem_0_5.5rem]'
                    : 'rounded-[3.75rem_0_3.75rem_0] md:rounded-[5.5rem_0_5.5rem_0]'
                }`;
                const imageNode = (
                  <>
                    <OptimizedImage
                      src={image.src}
                      alt={image.alt}
                      className="h-full w-full object-cover"
                      style={'objectPosition' in image ? {objectPosition: image.objectPosition} : undefined}
                      referrerPolicy="no-referrer"
                      loading={index === 0 ? 'eager' : 'lazy'}
                      fetchPriority={index === 0 ? 'high' : 'auto'}
                      decoding={index === 0 ? 'sync' : 'async'}
                      width={index === 0 ? 999 : undefined}
                      height={index === 0 ? 1500 : undefined}
                      sizes={index === 0 ? '(min-width: 768px) 196px, 33vw' : undefined}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/12 via-transparent to-white/10" />
                  </>
                );

                if (index === 0) {
                  return (
                    <div key={image.src} className={imageCardClassName}>
                      {imageNode}
                    </div>
                  );
                }

                return (
                  <motion.div
                    key={image.src}
                    initial={{opacity: 0, y: 28}}
                    whileInView={{opacity: 1, y: 0}}
                    viewport={{once: true}}
                    transition={{duration: 0.6, delay: 0.15 * index}}
                    className={imageCardClassName}
                  >
                    {imageNode}
                  </motion.div>
                );
              })}
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
          <div className="mx-auto mb-14 max-w-3xl text-left md:mb-16 md:text-center">
            <div>
              <h2 className="text-center font-serif text-4xl font-black text-white md:text-5xl">Vos bureaux à louer</h2>
              <p className="mt-5 text-base leading-relaxed text-white/80 md:mt-6 md:text-lg">
                Vous recherchez une location de bureaux à Rennes ? Découvrez nos bureaux privés, lumineux et
                aménageables, implantés à Chartres-de-Bretagne, proche de Rennes.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
            {desks.map((desk) => (
              <article
                key={desk.id}
                className={`group flex flex-col overflow-visible rounded-3xl bg-gray-50 text-left text-gray-900 shadow-lg transition-transform duration-300 ${
                  desk.available ? 'hover:-translate-y-2 hover:shadow-2xl' : 'opacity-80'
                }`}
              >
                <div
                  className="relative h-56 overflow-hidden rounded-t-3xl sm:h-64"
                  onTouchStart={(event) => handleDeskTouchStart(desk.id, event)}
                  onTouchEnd={(event) => handleDeskTouchEnd(desk.id, desk.images.length, event)}
                  style={{touchAction: 'pan-y'}}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={`${desk.id}-${desk.images[deskImageIndexes[desk.id] ?? 0]}`}
                      initial={{opacity: 0}}
                      animate={{opacity: 1}}
                      exit={{opacity: 0}}
                      transition={{duration: 0.35, ease: 'easeOut'}}
                      className="absolute inset-0 overflow-hidden rounded-t-3xl"
                    >
                      <OptimizedImage
                        src={desk.images[deskImageIndexes[desk.id] ?? 0]}
                        alt={`${desk.name} ${(deskImageIndexes[desk.id] ?? 0) + 1}`}
                        className={`h-full w-full rounded-t-3xl object-cover ${
                          !desk.available ? 'grayscale' : ''
                        }`}
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        decoding="async"
                      />
                    </motion.div>
                  </AnimatePresence>
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
                  <div className="mb-5">
                    <h3 className="font-serif text-[1.35rem] font-bold text-gray-900 sm:text-2xl">{desk.name}</h3>
                    <p className="mt-2 text-sm font-medium text-primary/85">Accès aux espaces partagés</p>
                  </div>
                  <div className="mb-7 grid grid-cols-2 gap-x-2 gap-y-4 text-sm text-gray-700">
                    <div className="grid grid-cols-[16px_1fr] items-center gap-x-2"><Maximize size={16} className="text-primary" /> <span>{desk.size}</span></div>
                    <div className="grid grid-cols-[16px_1fr] items-center gap-x-2"><Compass size={16} className="text-primary" /> <span>{desk.orientation}</span></div>
                    <div className="grid grid-cols-[16px_1fr] items-center gap-x-2"><Users size={16} className="text-primary" /> <span>{desk.capacity}</span></div>
                    <div className="grid grid-cols-[16px_1fr] gap-x-2 pt-3.5">
                      <Wallet size={16} className="text-primary" />
                      <div>
                        <div>{desk.price}</div>
                        <div className="pt-1 text-xs font-medium text-gray-500">
                          <span className="group/info relative inline-flex items-center gap-1.5">
                            <span>Charges comprises</span>
                            <span className="relative inline-flex">
                              <button
                                type="button"
                                aria-label="Voir le détail des charges comprises"
                                aria-expanded={openDeskChargesInfo === desk.id}
                                onClick={() => {
                                  if (hasPointerHover) {
                                    return;
                                  }

                                  setOpenDeskChargesInfo((current) => current === desk.id ? null : desk.id);
                                }}
                                className="inline-flex h-5 w-5 items-center justify-center rounded-full text-gray-500"
                              >
                                <Info size={13} />
                              </button>
                              <span className={`absolute bottom-[calc(100%+0.5rem)] right-0 z-20 w-[min(16rem,calc(100vw-4rem))] rounded-xl bg-gray-900 px-3 py-3 text-[11px] font-medium leading-relaxed text-white shadow-xl transition-opacity duration-200 sm:left-1/2 sm:right-auto sm:w-64 sm:-translate-x-1/2 ${
                                hasPointerHover
                                  ? 'pointer-events-none opacity-0 group-hover/info:opacity-100'
                                  : openDeskChargesInfo === desk.id
                                    ? 'opacity-100'
                                    : 'pointer-events-none opacity-0'
                              }`}>
                                <span className="grid grid-cols-[auto_1fr_auto] items-center gap-x-2">
                                  <span>Loyer</span>
                                  <span className="overflow-hidden text-white/55">................................</span>
                                  <span className="text-right">{getDeskAmount(desk.price) - getDeskAmount(desk.charges)}€ / mois HT</span>
                                </span>
                                <span className="mt-1 grid grid-cols-[auto_1fr_auto] items-center gap-x-2">
                                  <span>Charges</span>
                                  <span className="overflow-hidden text-white/55">................................</span>
                                  <span className="text-right">{desk.charges} / mois HT</span>
                                </span>
                                <span className="mt-2 block border-t border-white/15" />
                                <span className="mt-2 grid grid-cols-[auto_1fr_auto] items-center gap-x-2 font-semibold">
                                  <span>Total</span>
                                  <span className="overflow-hidden text-white/55">................................</span>
                                  <span className="text-right">{desk.price} HT</span>
                                </span>
                                <span className="mt-2 block text-white/80">
                                  Comprend le loyer, l’électricité, l’eau, le gaz et internet.
                                </span>
                              </span>
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
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
          <div className="mb-16 text-left md:mb-24 md:text-center">
            <h2 className="mb-6 text-center font-serif text-4xl font-black text-gray-900 md:text-5xl">Salles de réunion</h2>
            <p className="mb-10 max-w-3xl text-base text-gray-600 md:mx-auto md:mb-12 md:text-lg">
              Des salles disponibles pour vos réunions, ateliers, formations et rendez-vous clients, dans un
              environnement professionnel et calme.
            </p>

            <div className="grid grid-cols-3 gap-2 text-gray-700 md:flex md:flex-row md:flex-wrap md:justify-center md:gap-12">
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
                <div className="relative z-10 h-[340px] w-full overflow-hidden rounded-3xl shadow-2xl sm:h-[400px] lg:h-[600px] lg:w-2/3">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={`${room.id}-${roomImages[activeRoomImageIndex]}`}
                      initial={{opacity: 0}}
                      animate={{opacity: 1}}
                      exit={{opacity: 0}}
                      transition={{duration: 0.4, ease: 'easeOut'}}
                      className="absolute inset-0"
                    >
                      <OptimizedImage
                        src={roomImages[activeRoomImageIndex]}
                        alt={`${room.name} ${activeRoomImageIndex + 1}`}
                        className={`absolute inset-0 h-full w-full object-cover ${
                          room.available ? 'hover:scale-105' : 'grayscale'
                        }`}
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        decoding="async"
                      />
                    </motion.div>
                  </AnimatePresence>
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
                  <div className="absolute inset-x-4 bottom-4 flex justify-center gap-2 sm:inset-x-6 sm:bottom-6">
                    {roomImages.map((image, imageIndex) => (
                      <button
                        key={`${room.id}-dot-${image}`}
                        type="button"
                        aria-label={`Voir la photo ${imageIndex + 1} de ${room.name}`}
                        aria-pressed={activeRoomImageIndex === imageIndex}
                        onClick={() => goToRoomImage(room.id, imageIndex)}
                        className={`h-2.5 rounded-full transition-all duration-300 ${
                          activeRoomImageIndex === imageIndex
                            ? 'w-6 bg-white'
                            : 'w-2.5 bg-white/45 hover:bg-white/70'
                        }`}
                      />
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
                <div className={`relative z-20 mt-4 w-full rounded-3xl border border-gray-100 bg-white p-5 shadow-2xl sm:-mt-11 sm:p-7 lg:mt-0 lg:w-[44%] lg:p-8 xl:w-[42%] xl:p-9 ${
                  index % 2 === 0 ? 'lg:-ml-32' : 'lg:-mr-32'
                }`}>
                  <div className="mb-5 md:mb-6 lg:mb-5">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-serif text-[1.8rem] font-black text-gray-900 sm:text-3xl">{room.name}</h3>
                      {room.surface ? (
                        <p className="pt-1 text-sm font-medium text-gray-500 sm:pt-2">{room.surface}</p>
                      ) : null}
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-gray-600 sm:mt-4 sm:text-base">{room.description}</p>
                  </div>

                  <div className="space-y-7 lg:space-y-6">
                    <div>
                      <div className="grid gap-3 sm:grid-cols-3">
                        {roomRates.map((rate) => (
                          <button
                            key={`${room.id}-${rate.label}`}
                            type="button"
                            onClick={() => {
                              const mode = getRoomBookingMode(rate.label);
                              updateRoomCardSelection(room.id, {
                                mode,
                                options: [],
                              });
                            }}
                            className={`rounded-2xl border px-4 py-3 text-left transition-all sm:px-5 sm:py-4 sm:text-center ${
                              roomCardSelection.mode === getRoomBookingMode(rate.label)
                                ? 'border-primary bg-primary text-white shadow-md'
                                : 'border-gray-200 bg-gray-50 text-gray-900 hover:border-primary/30 hover:bg-white'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-4 sm:flex-col sm:gap-0">
                              <p className={`text-xs font-bold uppercase tracking-[0.16em] ${
                                roomCardSelection.mode === getRoomBookingMode(rate.label) ? 'text-white/75' : 'text-gray-500'
                              }`}>
                                {rate.label}
                              </p>
                              <div className="inline-flex items-baseline gap-1 px-0 py-0 sm:mt-3">
                                <span className={`text-lg font-bold sm:text-xl ${
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
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {room.options?.length ? (
                      <div>
                        <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-gray-500">
                          Options complémentaires
                        </p>
                        <div className="space-y-2">
                          {room.options.map((option) => {
                            const [label, price] = option.split(':');

                            return (
                              <div
                                key={option}
                                className="flex items-start justify-between gap-4 py-1 text-sm"
                              >
                                <span className="leading-relaxed text-gray-800">{label.trim()}</span>
                                {price ? (
                                  <span className="shrink-0 font-bold text-gray-900">{price.trim()}</span>
                                ) : null}
                              </div>
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
                          <p className="min-h-[20px] text-sm leading-snug text-gray-500" />
                        </div>
                        <button
                          type="button"
                          disabled={!roomCardSelection.mode}
                          onClick={() => {
                            setPrefill({
                              reservationType: 'salle',
                              roomId: room.id,
                              roomBookingMode: roomCardSelection.mode ?? undefined,
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

          <div className="mt-20 rounded-3xl border border-gray-200 bg-white px-7 py-12 shadow-xl sm:px-10 sm:py-14 md:mt-32 md:px-12 md:py-16">
            <div className="mb-10 text-left md:text-center">
              <h3 className="text-center font-serif text-3xl font-black text-gray-900 md:text-4xl">Comparer les deux salles</h3>
              <p className="mt-4 max-w-3xl text-sm leading-relaxed text-gray-600 md:mx-auto md:text-base">
                Un tableau simple pour comprendre les configurations possibles et choisir la salle la plus adaptée
                à votre format de réunion.
              </p>
            </div>

            <div className="mx-auto max-w-4xl space-y-4 md:hidden">
              {roomComparisonLayouts.map((layout) => (
                <div key={`mobile-layout-${layout.id}`} className="rounded-2xl border border-gray-200 bg-gray-50/80 p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-primary shadow-sm">
                      <RoomLayoutIcon layout={layout.id} />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">{layout.label}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3">
                    <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-4 shadow-sm">
                      <div>
                        <p className="font-serif text-lg font-black text-gray-900">La Place</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">Pers.</p>
                        <p className="mt-1 text-2xl font-semibold text-gray-900">{layout.capacities.atelier}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl bg-primary/[0.07] px-4 py-4 shadow-sm">
                      <div>
                        <p className="font-serif text-lg font-black text-gray-900">L&apos;Annexe</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">Pers.</p>
                        <p className="mt-1 text-2xl font-semibold text-gray-900">{layout.capacities.board}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mx-auto hidden max-w-6xl overflow-hidden rounded-3xl border border-gray-200 md:block">
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
                  <div key={`atelier-${layout.id}`} className="flex items-center justify-center border-r border-gray-200 px-4 py-5 text-xl font-semibold text-gray-900 last:border-r-0 sm:text-[1.75rem]">
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
                  <div key={`board-${layout.id}`} className="flex items-center justify-center border-r border-gray-200 px-4 py-5 text-xl font-semibold text-gray-900 last:border-r-0 sm:text-[1.75rem]">
                    {layout.capacities.board}
                  </div>
                ))}
              </div>
            </div>

            <div className="mx-auto mt-10 max-w-4xl space-y-6 md:hidden">
              {roomComparisonHighlights.map((item) => (
                <div
                  key={`mobile-highlight-${item.label}`}
                  className="rounded-2xl border border-gray-200 bg-white shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => toggleRoomHighlight(item.label)}
                    className="flex w-full items-center justify-between gap-4 rounded-2xl px-4 py-4 text-left"
                    aria-expanded={openRoomHighlight === item.label}
                  >
                    <span className="text-sm font-bold text-gray-900">{item.label}</span>
                    <motion.span
                      animate={{rotate: openRoomHighlight === item.label ? 45 : 0}}
                      transition={{duration: 0.35, ease: [0.22, 1, 0.36, 1]}}
                      className="text-lg font-semibold text-primary"
                    >
                      +
                    </motion.span>
                  </button>

                  <AnimatePresence initial={false}>
                    {openRoomHighlight === item.label ? (
                      <motion.div
                        key={`room-highlight-panel-${item.label}`}
                        initial={{height: 0, opacity: 0}}
                        animate={{height: 'auto', opacity: 1}}
                        exit={{height: 0, opacity: 0}}
                        transition={{
                          height: {duration: 0.48, ease: [0.22, 1, 0.36, 1]},
                          opacity: {duration: 0.32, ease: 'easeOut'},
                        }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-gray-200 px-4 py-4">
                          <div className="grid gap-3">
                            <div className="rounded-2xl bg-secondary px-4 py-4 ring-1 ring-primary/12">
                              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">La Place</p>
                              <p className="mt-2 text-sm leading-relaxed text-primary">{item.atelier}</p>
                            </div>

                            <div className="rounded-2xl bg-secondary px-4 py-4 ring-1 ring-primary/12">
                              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">L&apos;Annexe</p>
                              <p className="mt-2 text-sm leading-relaxed text-primary">{item.board}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            <div className="mx-auto mt-14 hidden max-w-6xl overflow-hidden rounded-3xl border border-gray-200 md:block">
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
            <h2 className="mb-6 text-center font-serif text-4xl font-black md:text-5xl">Espaces partagés</h2>
            <p className="max-w-2xl text-base text-white/80 md:mx-auto md:text-lg">
              Des lieux de vie conçus pour favoriser les échanges, la créativité et la détente entre deux sessions de travail.
            </p>
          </div>

          {!isSharedSpacesDesktop ? (
          <div>
            <div className="mb-6 flex flex-wrap justify-center gap-2.5">
              {sharedSpaces.map(([key, gallery], index) => {
                const isActive = desktopSharedSpaceKey === key;

                return (
                  <button
                    key={`shared-mobile-filter-${key}`}
                    type="button"
                    onClick={() => {
                      setSelectedSharedSpace({key, index});
                      setSharedSpaceCycleReset((current) => current + 1);
                    }}
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors ${
                      isActive
                        ? 'border-white/20 bg-white text-primary shadow-[0_12px_28px_rgba(255,255,255,0.16)]'
                        : 'border-white/14 bg-white/8 text-white active:border-white/20 active:bg-white/14'
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full bg-current opacity-70" />
                    <span>{gallery.title}</span>
                  </button>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={`shared-mobile-panel-${desktopSharedSpaceKey}`}
                initial={{opacity: 0, y: 6}}
                animate={{opacity: 1, y: 0, scale: 1}}
                exit={{opacity: 0, y: -4}}
                transition={{duration: 0.12, ease: 'easeOut'}}
                className="space-y-5"
              >
                <div className="relative min-h-[19rem] overflow-hidden rounded-3xl shadow-[0_28px_60px_rgba(3,18,61,0.24)]">
                  <OptimizedImage
                    src={desktopSharedSpaceImages[0]}
                    alt={desktopSharedSpace.title}
                    className="shared-space-image-breathe absolute inset-0 h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5">
                    <span className="inline-flex rounded-full border border-white/18 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/85 backdrop-blur-md">
                      {desktopSharedSpace.title}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {desktopSharedSpaceImages.slice(1).map((image, imageIndex) => (
                    <div
                      key={`${desktopSharedSpaceKey}-mobile-detail-${image}`}
                      className="relative min-h-[11.5rem] overflow-hidden rounded-3xl shadow-[0_20px_45px_rgba(3,18,61,0.18)]"
                    >
                      <OptimizedImage
                        src={image}
                        alt={`${desktopSharedSpace.title} - détail ${imageIndex + 2}`}
                        className="shared-space-image-breathe absolute inset-0 h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                        decoding="async"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/22 via-transparent to-transparent" />
                    </div>
                  ))}
                </div>

                <div className="rounded-[2rem] border border-white/12 bg-white/8 p-6 shadow-[0_24px_60px_rgba(3,18,61,0.14)] backdrop-blur-md">
                  <h3 className="font-serif text-3xl font-black leading-tight text-white">
                    {desktopSharedSpace.title}
                  </h3>
                  <p className="mt-4 text-base leading-relaxed text-white/80">
                    {desktopSharedSpace.summary}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2.5">
                    {desktopSharedSpace.services.map((service) => (
                      <span
                        key={`${desktopSharedSpaceKey}-mobile-service-${service}`}
                        className="rounded-full border border-white/14 bg-white/10 px-3.5 py-2 text-sm font-medium text-white/82"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          ) : null}

          {isSharedSpacesDesktop ? (
          <div>
            <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
              {sharedSpaces.map(([key, gallery], index) => {
                const isActive = desktopSharedSpaceKey === key;
                return (
                  <button
                    key={`shared-filter-${key}`}
                    type="button"
                    onClick={() => {
                      setSelectedSharedSpace({key, index});
                      setSharedSpaceCycleReset((current) => current + 1);
                    }}
                    className={`group inline-flex items-center gap-3 rounded-full border px-5 py-3 text-left transition-colors ${
                      isActive
                        ? 'border-white/20 bg-white text-primary shadow-[0_18px_45px_rgba(255,255,255,0.18)]'
                        : 'border-white/14 bg-white/8 text-white hover:border-white/20 hover:bg-white/14'
                    }`}
                  >
                    <span className="h-2.5 w-2.5 rounded-full bg-current opacity-70" />
                    <span className="text-sm font-semibold">{gallery.title}</span>
                  </button>
                );
              })}
            </div>

            <div className="grid items-stretch gap-8 xl:grid-cols-[1.65fr_0.72fr]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`shared-desktop-visual-${desktopSharedSpaceKey}`}
                  initial={{opacity: 0, y: 28, scale: 0.985}}
                  animate={{opacity: 1, y: 0, scale: 1}}
                  exit={{opacity: 0, y: -16, scale: 0.985}}
                  transition={{duration: 0.55, ease: [0.22, 1, 0.36, 1]}}
                  className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(17rem,0.95fr)]"
                >
                  <div className="relative min-h-[36rem] overflow-hidden rounded-3xl shadow-[0_38px_80px_rgba(3,18,61,0.28)]">
                    <OptimizedImage
                      src={desktopSharedSpaceImages[0]}
                      alt={desktopSharedSpace.title}
                      className="shared-space-image-breathe absolute inset-0 h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6">
                      <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/85 backdrop-blur-md">
                        {desktopSharedSpace.title}
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-5">
                    {desktopSharedSpaceImages.slice(1).map((image, imageIndex) => (
                      <div
                        key={`${desktopSharedSpaceKey}-detail-${image}`}
                        className="relative min-h-[17.25rem] overflow-hidden rounded-3xl shadow-[0_28px_60px_rgba(3,18,61,0.22)]"
                      >
                        <OptimizedImage
                          src={image}
                          alt={`${desktopSharedSpace.title} - détail ${imageIndex + 2}`}
                          className="shared-space-image-breathe absolute inset-0 h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                          decoding="async"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/22 via-transparent to-transparent" />
                      </div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>

              <AnimatePresence mode="wait">
                <motion.aside
                  key={`shared-desktop-copy-${desktopSharedSpaceKey}`}
                  initial={{opacity: 0, x: 24}}
                  animate={{opacity: 1, x: 0}}
                  exit={{opacity: 0, x: -18}}
                  transition={{duration: 0.45, ease: [0.22, 1, 0.36, 1]}}
                  className="flex h-full flex-col rounded-[2.6rem] border border-white/12 bg-white/8 p-8 shadow-[0_28px_70px_rgba(3,18,61,0.14)] backdrop-blur-md"
                >
                  <div>
                    <h3 className="font-serif text-4xl font-black leading-tight text-white">
                      {desktopSharedSpace.title}
                    </h3>
                    <div className="mt-6">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/50">Ce que vous y trouvez</p>
                      <div className="mt-4 flex flex-wrap gap-2.5">
                      {desktopSharedSpace.services.map((service) => (
                          <span
                            key={`${desktopSharedSpaceKey}-${service}`}
                            className="rounded-full border border-white/14 bg-white/10 px-4 py-2 text-sm font-medium text-white/82"
                          >
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="mt-5 text-base leading-relaxed text-white/78">
                      {desktopSharedSpace.summary}
                    </p>
                  </div>
                </motion.aside>
              </AnimatePresence>
            </div>

            <div className="mt-12 flex justify-center md:mt-14">
              <button
                type="button"
                onClick={() => {
                  setPrefill(null);
                  scrollToReservation();
                }}
                className="inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-sm font-bold text-primary shadow-[0_18px_45px_rgba(255,255,255,0.2)] transition-colors hover:bg-white/90"
              >
                Louer votre bureau
              </button>
            </div>
          </div>
          ) : null}

          <div className="hidden">
            <AnimatePresence mode="wait" initial={false}>
              {activeSharedSpace ? (
                <motion.div
                  key={`shared-mobile-active-${activeSharedSpaceState?.key}`}
                  initial={{opacity: 0, y: 16, scale: 0.98}}
                  animate={{opacity: 1, y: 0, scale: 1}}
                  exit={{opacity: 0, y: 12, scale: 0.985}}
                  transition={{duration: 0.45, ease: [0.16, 1, 0.3, 1]}}
                  className="rounded-[2rem] border border-white/12 bg-white/10 p-6 shadow-[0_24px_60px_rgba(5,20,70,0.2)] backdrop-blur-xl"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/55">Mode découverte</p>
                      <h3 className="mt-2 text-2xl font-bold text-white">{activeSharedSpace.title}</h3>
                    </div>
                    <button
                      type="button"
                      onClick={resetSharedSpaces}
                      className="inline-flex shrink-0 items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
                    >
                      Réinitialiser
                    </button>
                  </div>

                  <p className="mt-4 text-base leading-relaxed text-white/82">
                    Les trois images affichent différentes vues de ce même espace.
                  </p>

                  <div className="mt-4 flex items-center gap-2">
                    {[0, 1, 2].map((slot) => (
                      <span
                        key={`shared-space-dot-${slot}`}
                        className="h-2.5 w-2.5 rounded-full bg-white/75"
                        aria-hidden="true"
                      />
                    ))}
                    <span className="ml-2 text-sm font-medium text-white/72">3 vues du même espace</span>
                  </div>

                  <p className="mt-5 text-base leading-relaxed text-white/92">{activeSharedSpace.summary}</p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {activeSharedSpace.services.map((service) => (
                      <span
                        key={service}
                        className="rounded-full border border-white/15 bg-white/12 px-3 py-2 text-sm font-medium text-white/82"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="shared-mobile-idle"
                  initial={{opacity: 0, y: 14}}
                  animate={{opacity: 1, y: 0}}
                  exit={{opacity: 0, y: 10}}
                  transition={{duration: 0.35, ease: [0.16, 1, 0.3, 1]}}
                  className="rounded-[2rem] border border-white/10 bg-white/8 p-6 shadow-[0_24px_60px_rgba(5,20,70,0.16)] backdrop-blur-xl"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/55">Mode découverte</p>
                  <h3 className="mt-2 text-xl font-bold text-white">Touchez une photo pour explorer un espace</h3>
                  <p className="mt-3 text-base leading-relaxed text-white/78">
                    Chaque sélection affiche ensuite trois vues du même lieu pour mieux comprendre l’ambiance et les usages.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </section>

      <section id="localisation" className="bg-gray-50 pb-12 pt-24 md:py-32">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <div className="grid grid-cols-1 items-stretch gap-12 md:gap-16 lg:grid-cols-2">
            <motion.div
              initial={{opacity: 0, x: -40}}
              whileInView={{opacity: 1, x: 0}}
              viewport={{once: true}}
              transition={{duration: 0.8}}
            >
              <h2 className="mb-6 text-center font-serif text-3xl font-black leading-[1.1] text-gray-900 md:mb-8 md:text-left md:text-5xl">
                Un emplacement stratégique
              </h2>
              <p className="mb-8 text-base text-gray-600 md:mb-10 md:text-lg">
                Profitez d’un cadre de travail calme tout en restant connecté à Rennes. Pour une recherche
                de location de bureaux à Rennes, le site combine proximité, accessibilité et confort.
              </p>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <LocationCard icon={<Car className="text-white md:text-primary" size={28} />} title="Parking gratuit" description="Stationnement facile et gratuit pour vous et vos clients." />
                <LocationCard icon={<MapPin className="text-white md:text-primary" size={28} />} title="Accès rapide" description="À 5 minutes de la rocade (D177) et 10 min de Rennes centre." />
                <LocationCard icon={<Coffee className="text-white md:text-primary" size={28} />} title="Commerces" description="Boulangeries, restaurants à moins de 10 min à pied et food trucks à proximité." />
                <LocationCard icon={<Info className="text-white md:text-primary" size={28} />} title="Espaces verts" description="Parcs et chemins de balade à proximité pour s’aérer l’esprit." />
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
            </motion.div>
          </div>
        </div>
      </section>

      <section className="bg-[#f7f8f4] pb-20 pt-12 md:py-24">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <div className="py-10 md:py-12">
            <div className="grid grid-cols-1 gap-10 md:gap-12 lg:grid-cols-[1.12fr_0.88fr] lg:items-start">
              <motion.div
              initial={{opacity: 0, y: 30}}
              whileInView={{opacity: 1, y: 0}}
              viewport={{once: true}}
              transition={{duration: 0.7}}
            >
                <h2 className="max-w-3xl text-center font-serif text-3xl font-black leading-[1.08] text-gray-900 md:text-left md:text-5xl">
                  Pourquoi l&apos;esquisse commune
                </h2>
                <div className="mt-8 max-w-3xl space-y-4 text-sm leading-relaxed text-gray-600 md:mt-10 md:space-y-5 md:text-base">
                  <p>
                    <span className="inline-block whitespace-nowrap rounded-full bg-secondary px-2.5 py-1 font-semibold text-primary">Esquisse</span> : première étude d’une composition picturale, sculpturale ou architecturale, qui en trace les grandes lignes et sert de base à sa réalisation.
                    <br />
                    <span className="inline-block whitespace-nowrap rounded-full bg-secondary px-2.5 py-1 font-semibold text-primary">Commune</span> : ce qui se fait ensemble, à plusieurs, dans le partage et la mise en relation.
                  </p>

                  <p>
                    L’Esquisse Commune est née de cette idée simple : un lieu où les projets prennent forme, mais jamais tout à fait seuls. Imaginé avec Losange Architectes, cet espace a été conçu comme un cadre d’activité où peuvent se croiser les idées, les métiers et les énergies. On y crée, on y échange, on y tisse des liens humains. <span className="font-semibold text-primary">Le collectif</span> y a toute sa place, sans jamais effacer le besoin d’intimité.
                  </p>

                  <p>
                    Ici, chaque entrepreneur, indépendant ou petite entreprise, développe son activité à son rythme, dans son bureau fermé et privatif, tout en profitant d’espaces partagés pensés pour <span className="font-semibold text-primary">se retrouver, collaborer et avancer</span> dans un environnement stimulant. L’esquisse commune est donc le lieu idéal si vous recherchez une location de bureaux à Rennes, en ayant accès à des salles de réunions et phonebox, alliant confort, proximité et partage.
                  </p>

                  <p className="font-serif text-lg leading-tight text-primary md:hidden">
                    “Un lieu simple, vivant et professionnel, pensé pour accueillir les entreprises près de Rennes.”
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{opacity: 0, y: 30}}
                whileInView={{opacity: 1, y: 0}}
                viewport={{once: true}}
                transition={{duration: 0.7, delay: 0.15}}
                className="relative border-t border-gray-200 pt-10 lg:border-t-0 lg:pl-12 lg:pt-0"
              >
                <div className="absolute left-0 top-1/2 hidden h-72 w-px -translate-y-1/2 bg-gray-200 lg:block" />
                <div className="flex flex-col items-center gap-6 md:flex-row md:items-start md:gap-8">
                  <div className="shrink-0 overflow-hidden rounded-3xl bg-[#ececec] md:mt-2 md:self-start">
                    <OptimizedImage
                      src="/marika.jpg"
                      alt="Portrait de Marika"
                      className="aspect-square h-36 w-36 object-cover md:h-44 md:w-44"
                    />
                  </div>

                  <div className="flex-1 text-center md:self-start md:text-left">
                    <h3 className="font-serif text-3xl font-black text-gray-900 md:text-4xl">Marika</h3>
                    <p className="mt-3 max-w-md text-[14px] leading-relaxed text-gray-600 md:mt-4 md:text-[14px]">
                      Je suis à votre écoute pour vous présenter le lieu, comprendre votre activité et vous orienter
                      vers le bureau le plus adapté à vos besoins.
                    </p>
                    <a
                      href={`tel:${siteConfig.phoneLink}`}
                      className="mt-5 inline-flex w-full items-center justify-center gap-3 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-primary/90 sm:w-auto md:mt-6"
                    >
                      Me contacter
                      <span className="px-1 text-xs font-semibold tracking-[0.12em] text-white/90">
                        {siteConfig.phoneDisplay}
                      </span>
                    </a>
                  </div>
                </div>

                <div className="mt-6 hidden border-t border-gray-200 pt-6 md:mt-8 md:block md:pt-8">
                  <p className="mt-1 max-w-lg font-serif text-lg leading-tight text-primary md:text-[1.65rem]">
                    “Un lieu simple, vivant et professionnel, pensé pour accueillir les entreprises près de Rennes.”
                  </p>
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      <section id="reservation" ref={reservationSectionRef} className="bg-primary py-24 md:py-32">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <div className="mb-10 text-left md:mb-12 md:text-center">
            <h2 className="text-center font-serif text-3xl font-black text-white md:text-5xl">Demander une visite de bureau près de Rennes</h2>
          </div>

          <div className="mx-auto max-w-6xl">
            {shouldLoadReservationForm ? (
              <Suspense fallback={<div className="rounded-3xl bg-white/10 p-8 text-center text-white/80">Chargement du formulaire…</div>}>
                <ReservationForm prefill={prefill} />
              </Suspense>
            ) : (
              <div className="rounded-3xl bg-white/10 p-8 text-center text-white/80">
                Le formulaire se charge à l’approche de cette section.
              </div>
            )}
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
    <div className="flex min-w-0 flex-col items-center justify-start gap-2 text-center font-medium md:w-auto md:flex-row md:gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-primary md:h-12 md:w-12">
        {icon}
      </div>
      <span className="text-center text-xs leading-tight md:text-base">{label}</span>
    </div>
  );
}

function OptimizedImage({src, alt, ...props}: ImgHTMLAttributes<HTMLImageElement>) {
  if (!src || !alt) {
    return null;
  }

  return <img src={src} alt={alt} {...props} />;
}

function LocationCard({icon, title, description}: {icon: ReactNode; title: string; description: string}) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-primary/12 bg-secondary p-6 shadow-sm md:border-gray-100 md:bg-white">
      {icon}
      <h3 className="mb-2 mt-4 font-bold text-gray-900">{title}</h3>
      <p className="flex-grow text-sm text-primary md:text-gray-500">{description}</p>
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
