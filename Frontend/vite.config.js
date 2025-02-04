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
  base: '/Sistem-Manajemen-Magang/',
  build: {
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: [
            'react',
            'react-dom',
            'react-router-dom',
            'axios',
            // tambahkan library besar lainnya di sini
          ],
          // Pisahkan chunk berdasarkan fitur
          utils: ['/src/utils'],
          components: ['/src/components'],
        }
      }
    },
    sourcemap: false, // Matikan sourcemap untuk produksi
    minify: 'terser', // Gunakan terser untuk minifikasi yang lebih baik
    terserOptions: {
      compress: {
        drop_console: true, // Hapus console.log di produksi
        drop_debugger: true
      }
    }
  }
})