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

export type Pagination = {
  page?: number;
  page_size?: number;

  pageIndex?: number;
  pageSize?: number;

  ordering?: string;
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
