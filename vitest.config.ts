import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.vitest': 'undefined',
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/utils/testSetup.ts',
    includeSource: ['src/**/*.{ts,tsx}'],
    typecheck: {
      include: ['src/**/*.test.{ts,tsx}'],
    },
  },
});
