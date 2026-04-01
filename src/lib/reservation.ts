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
    pricing?: {
      lines: Array<{
        label: string;
        detail?: string;
        amountHt: string;
      }>;
      totalHt: string;
      vatAmount: string;
      totalTtc: string;
    };
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
  startTime,
}: {
  allOptions: string[];
  mode: RoomBookingMode | null;
  halfDaySlot?: HalfDaySlot | null;
  startTime?: string;
}) {
  if (mode === 'day') {
    return allOptions;
  }

  if (mode === 'hourly') {
    if (!isMorningHourlyStart(startTime)) {
      return [];
    }

    return allOptions.filter((option) => option.toLowerCase().includes('petit déjeuner'));
  }

  if (mode === 'halfday') {
    if (halfDaySlot === 'morning') {
      return allOptions.filter((option) => option.toLowerCase().includes('petit déjeuner'));
    }

    if (halfDaySlot === 'afternoon') {
      return [];
    }

    return allOptions;
  }

  return [];
}

function isMorningHourlyStart(startTime?: string) {
  if (!startTime) {
    return false;
  }

  const [hoursText, minutesText] = startTime.split(':');
  const hours = Number(hoursText);
  const minutes = Number(minutesText);

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return false;
  }

  const totalMinutes = hours * 60 + minutes;
  return totalMinutes >= 9 * 60 && totalMinutes <= 11 * 60;
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
  const pricingSource = isRecord(source.pricing) ? source.pricing : {};
  const lines = Array.isArray(pricingSource.lines)
    ? pricingSource.lines
        .map((line) => {
          const lineSource = isRecord(line) ? line : {};

          return {
            label: normalizeText(lineSource.label),
            detail: normalizeText(lineSource.detail),
            amountHt: normalizeText(lineSource.amountHt),
          };
        })
        .filter((line) => line.label && line.amountHt)
    : [];

  return {
    duration: normalizeText(source.duration),
    included: normalizeText(source.included),
    options,
    pricing: {
      lines,
      totalHt: normalizeText(pricingSource.totalHt),
      vatAmount: normalizeText(pricingSource.vatAmount),
      totalTtc: normalizeText(pricingSource.totalTtc),
    },
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
    `Email : ${contact.email}`,
    `Téléphone : ${contact.phone}`,
  ];

  if (reservationType === 'salle') {
    lines.splice(6, 0, `Créneau souhaité : ${requestedTime}`);
  } else {
    lines.splice(6, 0, `Heure souhaitée : ${requestedTime}`);
  }

  if (reservationType === 'salle' && roomBooking?.duration) {
    lines.push(`Format choisi : ${formatRoomBookingDuration(roomBooking.duration, requestedTime)}`);
  }

  if (reservationType === 'salle' && roomBooking?.options.length) {
    lines.push(`Options souhaitées : ${formatRoomOptions(roomBooking.options).join(', ')}`);
  }

  if (reservationType === 'salle' && roomBooking?.pricing?.lines.length) {
    lines.push('', 'Récapitulatif tarifaire :');

    const pricingRows = roomBooking.pricing.lines.map((line) => ({
      left: line.label,
      right: line.amountHt,
      detail: line.detail,
    }));
    const leftColumnWidth = pricingRows.reduce((max, row) => Math.max(max, row.left.length), 0);

    pricingRows.forEach((row) => {
      lines.push(`${row.left.padEnd(leftColumnWidth, ' ')}  ${row.right}`);

      if (row.detail) {
        lines.push(`${' '.repeat(leftColumnWidth)}  ${row.detail}`);
      }
    });

    if (roomBooking.pricing.totalHt) {
      lines.push(`${'Total HT'.padEnd(leftColumnWidth, ' ')}  ${roomBooking.pricing.totalHt}`);
    }

    if (roomBooking.pricing.vatAmount) {
      lines.push(`${'TVA (20 %)'.padEnd(leftColumnWidth, ' ')}  ${roomBooking.pricing.vatAmount}`);
    }

    if (roomBooking.pricing.totalTtc) {
      lines.push(`${'Total TTC'.padEnd(leftColumnWidth, ' ')}  ${roomBooking.pricing.totalTtc}`);
    }
  }

  if (contact.company) {
    lines.push(`Entreprise : ${contact.company}`);
  }

  if (contact.fullName) {
    lines.push(`Nom : ${contact.fullName}`);
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
  const roomBooking = payload.roomBooking;
  const roomBookingDuration = payload.reservationType === 'salle' && roomBooking?.duration
    ? formatRoomBookingDuration(roomBooking.duration, payload.requestedTime)
    : '';
  const roomOptions = payload.reservationType === 'salle' && roomBooking?.options.length
    ? formatRoomOptions(roomBooking.options)
    : [];
  const pricingRows = payload.reservationType === 'salle' && roomBooking?.pricing?.lines.length
    ? roomBooking.pricing.lines.map((line) => `
        <tr>
          <td style="padding:8px 12px 8px 0;vertical-align:top;font-size:14px;color:#111827;">
            <div>${escapeHtml(line.label)}</div>
            ${line.detail ? `<div style="margin-top:4px;font-size:12px;color:#6b7280;">${escapeHtml(line.detail)}</div>` : ''}
          </td>
          <td style="padding:8px 0;text-align:right;vertical-align:top;font-size:14px;font-weight:600;color:#111827;white-space:nowrap;">${escapeHtml(line.amountHt)}</td>
        </tr>
      `).join('')
    : '';

  return `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
      <h1 style="font-size:20px;margin:0 0 16px">Nouvelle demande depuis le site</h1>
      <div style="font-size:14px;">
        <p style="margin:0 0 6px;"><strong>Type de demande :</strong> ${escapeHtml(reservationTypeLabel[payload.reservationType])}</p>
        <p style="margin:0 0 6px;"><strong>Espace demandé :</strong> ${escapeHtml(payload.offerLabel)}</p>
        <p style="margin:0 0 6px;"><strong>Date souhaitée :</strong> ${escapeHtml(payload.requestedDate)}</p>
        <p style="margin:0 0 6px;"><strong>${payload.reservationType === 'salle' ? 'Créneau souhaité' : 'Heure souhaitée'} :</strong> ${escapeHtml(payload.requestedTime)}</p>
        ${roomBookingDuration ? `<p style="margin:0 0 6px;"><strong>Format choisi :</strong> ${escapeHtml(roomBookingDuration)}</p>` : ''}
        ${roomOptions.length ? `<p style="margin:0 0 6px;"><strong>Options souhaitées :</strong> ${escapeHtml(roomOptions.join(', '))}</p>` : ''}
        <p style="margin:0 0 6px;"><strong>Email :</strong> ${escapeHtml(payload.contact.email)}</p>
        <p style="margin:0 0 6px;"><strong>Téléphone :</strong> ${escapeHtml(payload.contact.phone)}</p>
        ${payload.contact.company ? `<p style="margin:0 0 6px;"><strong>Entreprise :</strong> ${escapeHtml(payload.contact.company)}</p>` : ''}
        ${payload.contact.fullName ? `<p style="margin:0 0 6px;"><strong>Nom :</strong> ${escapeHtml(payload.contact.fullName)}</p>` : ''}
        ${payload.contact.activity ? `<p style="margin:0 0 6px;"><strong>Activité / besoin :</strong> ${escapeHtml(payload.contact.activity)}</p>` : ''}
        ${payload.contact.attendees ? `<p style="margin:0 0 6px;"><strong>Participants / postes :</strong> ${escapeHtml(payload.contact.attendees)}</p>` : ''}
        ${payload.contact.notes ? `<p style="margin:0 0 6px;"><strong>Message :</strong> ${escapeHtml(payload.contact.notes)}</p>` : ''}
      </div>

      ${pricingRows ? `
        <div style="margin-top:20px;">
          <h2 style="margin:0 0 10px;font-size:16px;">Récapitulatif tarifaire</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tbody>
              ${pricingRows}
              ${roomBooking?.pricing?.totalHt ? `<tr><td style="padding:10px 12px 0 0;border-top:1px solid #e5e7eb;font-size:14px;font-weight:700;">Total HT</td><td style="padding:10px 0 0;border-top:1px solid #e5e7eb;text-align:right;font-size:14px;font-weight:700;white-space:nowrap;">${escapeHtml(roomBooking.pricing.totalHt)}</td></tr>` : ''}
              ${roomBooking?.pricing?.vatAmount ? `<tr><td style="padding:8px 12px 0 0;font-size:14px;font-weight:600;">TVA (20 %)</td><td style="padding:8px 0 0;text-align:right;font-size:14px;font-weight:600;white-space:nowrap;">${escapeHtml(roomBooking.pricing.vatAmount)}</td></tr>` : ''}
              ${roomBooking?.pricing?.totalTtc ? `<tr><td style="padding:10px 12px 0 0;border-top:1px solid #e5e7eb;font-size:15px;font-weight:700;">Total TTC</td><td style="padding:10px 0 0;border-top:1px solid #e5e7eb;text-align:right;font-size:15px;font-weight:700;white-space:nowrap;">${escapeHtml(roomBooking.pricing.totalTtc)}</td></tr>` : ''}
            </tbody>
          </table>
        </div>
      ` : ''}
    </div>
  `.trim();
}

function formatRoomBookingDuration(duration: string, requestedTime: string) {
  const cleanDuration = duration.split(' - ')[0]?.trim() ?? '';

  if (!cleanDuration) {
    return '';
  }

  if (cleanDuration.toLowerCase().includes('demi-journ')) {
    return `${cleanDuration} ${requestedTime}`.trim();
  }

  return cleanDuration;
}

function formatRoomOptions(options: string[]) {
  return options.map((option) => option.split(' : ')[0]?.trim() ?? option).filter(Boolean);
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
