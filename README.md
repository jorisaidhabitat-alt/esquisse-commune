# L'esquisse commune

Site vitrine de réservation pour bureaux privés, salles de réunion et événements professionnels à Chartres-de-Bretagne.

## Démarrage local

Prérequis : Node.js 20+.

1. Installer les dépendances :
   `npm install`
2. Lancer le serveur local :
   `npm run dev`
3. Ouvrir l'URL affichée par Vite.

## Réservations

La réservation est envoyée directement depuis le formulaire via la fonction Vercel `/api/reservation`.
Les emails sont transmis à `contact@aidhabitat.fr` depuis l'adresse d'envoi configurée côté serveur.
Le paiement Stripe pour les salles de réunion et les événements sera branché dans une itération suivante.

## Pages légales

Le footer expose trois pages dédiées :

- Mentions légales
- Politique de confidentialité
- CGV et conditions de réservation

Certains champs administratifs restent à compléter avant publication officielle : forme juridique, capital social, SIREN, TVA et directeur de publication.

## Blog headless Webflow

Le blog est prévu en headless :

- la rédaction et la publication des articles se font dans Webflow
- l'application React/Vite récupère les contenus au build
- les routes `/blog` et `/blog/:slug` sont générées en HTML statique dans `dist/`

Variables d'environnement à prévoir pour le build :

- `WEBFLOW_API_TOKEN`
- `WEBFLOW_BLOG_COLLECTION_ID`
- `WEBFLOW_CMS_LOCALE_ID` si nécessaire

La commande `npm run build` :

1. build l'application Vite
2. récupère les articles Webflow
3. génère les pages statiques du blog et les fichiers JSON associés dans `dist/blog-data`
