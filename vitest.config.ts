import os from 'node:os';
import path from 'node:path';
import process from 'node:process';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    includeSource: ['src/**/*.test.{js,ts,jsx,tsx}'],
    include: ['src/**/*.test.{js,ts,jsx,tsx}'],
    environment: 'happy-dom',
    execArgv: [
      '--localstorage-file',
      path.resolve(os.tmpdir(), `vitest-${process.pid}.localstorage`),
    ],
    setupFiles: ['./src/common/testing/test-setup.ts'],
    coverage: {
      provider: 'v8',
    },
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
