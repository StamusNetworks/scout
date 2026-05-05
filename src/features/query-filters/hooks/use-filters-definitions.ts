import { useAppSelector } from '@/store/store';

import {
  selectQueryFilterDefinition,
  selectQueryFiltersDefinitions,
} from '../state/query-filters.selectors';

export const useQueryFilterDefinition = (filterId: string) => {
  return useAppSelector(selectQueryFilterDefinition(filterId));
};
export const useQueryFiltersDefinitions = () => {
  return useAppSelector(selectQueryFiltersDefinitions);
};
