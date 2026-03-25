import {
  ArrowRight,
  Briefcase,
  Building2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Coffee,
  Mail,
  MessageSquare,
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
import {
  getAvailableRoomOptions,
  getRoomBookingMode,
  type HalfDaySlot,
  type ContactPayload,
  type ReservationType,
  type RoomBookingMode,
} from '../lib/reservation';

type EventFormatId = 'atelier' | 'teamday' | 'afterwork';

export type ReservationPrefill =
  | {
      reservationType: ReservationType;
      deskId?: string;
      roomId?: string;
      eventFormatId?: EventFormatId;
      roomBookingMode?: RoomBookingMode;
      selectedRoomOptions?: string[];
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

const roomAttendeeOptions = Array.from({length: 8}, (_, index) => `${index + 1}`);

const initialContactState: ContactPayload = {
  company: '',
  activity: '',
  attendees: '',
  fullName: '',
  email: '',
  phone: '',
  notes: '',
};

function getRoomScheduleLabel({
  mode,
  startTime,
  endTime,
  halfDaySlot,
}: {
  mode: RoomBookingMode | null;
  startTime: string;
  endTime: string;
  halfDaySlot: HalfDaySlot | null;
}) {
  if (mode === 'hourly') {
    return startTime && endTime ? `De ${startTime} à ${endTime}` : '';
  }

  if (mode === 'halfday') {
    if (halfDaySlot === 'morning') {
      return 'Matin';
    }

    if (halfDaySlot === 'afternoon') {
      return 'Après-midi';
    }

    return '';
  }

  if (mode === 'day') {
    return 'Journée complète';
  }

  return '';
}

export function ReservationForm({prefill}: {prefill: ReservationPrefill}) {
  const [formStep, setFormStep] = useState(1);
  const [reservationType, setReservationType] = useState<ReservationType | null>('bureau');
  const [selectedDeskId, setSelectedDeskId] = useState<string | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedEventFormatId, setSelectedEventFormatId] = useState<EventFormatId | null>(null);
  const [resDate, setResDate] = useState<Date | undefined>();
  const [resTime, setResTime] = useState('');
  const [roomBookingMode, setRoomBookingMode] = useState<RoomBookingMode | null>(null);
  const [roomStartTime, setRoomStartTime] = useState('');
  const [roomEndTime, setRoomEndTime] = useState('');
  const [roomHalfDaySlot, setRoomHalfDaySlot] = useState<HalfDaySlot | null>(null);
  const [selectedRoomOptions, setSelectedRoomOptions] = useState<string[]>([]);
  const [contact, setContact] = useState<ContactPayload>(initialContactState);
  const [submitState, setSubmitState] = useState<{
    status: 'idle' | 'submitting' | 'success' | 'error';
    message: string;
  }>({
    status: 'idle',
    message: '',
  });

  useEffect(() => {
    if (!prefill) {
      return;
    }

    const prefilledRoom = prefill.roomId ? rooms.find((room) => room.id === prefill.roomId) ?? null : null;
    const allowedPrefillOptions = getAvailableRoomOptions({
      allOptions: prefilledRoom?.options ?? [],
      mode: prefill.roomBookingMode ?? null,
      halfDaySlot: null,
    });

    setReservationType(prefill.reservationType);
    setSelectedDeskId(prefill.deskId ?? null);
    setSelectedRoomId(prefill.roomId ?? null);
    setSelectedEventFormatId(prefill.eventFormatId ?? null);
    setResDate(undefined);
    setResTime('');
    setRoomBookingMode(prefill.roomBookingMode ?? null);
    setRoomStartTime('');
    setRoomEndTime('');
    setRoomHalfDaySlot(null);
    setSelectedRoomOptions(
      (prefill.selectedRoomOptions ?? []).filter((option) => allowedPrefillOptions.includes(option)),
    );
    setSubmitState({status: 'idle', message: ''});

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
  const selectedRoomRate = selectedRoom?.rates?.find((rate) => getRoomBookingMode(rate.label) === roomBookingMode) ?? null;
  const roomScheduleLabel = getRoomScheduleLabel({
    mode: roomBookingMode,
    startTime: roomStartTime,
    endTime: roomEndTime,
    halfDaySlot: roomHalfDaySlot,
  });
  const selectedRoomDurationLabel = selectedRoomRate ? `${selectedRoomRate.label} - ${selectedRoomRate.price}` : '';
  const selectedRoomIncluded = selectedRoomRate?.details ?? (roomBookingMode === 'hourly' ? 'Location simple, sans service additionnel.' : '');
  const selectedRoomOptionsSummary = selectedRoomOptions.map((option) => {
    const [optionTitle] = option.split(' : ');
    const attendeeCount = contact.attendees.trim();
    const attendeeLabel = attendeeCount
      ? `${attendeeCount} ${attendeeCount === '1' ? 'personne' : 'personnes'}`
      : 'Nombre de personnes a preciser';

    return {
      option,
      title: optionTitle,
      attendeeLabel,
    };
  });
  const availableRoomOptions = getAvailableRoomOptions({
    allOptions: selectedRoom?.options ?? [],
    mode: roomBookingMode,
    halfDaySlot: roomHalfDaySlot,
  });
  const roomAttendeesReady = selectedRoomOptions.length === 0 || contact.attendees.trim().length > 0;
  const roomSelectionReady =
    !!resDate &&
    (reservationType !== 'salle'
      ? !!resTime
      : roomBookingMode === 'hourly'
        ? !!roomStartTime && !!roomEndTime && timeSlots.indexOf(roomEndTime) > timeSlots.indexOf(roomStartTime)
        : roomBookingMode === 'halfday'
          ? roomHalfDaySlot !== null
          : roomBookingMode === 'day');

  useEffect(() => {
    setSelectedRoomOptions((current) => {
      const next = current.filter((option) => availableRoomOptions.includes(option));
      return next.length === current.length ? current : next;
    });
  }, [availableRoomOptions]);

  const selectedOfferLabel =
    reservationType === 'bureau'
      ? selectedDesk?.name ?? 'Bureau privé'
      : reservationType === 'salle'
        ? selectedRoom?.name ?? 'Salle de réunion'
        : selectedEventFormat?.title ?? "Événement d'entreprise";
  const totalSteps = reservationType === 'salle' ? 5 : 4;
  const isContactStep =
    (reservationType === 'salle' && formStep === 5) ||
    (reservationType !== 'salle' && formStep === 4);

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
    setRoomBookingMode(null);
    setRoomStartTime('');
    setRoomEndTime('');
    setRoomHalfDaySlot(null);
    setSelectedRoomOptions([]);
    setFormStep(2);
    setSubmitState({status: 'idle', message: ''});
  };

  const resetForm = () => {
    setFormStep(1);
    setReservationType('bureau');
    setSelectedDeskId(null);
    setSelectedRoomId(null);
    setSelectedEventFormatId(null);
    setResDate(undefined);
    setResTime('');
    setRoomBookingMode(null);
    setRoomStartTime('');
    setRoomEndTime('');
    setRoomHalfDaySlot(null);
    setSelectedRoomOptions([]);
    setContact(initialContactState);
    setSubmitState({status: 'idle', message: ''});
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!reservationType || !resDate || !roomSelectionReady) {
      return;
    }

    if (reservationType === 'salle' && !selectedRoomDurationLabel) {
      setSubmitState({
        status: 'error',
        message: 'Complétez le format de réservation de la salle.',
      });
      return;
    }

    setSubmitState({status: 'submitting', message: ''});

    try {
      const response = await fetch('/api/reservation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reservationType,
          offerLabel: selectedOfferLabel,
          requestedDate: format(resDate, 'EEEE d MMMM yyyy', {locale: fr}),
          requestedTime: reservationType === 'salle' ? roomScheduleLabel : resTime,
          contact,
          roomBooking: reservationType === 'salle'
            ? {
                duration: selectedRoomDurationLabel,
                included: selectedRoomIncluded,
                options: selectedRoomOptions,
              }
            : undefined,
        }),
      });

      const result = await response.json() as {ok?: boolean; message?: string};

      if (!response.ok || !result.ok) {
        setSubmitState({
          status: 'error',
          message: result.message ?? "L'envoi a échoué. Réessayez dans un instant.",
        });
        return;
      }

      setSubmitState({
        status: 'success',
        message: result.message ?? 'Votre demande a bien été envoyée.',
      });
    } catch {
      setSubmitState({
        status: 'error',
        message: "L'envoi a échoué. Vérifiez votre connexion puis réessayez.",
      });
    }
  };

  return (
    <div className={`mx-auto w-full rounded-3xl bg-[#F4F4F5] p-4 shadow-2xl transition-[max-width] duration-300 ease-out sm:p-6 md:p-8 ${
      isContactStep ? 'max-w-6xl' : 'max-w-2xl'
    }`}>
      <AnimatePresence mode="wait">
        {formStep === 1 && (
          <motion.div
            key="step-1"
            initial={{opacity: 0, x: 20}}
            animate={{opacity: 1, x: 0}}
            exit={{opacity: 0, x: -20}}
            transition={{duration: 0.25}}
            className="w-full"
          >
            <StepFrame>
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

              <Progress step={1} totalSteps={totalSteps} />
            </StepFrame>
          </motion.div>
        )}

        {formStep === 2 && reservationType === 'bureau' && (
          <SelectionStep
            title="2. Choix du bureau"
            totalSteps={totalSteps}
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
            totalSteps={totalSteps}
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
              setRoomBookingMode(null);
              setRoomStartTime('');
              setRoomEndTime('');
              setRoomHalfDaySlot(null);
              setSelectedRoomOptions([]);
              setFormStep(3);
            }}
          />
        )}

        {formStep === 2 && reservationType === 'event' && (
          <SelectionStep
            title="2. Format de votre événement"
            totalSteps={totalSteps}
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
            className="w-full"
          >
            <StepFrame>
              <div className="mb-6 flex items-center gap-3">
                <button type="button" onClick={() => setFormStep(2)} className="text-gray-400 transition-colors hover:text-black" aria-label="Revenir à l'étape précédente">
                  <ArrowRight size={16} className="rotate-180" />
                </button>
                <h3 className="text-sm font-bold text-gray-900">
                  {reservationType === 'salle' ? '3. Date et format souhaités' : '3. Date et créneau souhaités'}
                </h3>
              </div>

            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Sélection actuelle</p>
              <p className="mt-2 text-sm font-semibold text-gray-900">{selectedOfferLabel}</p>
              {reservationType === 'salle' && selectedRoomDurationLabel ? (
                <p className="mt-2 text-sm text-gray-600">Formule : <span className="font-semibold text-gray-900">{selectedRoomDurationLabel}</span></p>
              ) : null}
            </div>

            {!resDate ? (
              <div className="mb-6 w-full rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
                <DayPicker
                  mode="single"
                  selected={resDate}
                  onSelect={setResDate}
                  locale={fr}
                  disabled={[{dayOfWeek: [0, 6]}, {before: new Date()}]}
                  className="!m-0 w-full"
                  components={{
                    Chevron: ({orientation, className}) =>
                      orientation === 'left' ? (
                        <ChevronLeft size={16} className={className} />
                      ) : (
                        <ChevronRight size={16} className={className} />
                      ),
                  }}
                  classNames={{
                    root: 'w-full',
                    months: 'w-full',
                    month: 'w-full space-y-4',
                    month_caption: 'mb-3 flex items-center justify-center gap-3 pt-1',
                    caption_label: 'text-base font-bold capitalize text-gray-900',
                    nav: 'flex items-center gap-2',
                    button_previous:
                      'inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 transition-colors hover:border-primary hover:bg-primary hover:text-white',
                    button_next:
                      'inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 transition-colors hover:border-primary hover:bg-primary hover:text-white',
                    month_grid: 'w-full table-fixed border-collapse',
                    weekdays: 'grid grid-cols-7 gap-2',
                    weekday: 'pb-2 text-center text-[0.8rem] font-semibold text-gray-500',
                    weeks: 'space-y-2',
                    week: 'grid grid-cols-7 gap-2',
                    day: 'w-full',
                    day_button:
                      'flex h-11 w-full items-center justify-center rounded-lg text-sm font-medium text-gray-900 transition-colors hover:bg-primary hover:text-white disabled:hover:bg-transparent disabled:hover:text-gray-400 aria-selected:opacity-100',
                    selected: 'bg-primary font-bold text-white hover:bg-primary hover:text-white focus:bg-primary focus:text-white',
                    today: 'rounded-lg bg-gray-100 text-gray-900 hover:bg-primary hover:text-white',
                    outside: 'text-gray-400 opacity-50',
                    disabled: 'text-gray-400 opacity-50',
                    hidden: 'invisible',
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
                      setRoomBookingMode(null);
                      setRoomStartTime('');
                      setRoomEndTime('');
                      setRoomHalfDaySlot(null);
                      setSelectedRoomOptions([]);
                    }}
                    className="text-xs font-bold text-gray-500 underline underline-offset-4 transition-colors hover:text-primary"
                  >
                    Modifier
                  </button>
                </div>

                {reservationType === 'salle' && selectedRoom ? (
                  <div className="space-y-5">
                    <div>
                      <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">Type de réservation</p>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        {(selectedRoom.rates ?? []).map((rate) => {
                          const mode = getRoomBookingMode(rate.label);
                          if (!mode) {
                            return null;
                          }

                          const isActive = roomBookingMode === mode;

                          return (
                            <button
                              key={`${selectedRoom.id}-${rate.label}`}
                              type="button"
                              onClick={() => {
                                setRoomBookingMode(mode);
                                setRoomStartTime('');
                                setRoomEndTime('');
                                setRoomHalfDaySlot(null);
                                if (mode === 'day') {
                                  setFormStep(4);
                                }
                              }}
                              className={`rounded-2xl border p-4 text-left transition-all ${
                                isActive
                                  ? 'border-primary bg-primary text-white shadow-md'
                                  : 'border-gray-200 bg-gray-50 text-gray-900 hover:border-primary/40 hover:bg-white'
                              }`}
                            >
                              <p className="text-sm font-bold">{rate.label}</p>
                              <p className={`mt-1 text-lg font-black ${isActive ? 'text-white' : 'text-gray-900'}`}>{rate.price}</p>
                              <p className={`mt-2 text-xs leading-relaxed ${isActive ? 'text-white/75' : 'text-gray-500'}`}>
                                {rate.details ?? 'Location simple, sans service additionnel.'}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {roomBookingMode === 'hourly' && (
                      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                        <p className="text-sm font-bold text-gray-900">Choisissez votre plage horaire</p>
                        <p className="mt-1 text-xs leading-relaxed text-gray-500">
                          Sélectionnez une heure de début puis une heure de fin.
                        </p>

                        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div>
                            <label htmlFor="room-start-time" className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">
                              De
                            </label>
                            <select
                              id="room-start-time"
                              value={roomStartTime}
                              onChange={(event) => {
                                setRoomStartTime(event.target.value);
                                if (roomEndTime && timeSlots.indexOf(roomEndTime) <= timeSlots.indexOf(event.target.value)) {
                                  setRoomEndTime('');
                                } else if (roomEndTime && timeSlots.indexOf(roomEndTime) > timeSlots.indexOf(event.target.value)) {
                                  setFormStep(4);
                                }
                              }}
                              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                            >
                              <option value="">Choisir l’heure de début</option>
                              {timeSlots.slice(0, -1).map((time) => (
                                <option key={`start-${time}`} value={time}>{time}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label htmlFor="room-end-time" className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">
                              À
                            </label>
                            <select
                              id="room-end-time"
                              value={roomEndTime}
                              onChange={(event) => {
                                setRoomEndTime(event.target.value);
                                if (roomStartTime && timeSlots.indexOf(event.target.value) > timeSlots.indexOf(roomStartTime)) {
                                  setFormStep(4);
                                }
                              }}
                              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                            >
                              <option value="">Choisir l’heure de fin</option>
                              {timeSlots.filter((time) => !roomStartTime || timeSlots.indexOf(time) > timeSlots.indexOf(roomStartTime)).map((time) => (
                                <option key={`end-${time}`} value={time}>{time}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    )}

                    {roomBookingMode === 'halfday' && (
                      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                        <p className="text-sm font-bold text-gray-900">Choisissez votre créneau</p>
                        <p className="mt-1 text-xs leading-relaxed text-gray-500">
                          La demi-journée se précise ensuite entre matin et après-midi.
                        </p>

                        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <button
                            type="button"
                              onClick={() => {
                                setRoomHalfDaySlot('morning');
                                setFormStep(4);
                              }}
                            className={`rounded-2xl border p-4 text-left transition-all ${
                              roomHalfDaySlot === 'morning'
                                ? 'border-primary bg-primary text-white shadow-md'
                                : 'border-gray-200 bg-white text-gray-900 hover:border-primary/40'
                            }`}
                          >
                            <p className="text-sm font-bold">Matin</p>
                            <p className={`mt-2 text-xs leading-relaxed ${roomHalfDaySlot === 'morning' ? 'text-white/75' : 'text-gray-500'}`}>
                              Compatible avec l’option petit déjeuner.
                            </p>
                          </button>
                          <button
                            type="button"
                              onClick={() => {
                                setRoomHalfDaySlot('afternoon');
                                setFormStep(4);
                              }}
                            className={`rounded-2xl border p-4 text-left transition-all ${
                              roomHalfDaySlot === 'afternoon'
                                ? 'border-primary bg-primary text-white shadow-md'
                                : 'border-gray-200 bg-white text-gray-900 hover:border-primary/40'
                            }`}
                          >
                            <p className="text-sm font-bold">Après-midi</p>
                            <p className={`mt-2 text-xs leading-relaxed ${roomHalfDaySlot === 'afternoon' ? 'text-white/75' : 'text-gray-500'}`}>
                              Format simple avec la formule demi-journée.
                            </p>
                          </button>
                        </div>
                      </div>
                    )}

                    {roomBookingMode && selectedRoomIncluded ? (
                      <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4">
                        <p className="text-xs font-bold uppercase tracking-wider text-primary/80">Inclus dans cette formule</p>
                        <p className="mt-2 text-sm font-semibold text-gray-900">{selectedRoomIncluded}</p>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <>
                    <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-500">Choisissez une heure</h4>
                    <div className="grid max-h-60 grid-cols-3 gap-3 overflow-y-auto pr-2 custom-scrollbar sm:grid-cols-4">
                      {timeSlots.map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => {
                            setResTime(time);
                            setFormStep(4);
                          }}
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
                  </>
                )}
              </motion.div>
            )}

              <div className="mt-8">
                <Progress step={3} totalSteps={totalSteps} />
              </div>
            </StepFrame>
          </motion.div>
        )}

        {formStep === 4 && reservationType === 'salle' && resDate && roomSelectionReady && (
          <motion.div
            key="step-4-room-details"
            initial={{opacity: 0, x: 20}}
            animate={{opacity: 1, x: 0}}
            exit={{opacity: 0, x: -20}}
            transition={{duration: 0.25}}
            className="w-full"
          >
            <StepFrame>
              <div className="mb-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setFormStep(3)}
                  className="text-gray-400 transition-colors hover:text-black"
                  aria-label="Revenir à l'étape précédente"
                >
                  <ArrowRight size={16} className="rotate-180" />
                </button>
                <h3 className="text-sm font-bold text-gray-900">4. Détails de la réunion</h3>
              </div>

            <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 shrink-0 text-primary" size={18} />
                <div>
                  <p className="text-sm font-bold text-gray-900">Récapitulatif de la demande</p>
                  <p className="mt-1 text-xs leading-relaxed text-gray-500">
                    Vérifiez les informations de réservation avant de passer aux coordonnées.
                  </p>
                </div>
              </div>

              {selectedRoom ? (
                <div className="mb-4 flex items-start gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl">
                    <img
                      src={selectedRoom.image}
                      alt={selectedRoom.name}
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Salle sélectionnée</p>
                    <p className="mt-2 text-base font-bold text-gray-900">{selectedRoom.name}</p>
                    <p className="mt-1 text-sm leading-relaxed text-gray-500">{selectedRoom.description}</p>
                  </div>
                </div>
              ) : null}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <SummaryCard label="Espace demandé" value={selectedOfferLabel} />
                <SummaryCard label="Date souhaitée" value={format(resDate, 'dd MMMM yyyy', {locale: fr})} />
                <SummaryCard label="Créneau" value={roomScheduleLabel} />
                <SummaryCard
                  label="Type de réservation"
                  value={selectedRoomDurationLabel || 'À sélectionner ci-dessous'}
                  highlight={!selectedRoomDurationLabel}
                />
              </div>

              {selectedRoomIncluded ? (
                <div className="mt-4 rounded-2xl border border-primary/15 bg-primary/5 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-primary/80">Inclus</p>
                  <p className="mt-2 text-sm font-semibold text-gray-900">{selectedRoomIncluded}</p>
                </div>
              ) : null}
            </div>

            <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div>
                <h4 className="text-base font-bold text-gray-900">Détails de la réunion</h4>
                <p className="mt-1 text-sm leading-relaxed text-gray-500">
                  Sélectionnez vos options si besoin, puis continuez vers l’étape des coordonnées.
                </p>
              </div>

              {roomBookingMode === 'halfday' && availableRoomOptions.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {availableRoomOptions.map((option) => {
                    const checked = selectedRoomOptions.includes(option);
                    const [optionTitle, optionPrice] = option.split(' : ');

                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => {
                          setSelectedRoomOptions((current) =>
                            checked ? current.filter((item) => item !== option) : [...current, option],
                          );
                        }}
                        className={`flex h-full min-h-[108px] flex-col justify-between rounded-2xl border px-4 py-4 text-left text-sm transition-colors ${
                          checked
                            ? 'border-primary bg-primary text-white shadow-md'
                            : 'border-gray-200 bg-gray-50 text-gray-900 hover:border-primary/30 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Coffee size={16} className={checked ? 'text-white' : 'text-primary'} />
                          <div>
                            <p className={`font-bold ${checked ? 'text-white' : 'text-gray-900'}`}>{optionTitle}</p>
                            {optionPrice ? (
                              <p className={`mt-1 text-xs font-medium ${checked ? 'text-white/80' : 'text-gray-500'}`}>{optionPrice}</p>
                            ) : null}
                          </div>
                        </div>
                      </button>
                    );
                  })}

                  <div className="flex min-h-[108px] flex-col justify-between rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4">
                    <div className="flex items-start gap-3">
                      <Users size={16} className="text-primary" />
                      <div>
                        <p className="font-bold text-gray-900">Nombre de personnes</p>
                        <p className="mt-1 text-xs font-medium text-gray-500">Indiquez le nombre de participants.</p>
                      </div>
                    </div>
                    <select
                      id="meeting-attendees"
                      value={contact.attendees}
                      onChange={(event) => setContact((current) => ({...current, attendees: event.target.value}))}
                      className="mt-4 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      required={selectedRoomOptions.length > 0}
                    >
                      <option value="">Choisir</option>
                      {roomAttendeeOptions.map((count) => (
                        <option key={`meeting-attendees-${count}`} value={count}>
                          {count}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div>
                  {availableRoomOptions.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {availableRoomOptions.map((option) => {
                        const checked = selectedRoomOptions.includes(option);
                        const [optionTitle, optionPrice] = option.split(' : ');

                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => {
                              setSelectedRoomOptions((current) =>
                                checked ? current.filter((item) => item !== option) : [...current, option],
                              );
                            }}
                            className={`rounded-2xl border px-4 py-4 text-left text-sm transition-colors ${
                              checked
                                ? 'border-primary bg-primary text-white shadow-md'
                                : 'border-gray-200 bg-gray-50 text-gray-900 hover:border-primary/30 hover:bg-white'
                            }`}
                          >
                            <p className={`font-bold ${checked ? 'text-white' : 'text-gray-900'}`}>{optionTitle}</p>
                            {optionPrice ? (
                              <p className={`mt-1 text-xs font-medium ${checked ? 'text-white/80' : 'text-gray-500'}`}>{optionPrice}</p>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  ) : null}

                  <div className={availableRoomOptions.length > 0 ? 'pt-1' : ''}>
                    <RoomAttendeesSelect
                      id="meeting-attendees"
                      label="Nombre de personnes"
                      value={contact.attendees}
                      onChange={(value) => setContact((current) => ({...current, attendees: value}))}
                      required={selectedRoomOptions.length > 0}
                    />
                  </div>
                </div>
              )}

              <button
                type="button"
                disabled={!roomAttendeesReady}
                onClick={() => {
                  setSubmitState({status: 'idle', message: ''});
                  setFormStep(5);
                }}
                className="w-full rounded-xl bg-primary py-4 text-sm font-bold text-white shadow-md transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Valider et continuer
              </button>
            </div>

              <div className="mt-8">
                <Progress step={4} totalSteps={totalSteps} />
              </div>
            </StepFrame>
          </motion.div>
        )}

        {((formStep === 4 && reservationType && reservationType !== 'salle' && resDate && !!resTime) ||
          (formStep === 5 && reservationType === 'salle' && resDate && roomSelectionReady)) && (
          <motion.div
            key={reservationType === 'salle' ? 'step-5-room-contact' : 'step-4-contact'}
            initial={{opacity: 0, x: 20}}
            animate={{opacity: 1, x: 0}}
            exit={{opacity: 0, x: -20}}
            transition={{duration: 0.25}}
            className="w-full"
          >
            <StepFrame wide={isContactStep}>
              <div className="mb-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setFormStep(reservationType === 'salle' ? 4 : 3)}
                  className="text-gray-400 transition-colors hover:text-black"
                  aria-label="Revenir à l'étape précédente"
                >
                  <ArrowRight size={16} className="rotate-180" />
                </button>
                <h3 className="text-sm font-bold text-gray-900">
                  {reservationType === 'salle' ? '5. Vos informations' : '4. Vos informations'}
                </h3>
              </div>

            {submitState.status === 'success' ? (
              <div className="space-y-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-sm text-emerald-950">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600" size={18} />
                  <div>
                    <p className="font-bold">{submitState.message}</p>
                    <p className="mt-2 leading-relaxed">
                      La demande a été envoyée directement à <span className="font-semibold">{siteConfig.email}</span> depuis l’adresse
                      d’envoi serveur configurée pour le site.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full rounded-xl bg-primary py-4 text-sm font-bold text-white shadow-md transition-colors hover:bg-primary/90"
                >
                  Envoyer une autre demande
                </button>
              </div>
            ) : (
              <form className="space-y-3" onSubmit={handleSubmit}>
                {submitState.status === 'error' && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {submitState.message}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 xl:grid-cols-[0.95fr_1.05fr]">
                  <div className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 shrink-0 text-primary" size={18} />
                      <div>
                        <p className="text-sm font-bold text-gray-900">Récapitulatif de la demande</p>
                        <p className="mt-1 text-xs leading-relaxed text-gray-500">
                          Vérifiez les informations ci-dessous avant l’envoi.
                        </p>
                      </div>
                    </div>

                    {reservationType === 'salle' && selectedRoom ? (
                      <div className="mb-4 flex items-start gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                        <div className="h-28 w-28 shrink-0 overflow-hidden rounded-2xl">
                          <img
                            src={selectedRoom.image}
                            alt={selectedRoom.name}
                            className="h-full w-full object-cover"
                            referrerPolicy="no-referrer"
                            loading="lazy"
                            decoding="async"
                          />
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Salle sélectionnée</p>
                          <p className="mt-2 text-base font-bold text-gray-900">{selectedRoom.name}</p>
                          <p className="mt-1 text-sm leading-relaxed text-gray-500">{selectedRoom.description}</p>
                        </div>
                      </div>
                    ) : null}

                    {reservationType === 'bureau' && selectedDesk ? (
                      <div className="mb-4 flex items-start gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl">
                          <img
                            src={selectedDesk.image}
                            alt={selectedDesk.name}
                            className="h-full w-full object-cover"
                            referrerPolicy="no-referrer"
                            loading="lazy"
                            decoding="async"
                          />
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Bureau sélectionné</p>
                          <p className="mt-2 text-base font-bold text-gray-900">{selectedDesk.name}</p>
                          <p className="mt-1 text-sm leading-relaxed text-gray-500">
                            {selectedDesk.size} • {selectedDesk.capacity} • {selectedDesk.orientation}
                          </p>
                        </div>
                      </div>
                    ) : null}

                    <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 content-start">
                      <SummaryCard label="Espace demandé" value={selectedOfferLabel} />
                      <SummaryCard label="Date souhaitée" value={format(resDate, 'dd MMMM yyyy', {locale: fr})} />
                      <SummaryCard label={reservationType === 'salle' ? 'Créneau' : 'Horaire souhaité'} value={reservationType === 'salle' ? roomScheduleLabel : resTime} />
                      {reservationType === 'salle' ? (
                        <SummaryCard
                          label="Type de réservation"
                          value={selectedRoomDurationLabel || 'À sélectionner ci-dessous'}
                          highlight={!selectedRoomDurationLabel}
                        />
                      ) : null}
                    </div>

                    {reservationType === 'bureau' && (
                      <p className="mt-4 text-xs font-medium text-primary">
                        Cette demande sert à organiser une visite et qualifier votre besoin de location.
                      </p>
                    )}

                    {reservationType === 'salle' ? (
                      <div className="mt-3 space-y-3">
                        <div className="min-h-[72px] rounded-2xl border border-primary/15 bg-primary/5 p-4">
                          <p className="text-xs font-bold uppercase tracking-wider text-primary/80">Inclus</p>
                          <p className="mt-2 text-sm font-semibold text-gray-900">
                            {selectedRoomIncluded || 'Aucun service inclus indiqué pour cette formule.'}
                          </p>
                        </div>

                        {selectedRoomOptions.length > 0 ? (
                          <div className="rounded-2xl border border-primary/15 bg-white p-4">
                            <p className="text-xs font-bold uppercase tracking-wider text-primary/80">Options ajoutées</p>
                            <div className="mt-2 space-y-2">
                              {selectedRoomOptionsSummary.map(({option, title, attendeeLabel}) => (
                                <div
                                  key={option}
                                  className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-sm font-semibold text-gray-900"
                                >
                                  <span>{title}</span>
                                  <span className="text-gray-500">{attendeeLabel}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>

                  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="mb-4">
                      <h4 className="text-base font-bold text-gray-900">Coordonnées</h4>
                      <p className="mt-1 text-sm leading-relaxed text-gray-500">
                        Renseignez vos coordonnées pour que nous puissions revenir vers vous rapidement.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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

                      <div className="sm:col-span-2">
                        <Field
                          id="activity"
                          label={reservationType === 'bureau' ? 'Activité ou besoin' : 'Objet de la demande'}
                          value={contact.activity}
                          onChange={(value) => setContact((current) => ({...current, activity: value}))}
                          icon={<Briefcase size={16} />}
                          required={reservationType !== 'salle'}
                        />
                      </div>

                      {reservationType === 'event' && (
                        <div className="sm:col-span-2">
                          <Field
                            id="attendees"
                            label="Nombre de participants estimé"
                            value={contact.attendees}
                            onChange={(value) => setContact((current) => ({...current, attendees: value}))}
                            icon={<Users size={16} />}
                            required
                          />
                        </div>
                      )}

                      {reservationType !== 'bureau' && (
                        <div className="sm:col-span-2">
                          <label htmlFor="notes" className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">
                            Message complémentaire
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
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={submitState.status === 'submitting'}
                      className="mt-4 w-full rounded-xl bg-primary py-4 text-sm font-bold text-white shadow-md transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submitState.status === 'submitting' ? 'Envoi en cours…' : submitLabel}
                    </button>
                  </div>
                </div>
              </form>
            )}

            <p className="mt-4 text-center text-xs font-medium text-gray-500">
              La demande est envoyée directement à <a href={`mailto:${siteConfig.email}`} className="text-primary underline underline-offset-4">{siteConfig.email}</a> sans ouverture de boîte mail.
              {reservationType === 'bureau' && ' Nous revenons ensuite vers vous pour confirmer la visite du bureau.'}
            </p>

              <div className="mt-8">
                <Progress step={reservationType === 'salle' ? 5 : 4} totalSteps={totalSteps} />
              </div>
            </StepFrame>
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

function RoomAttendeesSelect({
  id,
  label,
  value,
  onChange,
  required = false,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">
        {label}
      </label>
      <div className="relative">
        <Users className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required={required}
          className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-12 pr-4 text-sm font-medium text-gray-900 transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">Choisir</option>
          {roomAttendeeOptions.map((count) => (
            <option key={`${id}-${count}`} value={count}>
              {count}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function StepFrame({children, wide = false}: {children: ReactNode; wide?: boolean}) {
  return (
    <div className={`mx-auto w-full ${wide ? 'max-w-none' : 'max-w-2xl'}`}>
      {children}
    </div>
  );
}

function SelectionStep({
  title,
  totalSteps,
  onBack,
  items,
  selectedId,
  onSelect,
}: {
  title: string;
  totalSteps: number;
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
      className="w-full"
    >
      <StepFrame>
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

        <Progress step={2} totalSteps={totalSteps} />
      </StepFrame>
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

function SummaryCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-xl border px-4 py-3 ${highlight ? 'border-primary/30 bg-primary/5' : 'border-gray-200 bg-gray-50'}`}>
      <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">{label}</p>
      <p className={`mt-2 text-sm font-semibold ${highlight ? 'text-primary' : 'text-gray-900'}`}>{value}</p>
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
