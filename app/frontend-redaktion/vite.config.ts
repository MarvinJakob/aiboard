/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Eigene Anwendung mit Basispfad /redaktion (ARCHITECTURE.md, Abschnitt 3). Der Build landet im Backend
// und wird dort getrennt von der öffentlichen Webseite mit go:embed eingebettet.
export default defineConfig({
  base: '/redaktion/',
  plugins: [react()],
  build: {
    outDir: '../backend/internal/web/dist/redaktion',
    emptyOutDir: true,
    assetsDir: 'assets',
  },
  server: {
    port: 5174,
    proxy: {
      '/api': 'http://localhost:8080',
      '/media': 'http://localhost:8080',
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
});
