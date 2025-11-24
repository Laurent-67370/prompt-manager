# 🔧 Guide de Dépannage

## Problème : Écran blanc au démarrage

Si vous obtenez un écran blanc au démarrage de l'application, suivez ces étapes :

### 1. Vérifier la console du navigateur

Ouvrez la console du développeur (F12) et regardez les erreurs :
- **Chrome/Edge** : F12 → Onglet "Console"
- **Firefox** : F12 → Onglet "Console"
- **Safari** : Cmd+Option+C (Mac)

### 2. Vérifier la configuration Firebase

L'écran blanc est souvent causé par une configuration Firebase manquante ou incorrecte.

#### Créer le fichier .env

1. Copiez `.env.example` vers `.env` :
```bash
cp .env.example .env
```

2. Remplissez les valeurs avec votre configuration Firebase :
   - Allez sur https://console.firebase.google.com/
   - Sélectionnez votre projet
   - Cliquez sur l'icône engrenage ⚙️ → "Paramètres du projet"
   - Dans "Vos applications", trouvez la configuration Firebase
   - Copiez les valeurs dans `.env`

3. Redémarrez le serveur de développement :
```bash
npm run dev
```

### 3. Vérifier les logs dans la console

Après avoir configuré Firebase, vous devriez voir ces logs dans la console :
- ✅ `🔐 Initialisation de l'authentification Firebase...`
- ✅ `✅ Authentification réussie`
- ✅ `👤 Utilisateur connecté: [uid]`
- ✅ `📦 X prompt(s) chargé(s) depuis le cache` (si cache existant)

### 4. Erreurs courantes

#### Erreur : "Firebase: Error (auth/invalid-api-key)"
- **Cause** : La clé API Firebase est invalide
- **Solution** : Vérifiez `VITE_FIREBASE_API_KEY` dans `.env`

#### Erreur : "Firebase: Error (auth/configuration-not-found)"
- **Cause** : Le fichier `.env` n'existe pas ou est mal configuré
- **Solution** : Créez `.env` à partir de `.env.example`

#### Erreur : "localStorage is not defined"
- **Cause** : L'application tourne en mode SSR ou le localStorage est désactivé
- **Solution** : Vérifiez que vous êtes en mode client et que localStorage est activé dans votre navigateur

#### Erreur : "Cache corrompu"
- **Cause** : Le cache localStorage contient des données invalides
- **Solution** : Le cache sera automatiquement supprimé. Rechargez la page.

### 5. Nettoyer le cache

Si le problème persiste, nettoyez le cache :

```javascript
// Dans la console du navigateur, exécutez :
localStorage.clear();
location.reload();
```

### 6. Mode Offline

Si vous démarrez l'application en mode offline :
- Les prompts en cache seront chargés automatiquement
- Un badge "Mode hors ligne" apparaîtra en haut
- Les boutons nécessitant une connexion (Import, Exemples) seront désactivés
- Vous ne verrez pas d'écran blanc, mais l'état "Aucun prompt enregistré" si le cache est vide

### 7. Obtenir de l'aide

Si le problème persiste après toutes ces étapes :
1. Ouvrez la console (F12)
2. Copiez tous les messages d'erreur
3. Ouvrez une issue sur GitHub avec :
   - Les messages d'erreur complets
   - Votre système d'exploitation et navigateur
   - Les étapes pour reproduire le problème
