import { isNil } from 'ramda';

import { Pagination } from './fetching.types';
import { GlobalDeps } from './GlobalDeps';

export const buildQueryParams = (
  params: Pagination &
    Partial<GlobalDeps> & {
      investigation?: { key: string; value: string };
    },
  options?: {
    time_format: 'elastic' | 'postgre';
  },
) => {
  const { from, to, qfilter, body, pageSize, pageIndex, ...rest } = params;

  const response: Record<string, string | number | unknown> = {};

  const isElastic = options?.time_format === 'elastic';

  if (from) {
    response[!isElastic ? 'start_date' : 'from_date'] = !isElastic
      ? Math.floor(from / 1000)
      : from;
  }
  if (to) {
    response[!isElastic ? 'end_date' : 'to_date'] = !isElastic
      ? Math.floor(to / 1000)
      : to;
  }
  if (qfilter) {
    response.qfilter = qfilter;
  }
  if (pageSize) {
    response.page_size = pageSize;
  }
  if (pageIndex) {
    response.page = pageIndex + 1;
  }

  if (rest) {
    const cleanRest = Object.entries(rest)
      .filter(
        ([, value]) =>
          !isNil(value) && (typeof value === 'string' ? value !== '' : true),
      )
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
    return { ...response, ...cleanRest };
  }
  if (body) {
    return response;
  }
  return response;
};
