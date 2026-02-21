import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';

export default defineConfig({
  plugins: [svelte({ hot: !process.env.VITEST })],
  test: {
    name: 'layangkit',
    include: ['src/**/*.{test,spec}.{js,ts}'],
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/unit/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/static/**',
        '**/.svelte-kit/**',
        '**/migrations/**',
      ],
    },
  },
  resolve: {
    alias: {
      $lib: path.resolve('./src/lib'),
      $app: path.resolve('./tests/unit/mocks/app'),
    },
  },
});
