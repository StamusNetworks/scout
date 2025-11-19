import { API } from '@/store/api';

import { CurrentUser } from '../model/current-user.schema';

export const AuthAPI = API.injectEndpoints({
  endpoints: (builder) => ({
    sessionActivity: builder.mutation<{ disconnect: boolean }, number>({
      query: (timeout) => ({
        url: `/accounts/sciriususer/session_activity/`,
        body: {
          timeout,
        },
        method: 'POST',
      }),
    }),
    getCurrentUser: builder.query<CurrentUser, void>({
      query: () => ({
        url: `/accounts/sciriususer/current_user/`,
        method: 'GET',
      }),
    }),
  }),
});

export const { useSessionActivityMutation, useGetCurrentUserQuery } = AuthAPI;
