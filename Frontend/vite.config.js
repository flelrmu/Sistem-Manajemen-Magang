import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': '/src', // Pastikan alias mengarah ke folder 'src'
    },
  },
  plugins: [react()],
  base: '/Magang/'
})
