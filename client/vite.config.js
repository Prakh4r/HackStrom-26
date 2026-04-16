import { defineConfig } from 'vite'

import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_DOCKERIZED ? 'http://api-server:5000' : 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})
