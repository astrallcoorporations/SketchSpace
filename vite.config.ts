import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(dirname, './src'),
    },
  },
  build: {
    // Vendor chunks cache across deploys: app code changes often, these almost never do.
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'vendor-three', test: /node_modules[/](three|@react-three)[/]/, priority: 30 },
            { name: 'vendor-motion', test: /node_modules[/](framer-motion|motion-dom|motion-utils|gsap|lenis)[/]/, priority: 20 },
            { name: 'vendor-supabase', test: /node_modules[/]@supabase[/]/, priority: 20 },
            { name: 'vendor-react', test: /node_modules[/](react|react-dom|scheduler|react-router|react-router-dom)[/]/, priority: 20 },
          ],
        },
      },
    },
  },
  server: {
    proxy: {
      // Proxy legacy localhost:5000 image requests to bypass CORS in dev.
      // Old DB records still point to the original Express backend.
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
