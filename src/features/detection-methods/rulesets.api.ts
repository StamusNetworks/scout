import { Dates, Tenant } from '@/common/fetching/fetching.types';
import { Paginated, Pagination } from '@/common/fetching/fetching.types';
import { Ruleset } from './ruleset.model';
import { API } from '@/store/api';

export type URLParams = Pagination & Tenant & Dates;

export const RulesetsAPI = API.injectEndpoints({
  endpoints: (builder) => ({
    // QUERIES
    getRulesets: builder.query<Ruleset[], void>({
      query: () => ({
        url: `/rules/ruleset/`,
        method: 'GET',
      }),
      transformResponse: (response: Paginated<Ruleset>) => response.results,
      providesTags: ['Reload', 'Rulesets'],
    }),
    updatePushRuleset: builder.mutation<
      { task_pk: number },
      { enterprise: boolean }
    >({
      query: ({ enterprise }) => ({
        url: `${enterprise ? '/appliances/probe' : '/suricata'}/update_push_all/`,
        method: 'POST',
      }),
      invalidatesTags: ['Rulesets'],
    }),
  }),
});

export const { useGetRulesetsQuery, useUpdatePushRulesetMutation } =
  RulesetsAPI;
