import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  preview: {
    port: 4173,
    host: '0.0.0.0',
    allowedHosts: true,
    cors: {
      origin: '*'
    }
  },
  server: {
    port: 4173,
    allowedHosts: true,
    host: '0.0.0.0',
    cors: {
      origin: '*'
    }
  }
})