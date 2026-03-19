import { useAppSelector } from '@/store/store';

import {
  selectQueryFilterDefinition,
  selectQueryFiltersDefinitions,
} from '../query-filters.selectors';

export const useQueryFilterDefinition = (filterId: string) => {
  return useAppSelector(selectQueryFilterDefinition(filterId));
};
export const useQueryFiltersDefinitions = () => {
  return useAppSelector(selectQueryFiltersDefinitions);
};
