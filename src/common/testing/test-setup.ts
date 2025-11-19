import '@testing-library/jest-dom/vitest';

import { server } from './mocks/server';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

process.on('unhandledRejection', (error) => {
  throw error;
});

process.env.NODE_ENV = 'development';
