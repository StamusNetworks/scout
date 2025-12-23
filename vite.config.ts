/// <reference types="vitest" />

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    proxy: {
      '/rest': {
        target: 'https://10.136.4.9/rest',
        rewrite: (path) => path.replace(/^\/rest/, ''),
        changeOrigin: true,
        secure: false,
      },
      '/blog': {
        target: 'https://10.136.4.9/blog',
        rewrite: (path) => path.replace(/^\/blog/, ''),
        changeOrigin: true,
        secure: false,
      },
      '/api': {
        target: 'https://10.136.4.9/api',
        rewrite: (path) => path.replace(/^\/api/, ''),
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
