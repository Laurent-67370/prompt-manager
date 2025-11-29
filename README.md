# 🚀 Prompt Manager - Gestionnaire de Prompts IA

Application React moderne pour organiser et gérer vos prompts IA avec Firebase.

## ✨ Fonctionnalités

- ✅ **Gestion complète** : Créer, modifier, supprimer des prompts
- 🔍 **Recherche puissante** : Par titre, contenu, catégorie ou tags avec bouton d'effacement
- 📊 **Double affichage** : Vue tableau ou grille avec animations fluides
- 🏷️ **Organisation** : Catégories et tags personnalisables
- 📋 **Copie rapide** : Un clic pour copier dans le presse-papiers
- 💾 **Import/Export** : Sauvegardez et chargez vos prompts depuis/vers des fichiers JSON
- 📦 **Exemples intégrés** : Chargez des prompts d'exemple prédéfinis (détection automatique des doublons)
- 🎨 **Design moderne** : Interface premium avec glassmorphism, dégradés et micro-animations
- 💡 **Aide intégrée** : Guide d'utilisation complet accessible en un clic
- 📊 **Statistiques en temps réel** : Visualisez vos prompts, catégories et tags
- 📱 **Progressive Web App (PWA)** : Installez l'app sur votre appareil et utilisez-la hors ligne avec le cache localStorage
- 🔐 **Sécurisé** : Authentification Firebase et données privées
- 📱 **Responsive** : Design adapté mobile, tablette et bureau

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
│   ├── App.tsx             # Composant principal
│   ├── main.tsx            # Point d'entrée React
│   ├── index.css           # Styles globaux
│   ├── vite-env.d.ts       # Définitions de types Vite
│   └── config/
│       └── firebase.ts     # Configuration Firebase
├── public/                 # Actifs statiques
├── scripts/                # Scripts utilitaires
│   └── generate-icons.js   # Script pour générer les icônes PWA
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

- **Exporter tous les prompts** : Cliquez sur le bouton "Exporter" dans l'en-tête pour télécharger tous vos prompts dans un fichier JSON
- **Exporter un prompt unique** : Dans la vue tableau ou grille, cliquez sur l'icône de téléchargement pour exporter un prompt spécifique

Les fichiers exportés contiennent :
- Le titre du prompt
- Le contenu complet
- La catégorie
- Les tags associés
- Les dates de création et de modification

### Importer des prompts

1. Cliquez sur le bouton "Importer" dans l'en-tête
2. Sélectionnez un fichier JSON contenant des prompts
3. Les prompts seront automatiquement ajoutés à votre collection

**Format du fichier JSON** :
```json
[
  {
    "title": "Titre du Prompt",
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

L'application dispose d'un **guide d'utilisation complet** accessible via le bouton "Aide" dans l'en-tête (icône `?`).

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

### 🔧 Fonctionnalités Hors Ligne

L'application dispose d'un **mode hors ligne complet** avec cache local persistant :

#### 📦 Cache Local (localStorage)
- ✅ **Sauvegarde automatique** : Tous vos prompts sont sauvegardés localement
- ✅ **Chargement instantané** : Affichage immédiat au démarrage, même sans connexion
- ✅ **Persistance des données** : Vos prompts restent disponibles même hors ligne
- 🔄 **Synchronisation automatique** : Mise à jour du cache quand vous êtes en ligne

#### 🌐 Détection En Ligne/Hors Ligne
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
- ✅ Création de nouveaux prompts (synchronisation automatique)
- ✅ Modification de prompts existants (synchronisation automatique)
- ✅ Suppression de prompts (synchronisation automatique)

#### ⚠️ Fonctionnalités nécessitant une connexion
- 🔌 Import de prompts JSON
- 🔌 Chargement des exemples prédéfinis

#### 🔄 Synchronisation
Dès que la connexion est rétablie :
1. L'indicateur "Mode hors ligne" disparaît
2. Les changements effectués hors ligne (création, modification, suppression) sont envoyés vers Firebase
3. Les données Firebase se synchronisent avec le cache local
4. Les fonctionnalités d'import et de chargement d'exemples se réactivent

## 🔐 Sécurité

- Authentification Firebase obligatoire
- Chaque utilisateur accède uniquement à ses propres données
- Règles Firestore strictes
- Pas de données sensibles dans le code

## 🛠️ Technologies

- **React 18** + **TypeScript**
- **Firebase** (Auth + Firestore)
- **Vite** (Build ultra-rapide)
- **Tailwind CSS** (Style moderne)
- **Lucide React** (Icônes vectorielles)

## 📝 Licence

MIT - Libre d'utilisation

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

---

Créé avec ❤️ pour optimiser votre flux de travail IA
