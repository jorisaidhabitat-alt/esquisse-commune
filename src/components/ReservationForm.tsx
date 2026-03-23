import {
  ArrowRight,
  Briefcase,
  Building2,
  CalendarDays,
  CheckCircle2,
  Mail,
  MessageSquare,
  MonitorPlay,
  Phone,
  User,
  Users,
} from 'lucide-react';
import {AnimatePresence, motion} from 'motion/react';
import type {FormEvent, ReactNode} from 'react';
import {useEffect, useState} from 'react';
import {DayPicker} from 'react-day-picker';
import {format} from 'date-fns';
import {fr} from 'date-fns/locale';
import {desks} from '../data/desks';
import {rooms} from '../data/rooms';
import {siteConfig} from '../data/site';
import {buildReservationMailto, type ContactPayload, type ReservationType} from '../lib/mailto';

type EventFormatId = 'atelier' | 'teamday' | 'afterwork';

type ReservationPrefill =
  | {
      reservationType: ReservationType;
      deskId?: string;
      roomId?: string;
      eventFormatId?: EventFormatId;
    }
  | null;

const eventFormats: Array<{
  id: EventFormatId;
  title: string;
  description: string;
}> = [
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
];

const timeSlots = Array.from({length: 18}, (_, index) => {
  const hour = 9 + Math.floor(index / 2);
  const minutes = index % 2 === 0 ? '00' : '30';
  return `${hour.toString().padStart(2, '0')}:${minutes}`;
});

const initialContactState: ContactPayload = {
  company: '',
  activity: '',
  attendees: '',
  fullName: '',
  email: '',
  phone: '',
  notes: '',
};

export function ReservationForm({prefill}: {prefill: ReservationPrefill}) {
  const [formStep, setFormStep] = useState(1);
  const [reservationType, setReservationType] = useState<ReservationType | null>('bureau');
  const [selectedDeskId, setSelectedDeskId] = useState<string | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedEventFormatId, setSelectedEventFormatId] = useState<EventFormatId | null>(null);
  const [resDate, setResDate] = useState<Date | undefined>();
  const [resTime, setResTime] = useState('');
  const [contact, setContact] = useState<ContactPayload>(initialContactState);

  useEffect(() => {
    if (!prefill) {
      return;
    }

    setReservationType(prefill.reservationType);
    setSelectedDeskId(prefill.deskId ?? null);
    setSelectedRoomId(prefill.roomId ?? null);
    setSelectedEventFormatId(prefill.eventFormatId ?? null);
    setResDate(undefined);
    setResTime('');

    if (prefill.reservationType === 'bureau' && prefill.deskId) {
      setFormStep(3);
    } else if (prefill.reservationType === 'salle' && prefill.roomId) {
      setFormStep(3);
    } else if (prefill.reservationType === 'event' && prefill.eventFormatId) {
      setFormStep(3);
    } else {
      setFormStep(2);
    }
  }, [prefill]);

  const selectedDesk = desks.find((desk) => desk.id === selectedDeskId) ?? null;
  const selectedRoom = rooms.find((room) => room.id === selectedRoomId) ?? null;
  const selectedEventFormat = eventFormats.find((item) => item.id === selectedEventFormatId) ?? null;

  const selectedOfferLabel =
    reservationType === 'bureau'
      ? selectedDesk?.name ?? 'Bureau privé'
      : reservationType === 'salle'
        ? selectedRoom?.name ?? 'Salle de réunion'
        : selectedEventFormat?.title ?? "Événement d'entreprise";

  const submitLabel =
    reservationType === 'bureau'
      ? 'Demander une visite du bureau'
      : reservationType === 'salle'
        ? 'Envoyer la demande de salle'
        : "Préparer la demande d'événement";

  const notesPlaceholder =
    reservationType === 'bureau'
      ? 'Précisez la date d’installation souhaitée, le nombre de postes, la durée visée ou toute information utile.'
      : reservationType === 'salle'
        ? 'Décrivez votre réunion, le format souhaité ou toute précision utile.'
        : 'Décrivez votre événement, la jauge, les espaces souhaités ou toute précision utile.';

  const handleTypeSelect = (type: ReservationType) => {
    setReservationType(type);
    setSelectedDeskId(null);
    setSelectedRoomId(null);
    setSelectedEventFormatId(null);
    setResDate(undefined);
    setResTime('');
    setFormStep(2);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!reservationType || !resDate || !resTime) {
      return;
    }

    const link = buildReservationMailto({
      email: siteConfig.email,
      reservationType,
      offerLabel: selectedOfferLabel,
      requestedDate: format(resDate, 'EEEE d MMMM yyyy', {locale: fr}),
      requestedTime: resTime,
      contact,
    });

    window.location.href = link;
  };

  return (
    <div className="rounded-3xl bg-[#F4F4F5] p-5 shadow-2xl sm:p-6 md:p-8">
      <AnimatePresence mode="wait">
        {formStep === 1 && (
          <motion.div
            key="step-1"
            initial={{opacity: 0, x: 20}}
            animate={{opacity: 1, x: 0}}
            exit={{opacity: 0, x: -20}}
            transition={{duration: 0.25}}
          >
            <div className="mb-6">
              <h3 className="text-base font-bold text-gray-900">Choisissez votre demande</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                Sélectionnez le type d’espace ou de demande que vous souhaitez nous envoyer.
              </p>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-4">
              <OfferButton
                active={reservationType === 'bureau'}
                image="https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=600"
                title="Bureaux privés"
                description="Location mensuelle avec engagement d’un an renouvelable."
                badge="Recommandé"
                onClick={() => handleTypeSelect('bureau')}
              />
              <OfferButton
                active={reservationType === 'salle'}
                image="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=600"
                title="Salle de réunion"
                description="Réservation à l’heure pour vos rendez-vous, ateliers et comités."
                onClick={() => handleTypeSelect('salle')}
              />
              <OfferButton
                active={reservationType === 'event'}
                image="https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=600"
                title="Événement d'entreprise"
                description="Configuration à l’heure avec espaces partagés et accompagnement."
                onClick={() => handleTypeSelect('event')}
              />
            </div>

            <Progress step={1} totalSteps={4} />
          </motion.div>
        )}

        {formStep === 2 && reservationType === 'bureau' && (
          <SelectionStep
            title="2. Choix du bureau"
            onBack={() => setFormStep(1)}
            items={desks.map((desk) => ({
              id: desk.id,
              title: desk.name,
              subtitle: `${desk.capacity} • ${desk.price}`,
              icon: <Building2 size={20} />,
              image: desk.image,
              disabled: !desk.available,
            }))}
            selectedId={selectedDeskId}
            onSelect={(id) => {
              setSelectedDeskId(id);
              setFormStep(3);
            }}
          />
        )}

        {formStep === 2 && reservationType === 'salle' && (
          <SelectionStep
            title="2. Choix de la salle"
            onBack={() => setFormStep(1)}
            items={rooms.map((room) => ({
              id: room.id,
              title: room.name,
              subtitle: `${room.features[0]} • ${room.priceHour} HT / heure`,
              icon: <Users size={20} />,
              image: room.image,
              disabled: !room.available,
            }))}
            selectedId={selectedRoomId}
            onSelect={(id) => {
              setSelectedRoomId(id);
              setFormStep(3);
            }}
          />
        )}

        {formStep === 2 && reservationType === 'event' && (
          <SelectionStep
            title="2. Format de votre événement"
            onBack={() => setFormStep(1)}
            items={eventFormats.map((item) => ({
              id: item.id,
              title: item.title,
              subtitle: item.description,
              icon: <CalendarDays size={20} />,
            }))}
            selectedId={selectedEventFormatId}
            onSelect={(id) => {
              setSelectedEventFormatId(id as EventFormatId);
              setFormStep(3);
            }}
          />
        )}

        {formStep === 3 && reservationType && (
          <motion.div
            key="step-3"
            initial={{opacity: 0, x: 20}}
            animate={{opacity: 1, x: 0}}
            exit={{opacity: 0, x: -20}}
            transition={{duration: 0.25}}
          >
            <div className="mb-6 flex items-center gap-3">
              <button type="button" onClick={() => setFormStep(2)} className="text-gray-400 transition-colors hover:text-black" aria-label="Revenir à l'étape précédente">
                <ArrowRight size={16} className="rotate-180" />
              </button>
              <h3 className="text-sm font-bold text-gray-900">3. Date et créneau souhaités</h3>
            </div>

            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Sélection actuelle</p>
              <p className="mt-2 text-sm font-semibold text-gray-900">{selectedOfferLabel}</p>
            </div>

            {!resDate ? (
              <div className="mb-6 flex justify-center rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <DayPicker
                  mode="single"
                  selected={resDate}
                  onSelect={setResDate}
                  locale={fr}
                  disabled={[{dayOfWeek: [0, 6]}, {before: new Date()}]}
                  className="!m-0"
                  classNames={{
                    months: 'flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0',
                    month: 'space-y-4',
                    caption: 'relative flex w-full items-center justify-between pt-1',
                    caption_label: 'text-sm font-bold text-gray-900',
                    nav: 'flex items-center space-x-1',
                    nav_button: 'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
                    table: 'w-full border-collapse space-y-1',
                    head_row: 'flex',
                    head_cell: 'w-9 rounded-md text-[0.8rem] font-normal text-gray-500',
                    row: 'mt-2 flex w-full',
                    cell: 'relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-primary/10 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md',
                    day: 'h-9 w-9 rounded-full p-0 font-normal transition-colors hover:bg-gray-100 aria-selected:opacity-100',
                    day_selected: 'bg-primary font-bold text-white hover:bg-primary hover:text-white focus:bg-primary focus:text-white',
                    day_today: 'bg-gray-100 text-gray-900',
                    day_outside: 'text-gray-400 opacity-50',
                    day_disabled: 'text-gray-400 opacity-50',
                    day_hidden: 'invisible',
                  }}
                />
              </div>
            ) : (
              <motion.div
                initial={{opacity: 0, scale: 0.95}}
                animate={{opacity: 1, scale: 1}}
                className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
              >
                <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Date sélectionnée</h4>
                    <p className="font-medium text-primary">{format(resDate, 'EEEE d MMMM yyyy', {locale: fr})}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setResDate(undefined);
                      setResTime('');
                    }}
                    className="text-xs font-bold text-gray-500 underline underline-offset-4 transition-colors hover:text-primary"
                  >
                    Modifier
                  </button>
                </div>

                <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-500">Choisissez une heure</h4>
                <div className="grid max-h-60 grid-cols-3 gap-3 overflow-y-auto pr-2 custom-scrollbar sm:grid-cols-4">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setResTime(time)}
                      className={`rounded-xl border py-3 text-sm font-medium transition-all ${
                        resTime === time
                          ? 'scale-105 border-primary bg-primary text-white shadow-md'
                          : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-primary/50 hover:bg-white'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            <button
              type="button"
              disabled={!resDate || !resTime}
              onClick={() => setFormStep(4)}
              className="mt-2 w-full rounded-xl bg-primary py-4 text-sm font-bold text-white shadow-md transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continuer
            </button>

            <div className="mt-8">
              <Progress step={3} totalSteps={4} />
            </div>
          </motion.div>
        )}

        {formStep === 4 && reservationType && resDate && resTime && (
          <motion.div
            key="step-4"
            initial={{opacity: 0, x: 20}}
            animate={{opacity: 1, x: 0}}
            exit={{opacity: 0, x: -20}}
            transition={{duration: 0.25}}
          >
            <div className="mb-4 flex items-center gap-3">
              <button type="button" onClick={() => setFormStep(3)} className="text-gray-400 transition-colors hover:text-black" aria-label="Revenir à l'étape précédente">
                <ArrowRight size={16} className="rotate-180" />
              </button>
              <h3 className="text-sm font-bold text-gray-900">4. Vos informations</h3>
            </div>

            <div className="mb-6 flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <CheckCircle2 className="mt-0.5 shrink-0 text-primary" size={18} />
              <div>
                <p className="text-xs font-bold text-gray-900">{selectedOfferLabel}</p>
                <p className="mt-1 text-xs font-medium text-gray-500">
                  Le {format(resDate, 'dd MMMM yyyy', {locale: fr})} à {resTime}
                </p>
                {reservationType === 'bureau' && (
                  <p className="mt-2 text-xs font-medium text-primary">
                    Cette demande sert à organiser une visite et qualifier votre besoin de location.
                  </p>
                )}
              </div>
            </div>

            <form className="space-y-3" onSubmit={handleSubmit}>
              {(reservationType === 'bureau' || reservationType === 'event') && (
                <Field
                  id="company"
                  label="Nom de l'entreprise"
                  value={contact.company}
                  onChange={(value) => setContact((current) => ({...current, company: value}))}
                  icon={<Building2 size={16} />}
                  required
                />
              )}

              <Field
                id="activity"
                label={reservationType === 'bureau' ? 'Activité ou besoin' : 'Objet de la demande'}
                value={contact.activity}
                onChange={(value) => setContact((current) => ({...current, activity: value}))}
                icon={<Briefcase size={16} />}
                required={reservationType !== 'salle'}
              />

              {(reservationType === 'bureau' || reservationType === 'event') && (
                <Field
                  id="attendees"
                  label={reservationType === 'bureau' ? 'Effectif ou besoin en postes' : 'Nombre de participants estimé'}
                  value={contact.attendees}
                  onChange={(value) => setContact((current) => ({...current, attendees: value}))}
                  icon={<Users size={16} />}
                  required
                />
              )}

              <Field
                id="fullName"
                label="Nom complet"
                value={contact.fullName}
                onChange={(value) => setContact((current) => ({...current, fullName: value}))}
                icon={<User size={16} />}
                required
              />
              <Field
                id="email"
                type="email"
                label="Email professionnel"
                value={contact.email}
                onChange={(value) => setContact((current) => ({...current, email: value}))}
                icon={<Mail size={16} />}
                required
              />
              <Field
                id="phone"
                type="tel"
                label="Téléphone"
                value={contact.phone}
                onChange={(value) => setContact((current) => ({...current, phone: value}))}
                icon={<Phone size={16} />}
                required
              />

              <div>
                <label htmlFor="notes" className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">
                  {reservationType === 'bureau' ? 'Précisions sur votre besoin locatif' : 'Message complémentaire'}
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-4 top-4 text-gray-400" size={16} />
                  <textarea
                    id="notes"
                    rows={4}
                    value={contact.notes}
                    onChange={(event) => setContact((current) => ({...current, notes: event.target.value}))}
                    placeholder={notesPlaceholder}
                    className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-12 pr-4 text-sm font-medium transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <button type="submit" className="mt-4 w-full rounded-xl bg-primary py-4 text-sm font-bold text-white shadow-md transition-colors hover:bg-primary/90">
                {submitLabel}
              </button>
            </form>

            <p className="mt-4 text-center text-xs font-medium text-gray-500">
              Le bouton ouvre un email prérempli vers <a href={`mailto:${siteConfig.email}`} className="text-primary underline underline-offset-4">{siteConfig.email}</a>.
              {reservationType === 'bureau' && ' Nous revenons ensuite vers vous pour confirmer la visite du bureau.'}
            </p>

            <div className="mt-8">
              <Progress step={4} totalSteps={4} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function OfferButton({
  active,
  image,
  title,
  description,
  badge,
  onClick,
}: {
  active: boolean;
  image: string;
  title: string;
  description: string;
  badge?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-start gap-4 rounded-2xl border-2 p-5 text-left transition-all ${
        active
          ? 'border-primary bg-primary text-white shadow-md'
          : 'border-transparent bg-white text-gray-900 shadow-sm hover:border-primary/20'
      }`}
    >
      <div className="mr-1 h-14 w-14 shrink-0 overflow-hidden rounded-xl">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
          loading="lazy"
          decoding="async"
        />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <span className="block text-sm font-bold">{title}</span>
          {badge && (
            <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${
              active ? 'bg-white/15 text-white' : 'bg-primary/10 text-primary'
            }`}>
              {badge}
            </span>
          )}
        </div>
        <span className={`text-xs ${active ? 'text-white/80' : 'text-gray-500'}`}>{description}</span>
      </div>
    </button>
  );
}

function SelectionStep({
  title,
  onBack,
  items,
  selectedId,
  onSelect,
}: {
  title: string;
  onBack: () => void;
  items: Array<{id: string; title: string; subtitle: string; icon: ReactNode; image?: string; disabled?: boolean}>;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <motion.div
      key={title}
      initial={{opacity: 0, x: 20}}
      animate={{opacity: 1, x: 0}}
      exit={{opacity: 0, x: -20}}
      transition={{duration: 0.25}}
    >
      <div className="mb-6 flex items-center gap-3">
        <button type="button" onClick={onBack} className="text-gray-400 transition-colors hover:text-black" aria-label="Revenir à l'étape précédente">
          <ArrowRight size={16} className="rotate-180" />
        </button>
        <h3 className="text-sm font-bold text-gray-900">{title}</h3>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            disabled={item.disabled}
            onClick={() => onSelect(item.id)}
            className={`flex items-center rounded-2xl border-2 p-4 text-left transition-all ${
              selectedId === item.id
                ? 'border-primary bg-primary text-white shadow-md'
                : 'border-transparent bg-white text-gray-900 shadow-sm hover:border-primary/20'
            } ${item.disabled ? 'cursor-not-allowed opacity-60 grayscale' : ''}`}
          >
            {item.image ? (
              <div className="mr-4 h-12 w-12 shrink-0 overflow-hidden rounded-xl">
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            ) : (
              <div className={`mr-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                selectedId === item.id ? 'bg-white/20' : 'bg-primary/10 text-primary'
              }`}>
                {item.icon}
              </div>
            )}
            <div>
              <span className="block text-sm font-bold">{item.title}</span>
              <span className={`text-xs ${selectedId === item.id ? 'text-white/80' : 'text-gray-500'}`}>{item.subtitle}</span>
            </div>
          </button>
        ))}
      </div>

      <Progress step={2} totalSteps={4} />
    </motion.div>
  );
}

function Progress({step, totalSteps}: {step: number; totalSteps: number}) {
  return (
    <div className="space-y-3">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
        <div className="h-full rounded-full bg-primary transition-all duration-300" style={{width: `${(step / totalSteps) * 100}%`}} />
      </div>
      <p className="text-center text-xs font-bold text-gray-500">Étape {step} sur {totalSteps}</p>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  icon,
  type = 'text',
  required = false,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  icon: ReactNode;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>
        <input
          id={id}
          type={type}
          value={value}
          required={required}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-12 pr-4 text-sm font-medium transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
    </div>
  );
}

export type {ReservationPrefill};
