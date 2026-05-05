import { useGetESMappingQuery } from '../api/es-mapping.api';

/**
 * Triggers the ES-mapping fetch and exposes its data. The query-filter
 * slice listens to the same endpoint via `extraReducers` and rebuilds
 * its `types` cache from the result.
 */
export const useESMapping = () => useGetESMappingQuery();
