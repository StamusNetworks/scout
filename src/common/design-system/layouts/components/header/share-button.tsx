import { useLocation } from '@tanstack/react-router';
import { Link } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/common/design-system/atoms/ui/button';
import { selectDates } from '@/features/filtering/dates/dates.selectors';
import { selectQueryFilters } from '@/features/filtering/filters/query-filters/query-filters.selectors';
import { useTenant } from '@/features/tenancy';
import {
  buildShareableState,
  buildShareUrl,
} from '@/features/ui/share/shareable-state';
import { type RootState, useAppSelector } from '@/store/store';

export const ShareButton = () => {
  const location = useLocation();
  const dates = useAppSelector(selectDates);
  const queryFilters = useAppSelector(selectQueryFilters);
  const tagFilters = useAppSelector(
    (state: RootState) => state.filters.queryFilters.tagFilters,
  );
  const tenant = useTenant();

  const handleClick = () => {
    const state = buildShareableState(
      location.pathname + window.location.search,
      dates,
      queryFilters,
      tagFilters,
      tenant,
    );
    const url = buildShareUrl(
      state,
      window.location.origin,
      import.meta.env.BASE_URL || '/',
    );
    navigator.clipboard
      .writeText(url)
      .then(() => toast.success('Link copied to clipboard'))
      .catch(() => toast.error('Failed to copy link'));
  };

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={handleClick}
      aria-label="Share current view"
    >
      <Link />
    </Button>
  );
};
