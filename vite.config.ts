import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt', 'assets/icon-192.png', 'assets/icon-512.png'],
      manifest: {
        name: 'OpenMusikVerein',
        short_name: 'OMV',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        description: 'Musikvereinssoftware - Notenarchiv, Mitglieder, Termine, Finanzen',
        icons: [
          { src: '/assets/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/assets/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /.*\.pdf$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'pdf-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 }
            }
          },
          {
            urlPattern: /.*api\/notes.*/,
            handler: 'NetworkFirst',
            options: { cacheName: 'api-cache' }
          }
        ]
      }
    })
  ],
  server: { port: 5173 }
})
