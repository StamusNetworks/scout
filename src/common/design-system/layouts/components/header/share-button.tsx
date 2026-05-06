import { useLocation } from '@tanstack/react-router';
import { Link } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/common/design-system/atoms/ui/button';
import { useDates } from '@/features/dates';
import { useFilterFlags, useQueryFilters } from '@/features/query-filters';
import { useTenant } from '@/features/tenancy';
import { buildShareableState, buildShareUrl } from '@/features/share';

export const ShareButton = () => {
  const location = useLocation();
  const dates = useDates();
  const queryFilters = useQueryFilters();
  const flags = useFilterFlags();
  const tenant = useTenant();

  const handleClick = () => {
    const state = buildShareableState(
      location.pathname + window.location.search,
      dates,
      queryFilters,
      flags,
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
