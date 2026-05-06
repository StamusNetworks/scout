export type Tenant = {
  tenant?: number;
};

/**
 * Domain time window. `from` and `to` are epoch milliseconds — the
 * value is kept as plain numbers (not `Date` objects) so the shape
 * survives Redux/RTK Query serialization. `buildQueryParams`
 * translates to the wire shape (`start_date`/`end_date` epoch seconds
 * for postgres, `from_date`/`to_date` epoch milliseconds for elastic).
 */
export type DateRange = {
  from?: number;
  to?: number;
};

export type QFilter = {
  qfilter?: string;
  host_id_qfilter?: string;
  alert?: boolean;
  stamus?: boolean;
  discovery?: boolean;
};

/**
 * Domain pagination shape. `page` is 1-based (matches what users
 * see); `pageSize` is camelCase. `buildQueryParams` translates to
 * the wire shape (`page` / `page_size`) at the boundary.
 */
export type Pagination = {
  page?: number;
  pageSize?: number;
  ordering?: string;
};

/**
 * Backend currently caps unpaged fetches to the elastic `index.max_result_window`
 * default (10 000). Hidden from the domain so callers can express
 * intent (`pagination: FETCH_ALL`) instead of repeating the magic
 * number; once the backend lifts the cap, only this constant moves.
 */
const SERVER_FETCH_LIMIT = 10_000;

export const FETCH_ALL: Pagination = {
  page: 1,
  pageSize: SERVER_FETCH_LIMIT,
};

export type Ordering = {
  ordering?: string;
};

export type Paginated<T> = {
  next?: string | null;
  previous?: string | null;
  results: T[];
  count: number;
};
