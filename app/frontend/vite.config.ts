/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Der Build landet direkt im Backend und wird dort mit go:embed eingebettet (ARCHITECTURE.md, Abschnitt 6).
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../backend/internal/web/dist/public',
    emptyOutDir: true,
    assetsDir: 'assets',
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8080',
      '/media': 'http://localhost:8080',
    },
    // Tests prüfen die dokumentierten Antwortsätze gegen die Audit-Inhalte des Backends.
    fs: { allow: ['.', '../backend/internal/audit'] },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
});
