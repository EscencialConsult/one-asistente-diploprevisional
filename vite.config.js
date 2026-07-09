import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // 'autoUpdate': el service worker nuevo se activa y la app se recarga
      // sola en segundo plano apenas hay una versión nueva disponible. Así
      // un acceso directo instalado en el celular no puede quedar pegado en
      // una versión vieja: el propio navegador detecta el cambio de archivo
      // (hash distinto en cada build) y dispara la actualización, sin que
      // el usuario tenga que hacer nada.
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.webp',
        'one-iconocolor.webp',
        'one-logocolor.webp',
        'one-logoletra.webp',
        'escencial-logoblanco.webp',
        'bot/bot-one.png',
      ],
      manifest: {
        name: 'ONE by Escencial',
        short_name: 'ONE',
        description: 'Sistema de preguntas y respuestas de la Diplomatura Previsional',
        lang: 'es',
        start_url: '/',
        display: 'standalone',
        background_color: '#134e78',
        theme_color: '#134e78',
        orientation: 'portrait-primary',
        icons: [
          { src: '/one-iconocolor.webp', sizes: '192x192', type: 'image/webp' },
          {
            src: '/one-iconocolor.webp',
            sizes: '512x512',
            type: 'image/webp',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        // Precachea el shell de la app (JS/CSS/HTML con hash) para que
        // funcione offline y para que el navegador detecte la versión nueva
        // por el cambio de hash en cada build.
        globPatterns: ['**/*.{js,css,html,webp,png,svg,ico}'],
        // El sprite sheet del bot (bot/bot-one.png) pesa ~2.4MB y supera el
        // límite default de 2MB de Workbox. Lo subimos a 5MB para que se
        // siga precacheando. TODO: comprimir ese PNG (podría bajar mucho
        // de peso pasándolo a WebP, como el resto de los assets).
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
    }),
  ],
});
