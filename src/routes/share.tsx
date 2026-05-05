import { useNavigate } from '@tanstack/react-router';
import { createFileRoute } from '@tanstack/react-router';
import { useEffect } from 'react';
import { toast } from 'sonner';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { useFeatureFlags } from '@/common/lib/use-feature-flags';
import { type DatesPayload } from '@/features/filtering/dates/dates.model';
import { setDates } from '@/features/filtering/dates/dates.store';
import { useReorderFilters } from '@/features/filtering/filters/query-filters/use-cases/reorder-filters/reorder-filters';
import { useReplaceFilters } from '@/features/filtering/filters/query-filters/use-cases/replace-filters/replace-filters';
import { type FilterInput } from '@/features/filtering/filters/query-filters/utils/filter-mapper';
import { useTagFiltersRepository } from '@/features/filtering/filters/tag-filters/tag-filters.repository';
import { useSetTenant } from '@/features/tenancy';
import {
  decodeShareableState,
  type ShareableState,
  type ShareableTime,
} from '@/features/ui/share/shareable-state';
import { useAppDispatch } from '@/store/store';

export const Route = createFileRoute('/share')({
  component: () => (
    <PageBoundary key="share">
      <SharePage />
    </PageBoundary>
  ),
});

const toDatesPayload = (time: ShareableTime): DatesPayload => {
  switch (time.type) {
    case 'all':
      return { type: 'all' };
    case 'auto':
      return { type: 'auto', start_date: 0, end_date: Date.now() };
    case 'from':
      return {
        type: 'from',
        from_duration: time.duration,
        from_unit: time.unit,
      };
    case 'range':
      return { type: 'range', start_date: time.start, end_date: time.end };
  }
};

const toFilterInputs = (filters: ShareableState['filters']): FilterInput[] =>
  filters.map((f) => ({
    key: f.key,
    value: f.value,
    options: {
      ...(f.negated && { is_negated: true }),
      ...(f.wildcarded && { is_wildcarded: true }),
    },
  }));

function SharePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { enterprise } = useFeatureFlags();
  const reorderFilters = useReorderFilters();
  const replaceFilters = useReplaceFilters();
  const tagFiltersRepo = useTagFiltersRepository();
  const setTenant = useSetTenant();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get('s');

    if (!encoded) {
      toast.error('Invalid share link');
      navigate({
        to: enterprise ? '/operational-center' : '/explorer',
        replace: true,
      });
      return;
    }

    const state = decodeShareableState(encoded);
    if (!state) {
      toast.error('Invalid share link');
      navigate({
        to: enterprise ? '/operational-center' : '/explorer',
        replace: true,
      });
      return;
    }

    // Set tenant
    if (state.tenant !== undefined) {
      setTenant(state.tenant);
    }

    // Set time filters
    dispatch(setDates(toDatesPayload(state.time)));

    // Set tag filters
    tagFiltersRepo.set(state.tags);

    // Set query filters: clear silently (no toast) then replace
    reorderFilters([]);
    if (state.filters.length > 0) {
      replaceFilters(toFilterInputs(state.filters));
    }

    navigate({ to: state.route, replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Run once on mount to hydrate state from URL
  }, []);

  return null;
}

export { SharePage };
