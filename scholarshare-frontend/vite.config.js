import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Forwards any /api/* request from the dev server to the Java
      // backend, so the browser only ever talks to one origin and
      // you don't need CORS configured on the backend just to
      // develop locally. Update the target once your backend has a
      // real port/host, and set VITE_API_BASE_URL=/api in .env to
      // route through this proxy (see .env.example).
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
