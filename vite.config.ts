/// <reference types="vitest" />

import tailwindcss from '@tailwindcss/vite';
import { devtools } from '@tanstack/devtools-vite';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

// https://vitejs.dev/config/
export default ({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd(), '') };
  return defineConfig({
    plugins: [
      TanStackRouterDevtools(devtools()),
      tanstackRouter({
        target: 'react',
        autoCodeSplitting: true,
      }),
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: '0.0.0.0',
      proxy: {
        '/rest': {
          target: `https://${process.env.VITE_PROXY}/rest`,
          rewrite: (path) => path.replace(/^\/rest/, ''),
          changeOrigin: true,
          secure: false,
        },
        '/blog': {
          target: `https://${process.env.VITE_PROXY}/blog`,
          rewrite: (path) => path.replace(/^\/blog/, ''),
          changeOrigin: true,
          secure: false,
        },
        '/api': {
          target: `https://${process.env.VITE_PROXY}/api`,
          rewrite: (path) => path.replace(/^\/api/, ''),
          changeOrigin: true,
          secure: false,
        },
      },
    },
  });
};
