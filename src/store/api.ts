import {
  BaseQueryFn,
  createApi,
  fetchBaseQuery,
} from '@reduxjs/toolkit/query/react';

import { startsWithOneOf } from '@/common/lib/strings';
import { getConfig } from '@/config';

import { type RootState } from './store';

const getCookieValue = (cookieName: string) => {
  if (typeof document === 'undefined') {
    return undefined;
  }

  return document.cookie
    ?.split('; ')
    .find((cookie) => cookie.startsWith(`${cookieName}=`))
    ?.split('=')[1];
};

const baseQuery: BaseQueryFn = (...baseQueryArgs) => {
  const [args] = baseQueryArgs;
  const urlPrefix = startsWithOneOf(args.url, ['/blog', '/api'])
    ? '/'
    : '/rest/';
  return fetchBaseQuery({
    baseUrl: getConfig()?.apiUrl + urlPrefix,
    prepareHeaders: (headers, { getState }) => {
      headers.set(
        'Authorization',
        `Bearer ${(getState() as RootState).auth.access_token}`,
      );

      const csrfToken = ['csrftoken', 'CSRF-TOKEN', 'X-CSRFToken', 'XSRF-TOKEN']
        .map(getCookieValue)
        .find(Boolean);

      if (typeof document !== 'undefined') {
        headers.set('Cookies', document.cookie);
      }

      if (csrfToken) {
        headers.set('X-CSRFToken', decodeURIComponent(csrfToken));
      }

      return headers;
    },
    credentials: 'include',
  })(...baseQueryArgs);
};

export const API = createApi({
  reducerPath: 'API',
  baseQuery,
  tagTypes: [
    'Reload',
    'Entities',
    'Beaconing',
    'Dashboard',
    'Filter Actions',
    'OpCenter',
    'Rulesets',
    'ActiveThreats',
    'CustomThreats',
    'Threats',
    'ThreatFamilies',
    'Deeplinks',
    'FilterSets',
    'OperationsHistory',
    'Hosts',
    'Incidents',
    'News',
  ],
  endpoints: () => ({}),
});
