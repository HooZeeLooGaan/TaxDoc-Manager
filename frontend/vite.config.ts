import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      '/api':{
        target: process.env.TAX_DOC_API_ENDPOINT || 'http://web:8000',
        changeOrigin: true
      }
    },
    watch: {
      usePolling: true,
      interval: 100, // Check for file changes every 100ms
    },
  }
})
