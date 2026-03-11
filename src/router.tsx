import { createRouter } from '@tanstack/react-router';

import { store } from '@/store/store';

import { routeTree } from './routeTree.gen';

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  scrollRestoration: true,
  basepath: import.meta.env.BASE_URL || '/',
  context: { store },
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
