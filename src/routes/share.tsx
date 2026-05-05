import { useNavigate } from '@tanstack/react-router';
import { createFileRoute } from '@tanstack/react-router';
import { useEffect } from 'react';
import { toast } from 'sonner';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { useFeatureFlags } from '@/common/lib/use-feature-flags';
import { type DatesPayload, useSetDates } from '@/features/dates';
import { useReorderFilters } from '@/features/query-filters/hooks/use-reorder-filters';
import { useReplaceFilters } from '@/features/query-filters/hooks/use-replace-filters';
import { useTagFiltersRepository } from '@/features/query-filters/hooks/use-tag-filters';
import { toFilterFlags } from '@/features/query-filters/model/filter-flags';
import { type FilterInput } from '@/features/query-filters/utils/filter-mapper';
import { useSetTenant } from '@/features/tenancy';
import {
  decodeShareableState,
  type ShareableState,
  type ShareableTime,
} from '@/features/ui/share/shareable-state';

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
  const navigate = useNavigate();
  const { enterprise } = useFeatureFlags();
  const reorderFilters = useReorderFilters();
  const replaceFilters = useReplaceFilters();
  const tagFiltersRepo = useTagFiltersRepository();
  const setTenant = useSetTenant();
  const setDates = useSetDates();

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
    setDates(toDatesPayload(state.time));

    // Set flag filters (event types, alert tags, novelty)
    const flags = toFilterFlags(state.tags);
    tagFiltersRepo.setEventTypes(flags.eventTypes);
    tagFiltersRepo.setAlertTags(flags.alertTags);
    tagFiltersRepo.setNovelty(flags.novelty);

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
