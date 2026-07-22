import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Keep vitest to the unit tests under src/. The e2e/ specs use
  // @playwright/test and are run by `npm run e2e`, not vitest — without this,
  // vitest's default glob picks up e2e/*.spec.js and fails to collect them.
  test: {
    include: ['src/**/*.{test,spec}.{js,jsx}'],
  },
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
