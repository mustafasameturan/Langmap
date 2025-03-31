import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    cors: true,
    strictPort: true,
  },
  preview: {
    host: true,
    port: 4173,
    strictPort: true,
    cors: true,
    allowedHosts: [
      'langmap.server-mst.com.tr',
      'server-mst.com.tr',
      'localhost'
    ]
  }
})