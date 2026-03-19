import { toast } from 'sonner';

import { getFilterLabel } from './get-filter-label';

export function showFilterToast(
  action: 'added' | 'updated' | 'deleted',
  filter: { key: string; value: string | number },
) {
  const label = getFilterLabel(filter.key);
  toast.success(`${label} filter ${action}`, {
    description: `value: ${filter.value}`,
  });
}
