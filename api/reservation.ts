type ReservationType = 'bureau' | 'salle' | 'event';

type ContactPayload = {
  company: string;
  activity: string;
  attendees: string;
  fullName: string;
  email: string;
  phone: string;
  notes: string;
};

type ReservationRequestPayload = {
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

type ApiRequest = {
  method?: string;
  body?: unknown;
};

type ApiResponse = {
  setHeader: (name: string, value: string) => void;
  status: (statusCode: number) => ApiResponse;
  json: (body: unknown) => void;
};

const fallbackMailTo = 'contact@aidhabitat.fr';
const fallbackMailFrom = "L'esquisse commune <no-reply@aidhabitat.fr>";

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      res.status(405).json({ok: false, message: 'Méthode non autorisée.'});
      return;
    }

    const payload = parsePayload(req.body);

    if (!payload) {
      res.status(400).json({ok: false, message: 'Le formulaire est incomplet ou invalide.'});
      return;
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const toAddress = process.env.RESERVATION_MAIL_TO ?? fallbackMailTo;
    const fromAddress = process.env.RESERVATION_MAIL_FROM ?? fallbackMailFrom;

    if (!resendApiKey) {
      res.status(500).json({
        ok: false,
        message: "L'envoi d'email n'est pas configuré côté serveur.",
      });
      return;
    }

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [toAddress],
        reply_to: payload.contact.email,
        subject: buildReservationSubject(payload),
        text: buildReservationText(payload),
        html: buildReservationHtml(payload),
      }),
    });

    if (!resendResponse.ok) {
      const errorBody = await resendResponse.text();
      console.error('Resend error:', errorBody);
      res.status(502).json({
        ok: false,
        message: "L'email n'a pas pu être envoyé. Réessayez dans un instant.",
      });
      return;
    }

    res.status(200).json({
      ok: true,
      message: 'Votre demande a bien été envoyée.',
    });
  } catch (error) {
    console.error('Reservation function error:', error);
    res.status(500).json({
      ok: false,
      message: "Le serveur n'a pas pu traiter la demande.",
    });
  }
}

function parsePayload(body: unknown): ReservationRequestPayload | null {
  const source = parseBody(body);

  if (!source) {
    return null;
  }

  const reservationType = source.reservationType;
  const offerLabel = normalizeText(source.offerLabel);
  const requestedDate = normalizeText(source.requestedDate);
  const requestedTime = normalizeText(source.requestedTime);
  const contact = normalizeContactPayload(source.contact);
  const roomBooking = normalizeRoomBooking(source.roomBooking);

  if (
    !isReservationType(reservationType) ||
    !offerLabel ||
    !requestedDate ||
    !requestedTime ||
    !contact.fullName ||
    !contact.email ||
    !contact.phone
  ) {
    return null;
  }

  if (reservationType === 'salle' && !roomBooking.duration) {
    return null;
  }

  return {
    reservationType,
    offerLabel,
    requestedDate,
    requestedTime,
    contact,
    roomBooking: reservationType === 'salle' ? roomBooking : undefined,
  };
}

function parseBody(body: unknown): Record<string, unknown> | null {
  if (typeof body === 'string') {
    try {
      const parsed = JSON.parse(body) as unknown;
      return isRecord(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  return isRecord(body) ? body : null;
}

function isReservationType(value: unknown): value is ReservationType {
  return value === 'bureau' || value === 'salle' || value === 'event';
}

function normalizeContactPayload(value: unknown): ContactPayload {
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

function normalizeRoomBooking(value: unknown) {
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

function buildReservationSubject({
  reservationType,
  offerLabel,
}: Pick<ReservationRequestPayload, 'reservationType' | 'offerLabel'>) {
  const subjectByType: Record<ReservationType, string> = {
    bureau: `Demande de visite bureau - ${offerLabel}`,
    salle: `Demande de réservation salle - ${offerLabel}`,
    event: `Demande d'événement - ${offerLabel}`,
  };

  return subjectByType[reservationType];
}

function buildReservationText({
  reservationType,
  offerLabel,
  requestedDate,
  requestedTime,
  contact,
  roomBooking,
}: ReservationRequestPayload) {
  const reservationTypeLabel: Record<ReservationType, string> = {
    bureau: 'Bureau privé',
    salle: 'Salle de réunion',
    event: "Événement d'entreprise",
  };

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

function buildReservationHtml(payload: ReservationRequestPayload) {
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
