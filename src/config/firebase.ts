import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

/**
 * Objet de configuration pour les services Firebase.
 * Chargé depuis les variables d'environnement.
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

/**
 * Indique si la configuration Firebase est présente et valide.
 * Vérifie la présence de apiKey, authDomain et projectId.
 * @type {boolean}
 */
export const isFirebaseConfigured = !!(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId
);

// Initialiser Firebase seulement si configuré
let app: any = null;
let auth: any = null;
let db: any = null;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log('✅ Firebase initialisé avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation de Firebase:', error);
  }
} else {
  console.warn('⚠️ Firebase non configuré - Mode offline uniquement');
}

/**
 * L'instance de l'application Firebase initialisée.
 * null si la configuration est manquante.
 * @type {FirebaseApp}
 */
export { app };

/**
 * L'instance du service d'authentification Firebase.
 * null si la configuration est manquante.
 * @type {Auth}
 */
export { auth };

/**
 * L'instance de la base de données Firestore Firebase.
 * null si la configuration est manquante.
 * @type {Firestore}
 */
export { db };

// Pour satisfaire le linter TS sur les imports inutilisés (utilisés uniquement dans la JSDoc)
export type { FirebaseApp, Auth, Firestore };

/**
 * L'identifiant de l'application chargé depuis les variables d'environnement.
 * Vaut 'default-app-id' si non fourni.
 * @type {string}
 */
export const appId = import.meta.env.VITE_APP_ID || 'default-app-id';
