import { updateTagFilters } from '@/features/filtering/query-filters/store/query-filters.slice';
import { useAppDispatch } from '@/store/store';

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

export const enableTags = (
  dispatch: ReturnType<typeof useAppDispatch>,
  tags: Partial<TagFilters> = {},
) => dispatch(updateTagFilters({ ...defaultTags, ...tags }));

export const useEnableTags = () => {
  const dispatch = useAppDispatch();
  return (tags?: Partial<TagFilters>) => enableTags(dispatch, tags);
};
