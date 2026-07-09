import React from 'react';
import ReactDOM from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Registra el service worker generado por vite-plugin-pwa. Con
// registerType: 'autoUpdate' (ver vite.config.js), apenas el navegador
// detecta una versión nueva la activa y recarga la app sola: así un acceso
// directo instalado no puede quedar pegado en una versión vieja. El aviso
// sutil de "se actualizó a la vX" lo muestra <UpdateToast/> comparando
// versiones en localStorage (ver src/version.js), es independiente de esto.
if ('serviceWorker' in navigator) {
  registerSW({ immediate: true });
}
