import { setTagFilters } from '@/features/filtering/filters/query-filters/query-filters.store';
import { useTagFiltersRepository } from '@/features/filtering/filters/tag-filters/tag-filters.repository';
import { store } from '@/store/store-instance';

import type { TagFilters } from '../../tag-filters.model';

const defaultTags: TagFilters = {
  novelty: false,
  alert: true,
  discovery: true,
  stamus: true,
  informational: true,
  relevant: true,
  untagged: true,
};

export const enableTags = (tags: Partial<TagFilters> = {}) =>
  store.dispatch(setTagFilters({ ...defaultTags, ...tags }));

export const useEnableTags = () => {
  const tagFiltersRepo = useTagFiltersRepository();
  return (tags?: Partial<TagFilters>) =>
    tagFiltersRepo.set({ ...defaultTags, ...tags });
};
