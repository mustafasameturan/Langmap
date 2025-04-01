import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
	server: {
		cors: {
			origin: ['https://langmap.server-mst.com.tr', 'http://localhost:4173'],
			methods: ['GET', 'POST'],
			allowedHeaders: ['Content-Type']
		},
		allowedHosts: ['langmap.server-mst.com.tr', '*.server-mst.com.tr', 'localhost', '*']
	}
})