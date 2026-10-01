import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// PWA: registra o service worker só em produção (em dev atrapalharia o HMR).
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`)
      .then(() => {
        // Só recarrega em ATUALIZAÇÃO (já havia um SW controlando a página).
        // Sem isto, o aparelho fica com o catálogo velho até o usuário
        // limpar o cache na mão (não dá para exigir isso de uma criança).
        if (!navigator.serviceWorker.controller) return;
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (refreshing) return;
          refreshing = true;
          window.location.reload();
        });
      })
      .catch(() => {
        /* offline indisponível — o jogo segue funcionando normalmente */
      });
  });
}