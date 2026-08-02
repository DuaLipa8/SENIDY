# SENIDY

Landing page pour le projet SENIDY TELECOM.

## Contenu

- `index.html` : structure de la page
- `style.css` : styles et responsive design
- `script.js` : interactions, panier, filtrage et formulaires
- `images/` : visuels des postes et coffrets

## Installation

Ouvre `index.html` dans ton navigateur ou utilise un serveur local.

## Utilisation

- Le site est responsive
- Les boutons ajoutent les produits au panier
- Le filtre affiche les postes ou coffrets
- Le formulaire de devis envoie un email

## Supabase

- Le projet est connecté à Supabase via `supabase-config.js`
- URL distante : `https://skedemgmscxyfpbmwdyc.supabase.co`
- Tables créées : `testimonials`, `quotes`, `orders`
- Le frontend utilise `@supabase/supabase-js` pour stocker les témoignages, demandes de devis et commandes

### Démarrage local

1. Ouvre le dossier du projet.
2. Lance le serveur frontend : `npm run dev` ou `npx http-server -c-1 .`
3. Démarre Supabase local si besoin : `scripts\start-supabase-local.cmd`
4. Arrête Supabase local : `scripts\stop-supabase-local.cmd`

## À améliorer

- Ajouter un README plus détaillé si tu veux
- Ajouter un vrai backend pour gérer les commandes
- Optimiser les images pour la production
