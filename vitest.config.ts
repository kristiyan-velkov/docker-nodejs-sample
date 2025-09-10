import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/shared/test/setup.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/shared/test/',
        '**/*.d.ts',
        '**/*.test.{ts,tsx}',
        '**/__tests__/**',
        'dist/',
        'coverage/',
        'vite.config.ts',
        'vitest.config.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/components': resolve(__dirname, './src/client/components'),
      '@/utils': resolve(__dirname, './src/shared/utils'),
      '@/types': resolve(__dirname, './src/shared/types'),
    },
  },
});
