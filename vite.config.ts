import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: 'src/client',
  build: {
    outDir: '../../dist/client',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/components': resolve(__dirname, './src/client/components'),
      '@/utils': resolve(__dirname, './src/shared/utils'),
      '@/types': resolve(__dirname, './src/shared/types'),
    },
  },
  server: {
    host: '0.0.0.0', // Required for Docker containers
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  // Vitest configuration
  test: {
    globals: true,
    environment: 'jsdom',
    root: '.', // Override root for tests to run from project root
    setupFiles: ['src/shared/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{js,ts,jsx,tsx}'],
      exclude: [
        'node_modules/',
        'src/shared/test/',
        'src/client/index.html',
        'src/client/main.tsx',
        '**/*.d.ts',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        '**/__tests__/**',
        'dist/',
        'coverage/',
        '*.config.{js,ts}',
        'vite.config.ts',
        'tailwind.config.js',
        'postcss.config.js',
        'eslint.config.js',
      ],
    },
  },
});
