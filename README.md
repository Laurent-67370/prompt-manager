# 🚀 Prompt Manager - Gestionnaire de Prompts IA

Application React moderne pour organiser et gérer vos prompts IA avec Firebase.

## ✨ Fonctionnalités

- ✅ **Gestion complète** : Créer, modifier, supprimer des prompts
- 🔍 **Recherche puissante** : Par titre, contenu, catégorie ou tags avec bouton clear
- 📊 **Double affichage** : Vue tableau ou grille avec animations fluides
- 🏷️ **Organisation** : Catégories et tags personnalisables
- 📋 **Copie rapide** : Un clic pour copier dans le presse-papiers
- 💾 **Import/Export** : Sauvegardez et chargez vos prompts depuis/vers des fichiers JSON
- 📦 **Exemples intégrés** : Chargez des prompts d'exemple prédéfinis (détection automatique des doublons)
- 🎨 **Design moderne** : Interface premium avec glassmorphism, gradients et micro-animations
- 💡 **Aide intégrée** : Guide d'utilisation complet accessible en un clic
- 📊 **Statistiques en temps réel** : Visualisez vos prompts, catégories et tags
- 📱 **Progressive Web App (PWA)** : Installez l'app sur votre appareil et utilisez-la offline avec cache localStorage
- 🔐 **Sécurisé** : Authentification Firebase et données privées
- 📱 **Responsive** : Design adapté mobile, tablette et desktop

## 🎯 Démarrage rapide

### 1. Installation

```bash
# Installer les dépendances
npm install
```

### 2. Configuration Firebase

1. Créez un projet sur https://firebase.google.com/
2. Activez **Authentication** (mode Anonyme)
3. Créez une base de données **Firestore**
4. Copiez votre configuration Firebase

### 3. Variables d'environnement

Créez un fichier `.env` à la racine :

```env
VITE_FIREBASE_API_KEY=votre_api_key
VITE_FIREBASE_AUTH_DOMAIN=votre_projet.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=votre_projet_id
VITE_FIREBASE_STORAGE_BUCKET=votre_projet.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
VITE_APP_ID=prompt-manager
```

### 4. Règles Firestore

Dans Firebase Console > Firestore > Règles :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /artifacts/{appId}/users/{userId}/prompts/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 5. Lancer l'application

```bash
# Développement local
npm run dev

# Build de production
npm run build

# Prévisualiser le build
npm run preview
```

## 📦 Structure du projet

```
prompt-manager/
├── src/
│   ├── App.tsx              # Composant principal
│   ├── main.tsx            # Point d'entrée React
│   ├── index.css           # Styles globaux
│   └── config/
│       └── firebase.ts     # Configuration Firebase
├── public/                 # Assets statiques
├── .env                    # Variables d'environnement (à créer)
├── .env.example           # Exemple de variables
├── netlify.toml           # Configuration Netlify
├── package.json           # Dépendances
└── index.html             # HTML principal
```

## 🌐 Déploiement sur Netlify

### Option 1 : Via GitHub (Recommandé)

1. Poussez votre code sur GitHub
2. Connectez-vous à https://app.netlify.com/
3. Importez votre dépôt
4. Ajoutez les variables d'environnement dans les paramètres
5. Déployez !

### Option 2 : Déploiement manuel

1. `npm run build`
2. Glissez-déposez le dossier `dist` sur Netlify
3. Ajoutez les variables d'environnement
4. Redéployez

## 📥 Import/Export de Prompts

### Exporter vos prompts

- **Exporter tous les prompts** : Cliquez sur le bouton "Exporter" dans le header pour télécharger tous vos prompts dans un fichier JSON
- **Exporter un prompt unique** : Dans la vue tableau ou grille, cliquez sur l'icône de téléchargement (Download) pour exporter un prompt spécifique

Les fichiers exportés contiennent :
- Le titre du prompt
- Le contenu complet
- La catégorie
- Les tags associés
- Les dates de création et modification

### Importer des prompts

1. Cliquez sur le bouton "Importer" dans le header
2. Sélectionnez un fichier JSON contenant des prompts
3. Les prompts seront automatiquement ajoutés à votre collection

**Format du fichier JSON** :
```json
[
  {
    "title": "Titre du prompt",
    "content": "Contenu du prompt...",
    "category": "Code",
    "tags": ["python", "javascript"]
  }
]
```

Le fichier peut contenir un seul prompt (objet JSON) ou plusieurs prompts (tableau JSON).

### Charger des exemples

Cliquez sur le bouton "Exemples" pour charger automatiquement 5 prompts d'exemple couvrant différentes catégories :
- Traduction de code
- Génération de documentation
- Optimisation de prompts
- Rédaction SEO
- Analyse de données

**Note** : Le système détecte automatiquement les exemples déjà présents et ne charge que ceux qui manquent. Le bouton se désactive lorsque tous les exemples sont chargés.

## 💡 Aide Intégrée

L'application dispose d'un **guide d'utilisation complet** accessible via le bouton "Aide" dans le header (icône `?`).

Le guide comprend :
- 🚀 **Démarrage rapide** : 3 étapes simples pour commencer
- 📚 **Fonctionnalités principales** : Copie rapide, recherche, export/import, organisation
- 📥 **Guide import/export** : Instructions détaillées pour l'importation et l'exportation
- 💡 **Astuces et raccourcis** : Optimisez votre utilisation de l'application

**Accès rapide** : Cliquez sur le bouton "Aide" en haut à droite de l'écran à tout moment.

## 📱 Progressive Web App (PWA)

Prompt Manager est une **Progressive Web App** complète ! Vous pouvez l'installer sur n'importe quel appareil et l'utiliser comme une application native.

### ✨ Avantages de la PWA

- 📲 **Installation facile** : Installez l'app en un clic depuis votre navigateur
- 🚀 **Lancement rapide** : Icône sur votre écran d'accueil comme une app native
- 📴 **Mode offline** : Continuez à consulter vos prompts sans connexion internet
- 💾 **Cache intelligent** : Les données sont mises en cache pour un chargement ultra-rapide
- 🔄 **Mises à jour automatiques** : L'app se met à jour automatiquement en arrière-plan
- 📱 **Expérience native** : Pas de barre d'adresse, plein écran sur mobile

### 📥 Installation

#### Sur Desktop (Chrome, Edge, Brave)
1. Visitez l'application dans votre navigateur
2. Cliquez sur l'icône d'installation (➕) dans la barre d'adresse
3. Ou allez dans Menu > "Installer Prompt Manager"
4. Cliquez sur "Installer"
5. L'app s'ouvre comme une application native !

#### Sur Mobile (iOS Safari)
1. Ouvrez l'app dans Safari
2. Appuyez sur le bouton Partager (📤)
3. Sélectionnez "Sur l'écran d'accueil"
4. Appuyez sur "Ajouter"
5. L'icône apparaît sur votre écran d'accueil

#### Sur Mobile (Android Chrome)
1. Ouvrez l'app dans Chrome
2. Appuyez sur le menu (⋮)
3. Sélectionnez "Installer l'application"
4. Ou cliquez sur la bannière d'installation qui apparaît
5. Appuyez sur "Installer"

### 🎨 Génération des Icônes PWA

Les icônes PWA doivent être générées avant le déploiement :

```bash
# Option 1: ImageMagick
convert -background none public/icon.svg -resize 192x192 public/icon-192.png
convert -background none public/icon.svg -resize 512x512 public/icon-512.png

# Option 2: En ligne
# Utilisez https://convertio.co/svg-png/
# Uploadez public/icon.svg et convertissez aux tailles 192x192 et 512x512
```

Consultez `public/ICONS_README.md` pour plus de détails.

### ⚙️ Configuration PWA

L'application utilise :
- **manifest.json** : Configuration de l'app (nom, icônes, couleurs, etc.)
- **Service Worker (sw.js)** : Gestion du cache et mode offline
- **Cache Strategy** : Cache-first pour les assets, network-first pour Firebase

### 🔧 Fonctionnalités Offline

L'application dispose d'un **mode offline complet** avec cache local persistant :

#### 📦 Cache Local (localStorage)
- ✅ **Sauvegarde automatique** : Tous vos prompts sont sauvegardés localement
- ✅ **Chargement instantané** : Affichage immédiat au démarrage, même sans connexion
- ✅ **Persistance des données** : Vos prompts restent disponibles même hors ligne
- 🔄 **Synchronisation automatique** : Mise à jour du cache quand vous êtes en ligne

#### 🌐 Détection Online/Offline
- 📶 **Indicateur de statut** : Badge "Mode hors ligne" visible en haut de page
- 🎯 **Adaptation intelligente** : Les boutons nécessitant une connexion sont désactivés
- ⚡ **Basculement automatique** : L'app détecte et s'adapte aux changements de connexion

#### ✅ Fonctionnalités disponibles hors ligne
- ✅ Interface utilisateur entièrement accessible
- ✅ Consultation de tous vos prompts en cache
- ✅ Recherche complète dans vos prompts
- ✅ Export de vos prompts en JSON
- ✅ Copie des prompts dans le presse-papiers
- ✅ Basculement entre vue Table et Grille
- ✅ Visualisation des statistiques

#### ⚠️ Fonctionnalités nécessitant une connexion
- 🔌 Création de nouveaux prompts
- 🔌 Modification de prompts existants
- 🔌 Suppression de prompts
- 🔌 Import de prompts JSON
- 🔌 Chargement des exemples prédéfinis

#### 🔄 Synchronisation
Dès que la connexion est rétablie :
1. L'indicateur "Mode hors ligne" disparaît
2. Les boutons se réactivent automatiquement
3. Les données Firebase se synchronisent avec le cache local
4. Toutes les fonctionnalités redeviennent disponibles

## 🔐 Sécurité

- Authentification Firebase obligatoire
- Chaque utilisateur accède uniquement à ses propres données
- Règles Firestore strictes
- Pas de données sensibles dans le code

## 🎨 Design Moderne

L'application bénéficie d'un design premium avec :

### Interface
- ✨ **Glassmorphism** : Effets de verre dépoli et transparence
- 🌈 **Gradients** : Dégradés de couleurs harmonieux
- 💫 **Animations fluides** : Transitions et micro-interactions (hover, scale, translate)
- 🎯 **Ombres dynamiques** : Effets d'élévation au survol

### Composants
- 🔘 **Boutons premium** : Effets de glow et animations
- 📊 **Cartes modernes** : Bordures animées et transformations 3D
- 🔍 **Recherche intelligente** : Focus states et bouton clear automatique
- 📱 **Responsive complet** : Breakpoints sm, md, lg optimisés

### Expérience utilisateur
- 🎭 **États visuels** : Loading, empty state, notifications
- 🌊 **Transitions douces** : Duration 200-300ms pour fluidité
- 🎨 **Palette cohérente** : Indigo, purple, slate pour harmonie
- ⚡ **Performance** : Optimisé avec useMemo et callbacks

## 🛠️ Technologies

- **React 18** + **TypeScript**
- **Firebase** (Auth + Firestore)
- **Vite** (Build ultra-rapide)
- **Tailwind CSS** (Styling moderne)
- **Lucide React** (Icônes vectorielles)

## 📝 Licence

MIT - Libre d'utilisation

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

---

Créé avec ❤️ pour optimiser votre workflow IA
