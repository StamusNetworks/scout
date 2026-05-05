import { useGetSourcesQuery } from '../api/settings.api';

export const useSources = (params: { datatype?: string } = {}) =>
  useGetSourcesQuery(params);
