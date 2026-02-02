import {
  BaseQueryFn,
  createApi,
  fetchBaseQuery,
} from '@reduxjs/toolkit/query/react';

import { startsWithOneOf } from '@/common/lib/strings';
import { getConfig } from '@/config';

import { apiErrorToast } from './api.error';
import { type RootState, RootStateWithAPI } from './store';

const getCookieValue = (cookieName: string) => {
  if (typeof document === 'undefined') {
    return undefined;
  }

  return document.cookie
    ?.split('; ')
    .find((cookie) => cookie.startsWith(`${cookieName}=`))
    ?.split('=')[1];
};

const baseQuery: BaseQueryFn = async (...baseQueryArgs) => {
  const [args, api] = baseQueryArgs;
  const state =
    (api.getState() as RootStateWithAPI) || ({} as RootStateWithAPI);

  // Prevent requests to /appliance endpoints when in community mode
  // These requests would all fail anyway since the Clear NDR CE backend does not contain these endpoints.
  const isEnterprise = state.settings.enterprise;
  if (!isEnterprise && args.url?.includes('/appliance')) {
    return {
      error: {
        status: 'CUSTOM',
        data: 'Request to /appliance endpoint is not allowed in community mode',
      },
    };
  }

  const urlPrefix = startsWithOneOf(args.url, ['/blog', '/api'])
    ? '/'
    : '/rest/';

  const result = await fetchBaseQuery({
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

  if ('error' in result && result.error) {
    apiErrorToast({ args, error: result.error });
  }

  return result;
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
