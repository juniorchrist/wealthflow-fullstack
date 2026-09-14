import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Réveiller le backend Render immédiatement en arrière-plan dès le chargement du site
try {
  fetch('https://wealthflow-fullstack-2.onrender.com/health', { mode: 'cors' }).catch(() => {});
} catch {
  // Ignorer silencieusement si hors ligne
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
