export type ReservationType = 'bureau' | 'salle' | 'event';
export type RoomBookingMode = 'hourly' | 'halfday' | 'day';
export type HalfDaySlot = 'morning' | 'afternoon';

export type ContactPayload = {
  company: string;
  activity: string;
  attendees: string;
  fullName: string;
  email: string;
  phone: string;
  notes: string;
};

export type ReservationRequestPayload = {
  reservationType: ReservationType;
  offerLabel: string;
  requestedDate: string;
  requestedTime: string;
  contact: ContactPayload;
  roomBooking?: {
    duration: string;
    included: string;
    options: string[];
  };
};

const reservationTypeLabel: Record<ReservationType, string> = {
  bureau: 'Bureau privé',
  salle: 'Salle de réunion',
  event: "Événement d'entreprise",
};

export function isReservationType(value: unknown): value is ReservationType {
  return value === 'bureau' || value === 'salle' || value === 'event';
}

export function getRoomBookingMode(label: string): RoomBookingMode | null {
  const normalizedLabel = label.toLowerCase();

  if (normalizedLabel.includes('heure')) {
    return 'hourly';
  }

  if (normalizedLabel.includes('demi')) {
    return 'halfday';
  }

  if (normalizedLabel.includes('journ')) {
    return 'day';
  }

  return null;
}

export function getAvailableRoomOptions({
  allOptions,
  mode,
  halfDaySlot,
}: {
  allOptions: string[];
  mode: RoomBookingMode | null;
  halfDaySlot?: HalfDaySlot | null;
}) {
  if (mode === 'day') {
    return allOptions;
  }

  if (mode === 'halfday') {
    if (halfDaySlot === 'morning') {
      return allOptions.filter((option) => option.toLowerCase().includes('petit déjeuner'));
    }

    if (halfDaySlot === 'afternoon') {
      return allOptions.filter((option) => !option.toLowerCase().includes('petit déjeuner'));
    }

    return allOptions;
  }

  return [];
}

export function normalizeContactPayload(value: unknown): ContactPayload {
  const source = isRecord(value) ? value : {};

  return {
    company: normalizeText(source.company),
    activity: normalizeText(source.activity),
    attendees: normalizeText(source.attendees),
    fullName: normalizeText(source.fullName),
    email: normalizeText(source.email),
    phone: normalizeText(source.phone),
    notes: normalizeText(source.notes),
  };
}

export function normalizeRoomBooking(value: unknown) {
  const source = isRecord(value) ? value : {};
  const options = Array.isArray(source.options)
    ? source.options
        .filter((item): item is string => typeof item === 'string')
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

  return {
    duration: normalizeText(source.duration),
    included: normalizeText(source.included),
    options,
  };
}

export function buildReservationSubject({reservationType, offerLabel}: Pick<ReservationRequestPayload, 'reservationType' | 'offerLabel'>) {
  const subjectByType: Record<ReservationType, string> = {
    bureau: `Demande de visite bureau - ${offerLabel}`,
    salle: `Demande de réservation salle - ${offerLabel}`,
    event: `Demande d'événement - ${offerLabel}`,
  };

  return subjectByType[reservationType];
}

export function buildReservationText({
  reservationType,
  offerLabel,
  requestedDate,
  requestedTime,
  contact,
  roomBooking,
}: ReservationRequestPayload) {
  const lines = [
    'Bonjour,',
    '',
    `Je souhaite faire une demande pour ${offerLabel}.`,
    '',
    `Type de demande : ${reservationTypeLabel[reservationType]}`,
    `Date souhaitée : ${requestedDate}`,
    `Nom : ${contact.fullName}`,
    `Email : ${contact.email}`,
    `Téléphone : ${contact.phone}`,
  ];

  if (reservationType === 'salle') {
    lines.splice(6, 0, `Créneau souhaité : ${requestedTime}`);
  } else {
    lines.splice(6, 0, `Heure souhaitée : ${requestedTime}`);
  }

  if (reservationType === 'salle' && roomBooking?.duration) {
    lines.push(`Format choisi : ${roomBooking.duration}`);
  }

  if (reservationType === 'salle' && roomBooking?.included) {
    lines.push(`Inclus dans la formule : ${roomBooking.included}`);
  }

  if (reservationType === 'salle' && roomBooking?.options.length) {
    lines.push(`Options souhaitées : ${roomBooking.options.join(', ')}`);
  }

  if (contact.company) {
    lines.push(`Entreprise : ${contact.company}`);
  }

  if (contact.activity) {
    lines.push(`Activité / besoin : ${contact.activity}`);
  }

  if (contact.attendees) {
    lines.push(`Participants / postes : ${contact.attendees}`);
  }

  if (contact.notes) {
    lines.push(`Message : ${contact.notes}`);
  }

  lines.push('', 'Merci.');

  return lines.join('\n');
}

export function buildReservationHtml(payload: ReservationRequestPayload) {
  const text = buildReservationText(payload);

  return `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
      <h1 style="font-size:20px;margin:0 0 16px">Nouvelle demande depuis le site</h1>
      <pre style="white-space:pre-wrap;font-family:Arial,sans-serif;margin:0">${escapeHtml(text)}</pre>
    </div>
  `.trim();
}

function normalizeText(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
