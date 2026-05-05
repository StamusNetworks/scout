export type Tenant = {
  tenant?: number;
};

export type Dates = {
  start_date?: number;
  end_date?: number;
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
