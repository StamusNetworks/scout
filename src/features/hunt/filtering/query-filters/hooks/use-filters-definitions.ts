import { useAppSelector } from '@/store/store';

import {
  selectQueryFilterDefinition,
  selectQueryFiltersDefinitions,
} from '../store/query-filters.selector';

export const useQueryFilterDefinition = (filterId: string) => {
  return useAppSelector(selectQueryFilterDefinition(filterId));
};
export const useQueryFiltersDefinitions = () => {
  return useAppSelector(selectQueryFiltersDefinitions);
};
