import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        bypass: (req) => {
          if (req.url === '/api.js') return req.url;
        }
      }
    }
  },
  build: {
    outDir: 'dist'
  }
})