export type ReservationType = 'bureau' | 'salle' | 'event';

export type ContactPayload = {
  company: string;
  activity: string;
  attendees: string;
  fullName: string;
  email: string;
  phone: string;
  notes: string;
};

export function buildReservationMailto({
  email,
  reservationType,
  offerLabel,
  requestedDate,
  requestedTime,
  contact,
}: {
  email: string;
  reservationType: ReservationType;
  offerLabel: string;
  requestedDate: string;
  requestedTime: string;
  contact: ContactPayload;
}) {
  const subjectByType: Record<ReservationType, string> = {
    bureau: `Demande de visite bureau - ${offerLabel}`,
    salle: `Demande de réservation salle - ${offerLabel}`,
    event: `Demande d'événement - ${offerLabel}`,
  };

  const lines = [
    'Bonjour,',
    '',
    `Je souhaite faire une demande pour ${offerLabel}.`,
    '',
    `Type de demande : ${reservationType}`,
    `Date souhaitée : ${requestedDate}`,
    `Heure souhaitée : ${requestedTime}`,
    `Nom : ${contact.fullName}`,
    `Email : ${contact.email}`,
    `Téléphone : ${contact.phone}`,
  ];

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

  const params = new URLSearchParams({
    subject: subjectByType[reservationType],
    body: lines.join('\n'),
  });

  return `mailto:${email}?${params.toString()}`;
}
