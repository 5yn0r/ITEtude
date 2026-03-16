# ITEtude - V1

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-11-orange?logo=firebase)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-blue?logo=tailwind-css)](https://tailwindcss.com/)

**La Boussole de l'Apprenant pour l'IT Francophone.**

ITEtude est une solution de curation intelligente qui transforme le chaos informationnel en parcours d'apprentissage structurés pour la communauté informatique francophone.

**Visitez l'application en ligne :** [**https://www.itetude.com**](https://www.itetude.com)

---

## 🎯 Problématique

Le monde de l'informatique est un océan d'informations. Pour les apprenants, en particulier francophones, il est souvent difficile de naviguer dans cette immensité de ressources. On se retrouve vite submergé, ne sachant pas par où commencer, quelles ressources sont fiables, ou comment organiser son apprentissage de manière logique. Cette surcharge mène à la démotivation et à l'abandon.

## ✨ Notre Solution

ITEtude est la boussole qui guide les passionnés d'IT. Notre plateforme ne se contente pas de lister des ressources ; elle les organise en **parcours d'apprentissage cohérents**, conçus pour construire les compétences étape par étape.

### Fonctionnalités Clés

-   📚 **Parcours d'Apprentissage Structurés** : Des chemins balisés pour passer de débutant à expert.
-   🔍 **Ressources Qualifiées** : Une sélection de contenus (articles, vidéos, docs) triés sur le volet.
-   👤 **Tableau de Bord Personnel** : Suivez votre progression, gérez vos favoris et reprenez là où vous vous êtes arrêté.
-   ⚙️ **Filtrage Avancé** : Trouvez la ressource parfaite en filtrant par difficulté, langue, ou "poids data".
-   🛡️ **Panneau Administrateur** : Interface complète pour la gestion des ressources, des parcours et des feedbacks utilisateurs.

## 🛠️ Stack Technique

-   **Framework** : [Next.js](https://nextjs.org/) (App Router)
-   **Langage** : [TypeScript](https://www.typescriptlang.org/)
-   **Backend & Authentification** : [Firebase](https://firebase.google.com/) (Firestore, Authentication)
-   **Styling** : [Tailwind CSS](https://tailwindcss.com/)
-   **Composants UI** : [shadcn/ui](https://ui.shadcn.com/)
-   **Fonctionnalités IA** : [Genkit](https://firebase.google.com/docs/genkit)
-   **Gestion de Formulaires** : [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)

##   Démarrage Rapide

Suivez ces étapes pour lancer le projet en local.

### Prérequis

-   Node.js (version 18.x ou supérieure)
-   npm ou npx ou yarn 

### 1. Cloner le dépôt

```bash
git clone https://github.com/5yn0r/ITEtude.git
cd ITEtude
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

Ce projet nécessite une connexion à un projet Firebase.

1.  Créez un fichier `.env.local` à la racine du projet.
2.  Copiez le contenu du fichier `.env` dans votre nouveau fichier `.env.local`.
3.  Remplacez les valeurs des placeholders par vos propres clés de configuration Firebase. Vous pouvez les trouver dans les paramètres de votre projet sur la console Firebase.

```env
# Contenu de .env.local

NEXT_PUBLIC_FIREBASE_API_KEY="YOUR_API_KEY"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="YOUR_AUTH_DOMAIN"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="YOUR_PROJECT_ID"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="YOUR_STORAGE_BUCKET"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="YOUR_MESSAGING_SENDER_ID"
NEXT_PUBLIC_FIREBASE_APP_ID="YOUR_APP_ID"
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="YOUR_MEASUREMENT_ID"
```
**Important :** Le contenu du fichier `.env.local` depend de vos configurations firebase.

### 4. Lancer le serveur de développement

```bash
npm run dev
```

Ouvrez [http://localhost:9002](http://localhost:9002) dans votre navigateur pour voir le résultat.

---

Merci à vous, et n'oubliez-pas de nous faire des retours après votre expérience sur la plateforme ITEtude accessible à l'adresse: https://itetude.com ! 

"L'information est gratuite, mais le temps est cher"
