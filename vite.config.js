import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  preview: {
    port: 4173,
    host: '0.0.0.0',
    allowedHosts: ['langmap.server-mst.com.tr', 'localhost:4173'],
    cors: {
      origin: '*'
    }
  },
  server: {
    port: 4173,
    host: '0.0.0.0',
    allowedHosts: ['langmap.server-mst.com.tr', 'localhost:4173'],
    cors: {
      origin: '*'
    }
  }
})