import { Paginated } from '@/common/fetching/fetching.types';
import { API } from '@/store/api';

import type { GlobalSettings } from '../model/global-settings';
import type { Probe } from '../model/probe';
import type { SciriusContext } from '../model/scirius-context';
import type { Source } from '../model/source';
import type { SystemSettings } from '../model/system-settings';
import type { GlobalSettingsDto } from './global-settings.dto';
import { toGlobalSettings } from './global-settings.transforms';
import type { ProbeDto } from './probe.dto';
import { toProbe } from './probe.transforms';
import type { SciriusContextDto } from './scirius-context.dto';
import { toSciriusContext } from './scirius-context.transforms';
import type { SourceDto } from './source.dto';
import { toSource } from './source.transforms';
import type { SystemSettingsDto } from './system-settings.dto';
import { toSystemSettings } from './system-settings.transforms';

export const SettingsAPI = API.injectEndpoints({
  overrideExisting: import.meta.env.VITE_APP_MODE === 'development',
  endpoints: (builder) => ({
    getSystemSettings: builder.query<SystemSettings, void>({
      query: () => ({
        url: '/rules/system_settings/',
        method: 'GET',
      }),
      transformResponse: (dto: SystemSettingsDto) => toSystemSettings(dto),
    }),
    getGlobalSettings: builder.query<GlobalSettings, void>({
      query: () => ({
        url: '/appliances/global_settings/',
        method: 'GET',
      }),
      transformResponse: (dto: GlobalSettingsDto) => toGlobalSettings(dto),
    }),
    getSciriusContext: builder.query<SciriusContext, void>({
      query: () => ({
        url: '/rules/scirius_context',
        method: 'GET',
      }),
      transformResponse: (dto: SciriusContextDto) => toSciriusContext(dto),
      providesTags: ['Reload'],
    }),
    getSources: builder.query<Paginated<Source>, { datatype?: string }>({
      query: () => ({
        url: '/rules/source',
        method: 'GET',
      }),
      transformResponse: (response: Paginated<SourceDto>) => ({
        ...response,
        results: response.results.map(toSource),
      }),
      providesTags: ['Reload'],
    }),
    getProbes: builder.query<Probe[], void>({
      query: () => ({
        url: '/appliances/probe/?page_size=1000',
        method: 'GET',
      }),
      transformResponse: (response: Paginated<ProbeDto>) =>
        response.results.map(toProbe),
      providesTags: ['Reload'],
    }),
  }),
});

export const {
  useGetSystemSettingsQuery,
  useGetGlobalSettingsQuery,
  useGetSciriusContextQuery,
  useGetSourcesQuery,
  useGetProbesQuery,
} = SettingsAPI;
