
# Todo List - Gestionnaire de taches

Application web de gestion de taches construite avec `React`, `TypeScript` et `Vite`.
Le projet propose une experience moderne mobile-first avec mode clair/sombre, suivi de progression, categories personnalisables et prise en charge PWA.

## Fonctionnalites

- Ajout, modification, suppression et completion de taches
- Gestion des priorites (`Faible`, `Moyenne`, `Haute`, `Urgente`)
- Sous-taches et suivi d'avancement
- Ecrans dedies : accueil, calendrier, focus, profil, detail
- Categories par defaut + categories personnalisees
- Notifications navigateur (selon permissions)
- Export des donnees en `JSON` et `CSV`
- Mode clair / sombre
- Installation en PWA (sur navigateurs compatibles)

## Stack technique

- `React 18`
- `TypeScript`
- `Vite`
- `Tailwind CSS`
- `Motion` (animations)
- `Radix UI` + composants UI

## Installation

```bash
npm install
```

## Lancement en developpement

```bash
npm run dev
```

L'application sera accessible sur l'URL affichee dans le terminal (souvent `http://localhost:5173`).

## Build de production

```bash
npm run build
```

Les fichiers de production sont generes dans le dossier `dist/`.

## Structure du projet

```text
src/
  app/
    components/   # Composants UI (cartes, boutons, modales, navigation)
    hooks/        # Hooks metier (theme, notifications, categories, pwa)
    screens/      # Ecrans principaux de l'application
    utils/        # Fonctions utilitaires (stats, export, couleurs)
    types.ts      # Types TypeScript
  styles/         # Styles globaux, theme et polices
  main.tsx        # Point d'entree React
public/           # Assets statiques (manifest, service worker, icones)
```

## Scripts disponibles

- `npm run dev` : demarrer le serveur de developpement
- `npm run build` : construire l'application pour la production

## PWA

Le projet inclut :

- un `manifest` (`public/manifest.json`)
- un service worker (`public/sw.js`)
- un bouton d'installation dans l'ecran profil

> Note : l'installation PWA depend du navigateur et du contexte (HTTPS ou localhost).

## Roadmap (suggestion)

- Synchronisation cloud (auth + base de donnees)
- Taches recurrentes
- Recherche avancee et filtres combines
- Tests automatises (unitaires + UI)
  