import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:9637',
    },
  },
  base: '/ignet/',
  build: {
    outDir: '../dist-react',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/cytoscape-fcose') || id.includes('node_modules/cytoscape') || id.includes('node_modules/react-cytoscapejs')) {
            return 'cytoscape'
          }
        },
      },
    },
  },
})
