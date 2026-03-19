import { Network, PencilRuler } from 'lucide-react';

import { FilterCategory } from './constants/query-filter.config';

export const FilterIcons = {
  [FilterCategory.EVENT]: null,
  [FilterCategory.HISTORY]: null,
  [FilterCategory.SIGNATURE]: PencilRuler,
  [FilterCategory.HOST]: Network,
  [FilterCategory.TRANSACTION]: null,
};
