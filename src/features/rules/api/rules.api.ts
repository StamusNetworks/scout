import { buildQueryParams } from '@/common/fetching/build-query-params';
import {
  DateRange,
  Paginated,
  Pagination,
  QFilter,
  Tenant,
} from '@/common/fetching/fetching.types';
import { API } from '@/store/api';

import { Rule } from '../model/rule';
import { RuleSet } from '../model/rule-set';
import { RuleStatus } from '../model/rule-status';
import { RuleSetDto } from './rule-set.dto';
import { toRuleSet } from './rule-set.transforms';
import { RuleStatusResponseDto } from './rule-status.dto';
import { toRuleStatuses } from './rule-status.transforms';
import { RuleDto } from './rule.dto';
import { toRule } from './rule.transforms';

export const RulesAPI = API.injectEndpoints({
  overrideExisting: import.meta.env.VITE_APP_MODE === 'development',
  endpoints: (builder) => ({
    getRules: builder.query<
      Paginated<Rule>,
      DateRange &
        Tenant &
        Pagination &
        QFilter & {
          family_class?: 'doc' | 'dopv';
          host_id_qfilter?: string;
          hits_min?: number;
          ordering?: string;
          sid?: string | number;
        }
    >({
      query: (params) => ({
        url: `/rules/rule/`,
        method: 'GET',
        params: buildQueryParams(params, { time_format: 'elastic' }),
      }),
      transformResponse: (res: Paginated<RuleDto>): Paginated<Rule> => ({
        ...res,
        results: res.results.map(toRule),
      }),
      providesTags: ['Reload'],
    }),
    getRuleBySid: builder.query<Rule | undefined, { sid: number }>({
      query: ({ sid }) => ({
        url: `/rules/rule/?sid=${sid}`,
        method: 'GET',
        params: {
          stamus: true,
          discovery: true,
          alert: true,
        },
      }),
      transformResponse: (data: Paginated<RuleDto>) => {
        const dto = data.results?.[0];
        return dto ? toRule(dto) : undefined;
      },
    }),
    getRuleStatusesByRuleId: builder.query<RuleStatus[], { id: number }>({
      query: ({ id }) => ({
        url: `/rules/rule/${id}/status/`,
        method: 'GET',
      }),
      transformResponse: (data: RuleStatusResponseDto) => toRuleStatuses(data),
      providesTags: ['Reload'],
    }),
    getRuleSets: builder.query<RuleSet[], void>({
      query: () => ({
        url: `/rules/ruleset/`,
        method: 'GET',
      }),
      transformResponse: (response: Paginated<RuleSetDto>) =>
        response.results.map(toRuleSet),
      providesTags: ['Reload', 'Rulesets'],
    }),
    updatePushRuleSet: builder.mutation<
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

export const {
  useGetRulesQuery,
  useGetRuleBySidQuery,
  useGetRuleStatusesByRuleIdQuery,
  useGetRuleSetsQuery,
  useUpdatePushRuleSetMutation,
} = RulesAPI;
