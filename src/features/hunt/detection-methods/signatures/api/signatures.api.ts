import { toPairs, values } from 'ramda';

import { buildQueryParams } from '@/common/fetching/buildQueryParams';
import { Dates, QFilter, Tenant } from '@/common/fetching/fetching.types';
import { Paginated, Pagination } from '@/common/fetching/fetching.types';
import { API } from '@/store/api';

import { Signature } from '../model/signature';
import {
  SignatureStatus,
  SignatureStatusResponse,
} from '../model/signature-status';

export const SignaturesAPI = API.injectEndpoints({
  endpoints: (builder) => ({
    // QUERIES
    getSignatures: builder.query<
      Paginated<Signature>,
      Dates &
        Tenant &
        Pagination &
        QFilter & {
          family_class?: 'doc' | 'dopv';
          host_id_qfilter?: string;
          hits_min?: number;
          ordering?: string;
        }
    >({
      query: (params) => ({
        url: `/rules/rule/`,
        method: 'GET',
        params: buildQueryParams(params, { time_format: 'elastic' }),
      }),
      providesTags: ['Reload'],
    }),
    getSignatureRulesetsStatus: builder.query<
      SignatureStatus[],
      { pk: number }
    >({
      query: ({ pk }) => ({
        url: `/rules/rule/${pk}/status/`,
        method: 'GET',
      }),
      transformResponse: (data: Record<string, SignatureStatusResponse>) =>
        toPairs(data).map(
          ([key, { name, valid, transformations, ...rest }]) => ({
            name,
            valid,
            transformations,
            pk: Number(key),
            active: values(rest).some((value) => value.active),
          }),
        ),
      providesTags: ['Reload'],
    }),
  }),
});

export const { useGetSignaturesQuery, useGetSignatureRulesetsStatusQuery } =
  SignaturesAPI;
