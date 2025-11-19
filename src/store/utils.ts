import { Draft } from '@reduxjs/toolkit';

export async function applyOptimisticUpdateToAllCacheEntries<TQueryResult>(
  api: {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    dispatch: any;
    getState: () => any;
    queryFulfilled: Promise<any>;
  },
  APISlice: any,
  endpoint: string,
  updateFn: (draft: Draft<TQueryResult>) => void,
) {
  const patchResults: { undo: () => void }[] = [];
  const flatArgs = APISlice.util.selectCachedArgsForQuery(
    api.getState(),
    endpoint,
  );
  flatArgs.forEach((p: any) => {
    patchResults.push(
      api.dispatch(APISlice.util.updateQueryData(endpoint, p, updateFn)),
    );
  });
  try {
    await api.queryFulfilled;
  } catch {
    patchResults.forEach((p) => p.undo());
  }
}
