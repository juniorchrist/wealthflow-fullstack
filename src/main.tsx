import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Fade out and remove the static splash screen (see index.html) once the
// app has actually painted, instead of hiding it the instant main.tsx runs.
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    const loader = document.getElementById('app-loader');
    if (!loader) return;
    loader.classList.add('app-loader-hide');
    loader.addEventListener('transitionend', () => loader.remove(), { once: true });
  });
});
