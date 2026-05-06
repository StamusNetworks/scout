import { API } from '@/store/api';

import type { CurrentUser } from '../model/current-user';
import type { CurrentUserDto } from './current-user.dto';
import { toCurrentUser } from './current-user.transforms';

export const AuthAPI = API.injectEndpoints({
  overrideExisting: import.meta.env.DEV,
  endpoints: (builder) => ({
    sessionActivity: builder.mutation<{ disconnect: boolean }, number>({
      query: (timeout) => ({
        url: `/accounts/sciriususer/session_activity/`,
        body: { timeout },
        method: 'POST',
      }),
    }),
    getCurrentUser: builder.query<CurrentUser, void>({
      query: () => ({
        url: `/accounts/sciriususer/current_user/`,
        method: 'GET',
      }),
      transformResponse: (dto: CurrentUserDto) => toCurrentUser(dto),
    }),
  }),
});

export const { useSessionActivityMutation, useGetCurrentUserQuery } = AuthAPI;
