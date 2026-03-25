import {siteConfig} from '../src/data/site';
import {
  buildReservationHtml,
  buildReservationSubject,
  buildReservationText,
  isReservationType,
  normalizeContactPayload,
  normalizeRoomBooking,
  type ReservationRequestPayload,
} from '../src/lib/reservation';

type ApiRequest = {
  method?: string;
  body?: unknown;
};

type ApiResponse = {
  setHeader: (name: string, value: string) => void;
  status: (statusCode: number) => ApiResponse;
  json: (body: unknown) => void;
  end: (body?: string) => void;
};

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

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
  const toAddress = process.env.RESERVATION_MAIL_TO ?? siteConfig.email;
  const fromAddress = process.env.RESERVATION_MAIL_FROM ?? `${siteConfig.brand} <no-respond@esquisse.aidhabitat.fr>`;

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

function normalizeText(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
