import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Enregistrement du Service Worker pour la PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('✅ Service Worker enregistré avec succès:', registration.scope);

        // Vérifier les mises à jour toutes les heures
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);
      })
      .catch((error) => {
        console.error('❌ Échec de l\'enregistrement du Service Worker:', error);
      });
  });

  // Gérer les mises à jour du Service Worker
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('🔄 Nouvelle version de l\'application détectée');
    // Optionnel: afficher une notification à l'utilisateur pour recharger
  });
}
