export type QueryRunResult = {
  data?: { results?: unknown[] };
  isLoading: boolean;
  isError: boolean;
};

export type RunStats = {
  total: number;
  withResults: number;
  errored: number;
};

export function computeRunStats(queries: QueryRunResult[]): RunStats {
  let withResults = 0;
  let errored = 0;
  for (const q of queries) {
    if (q.isError) {
      errored += 1;
      continue;
    }
    if ((q.data?.results?.length ?? 0) > 0) {
      withResults += 1;
    }
  }
  return { total: queries.length, withResults, errored };
}
