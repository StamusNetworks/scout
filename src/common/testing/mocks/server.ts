import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import threats from './data/threats.json' with { type: 'json' };

// This configures a request mocking server with the given request handlers.

export type Post = {
  id: number;
  title: string;
  body: string;
};

export const posts: Record<number, Post> = {
  1: { id: 1, title: 'hello', body: 'extra body!' },
};

export const baseUrl = '/undefined/rest';

export const server = setupServer(
  http.get(baseUrl + '/appliances/threat', () =>
    HttpResponse.json({
      count: 1151,
      next: null,
      previous: null,
      results: threats,
    }),
  ),
  http.get(baseUrl + '/appliances/host_id_alerts/', () =>
    HttpResponse.json({
      count: 0,
      next: null,
      previous: null,
      results: [],
    }),
  ),
  http.get(baseUrl + '/rules/deeplink/', () =>
    HttpResponse.json({
      count: 0,
      next: null,
      previous: null,
      results: [],
    }),
  ),

  // Threat families
  http.get(baseUrl + '/appliances/threat_family/', () => {
    return HttpResponse.json({ results: [mockFamily] });
  }),

  // Threat by ID
  http.get(baseUrl + '/appliances/threat/:threatId', () => {
    return HttpResponse.json(mockThreat);
  }),
);

const mockThreat = {
  id: '1',
  name: 'Test Threat',
};

const mockFamily = {
  pk: 1,
  id: '1',
  name: 'Test Family',
};
