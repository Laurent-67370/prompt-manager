import { useState, useEffect } from 'react';

/**
 * Une version de secours du composant PromptManager.
 * Utilisée pour déboguer les problèmes d'initialisation ou comme solution de repli.
 * Affiche un message d'état simple indiquant si l'application a démarré avec succès.
 *
 * @returns {JSX.Element} Le composant de secours rendu.
 */
export default function PromptManager() {
  const [status, setStatus] = useState('Initialisation...');

  useEffect(() => {
    try {
      setStatus('✅ App démarrée avec succès');
      console.log('✅ App démarrée avec succès');
    } catch (error) {
      setStatus('❌ Erreur: ' + error);
      console.error('❌ Erreur:', error);
    }
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      padding: '20px',
      fontFamily: 'system-ui'
    }}>
      <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>Prompt Manager</h1>
      <p style={{ fontSize: '18px', color: '#666' }}>{status}</p>
      <p style={{ fontSize: '14px', color: '#999', marginTop: '20px' }}>
        Ouvrez la console (F12) pour plus d'informations
      </p>
    </div>
  );
}
