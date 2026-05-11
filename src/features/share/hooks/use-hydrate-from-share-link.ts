import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { toast } from 'sonner';

import { useFeatureFlags } from '@/common/lib/use-feature-flags';
import { useSetDates } from '@/features/dates';
import {
  toFilterFlags,
  useFilterFlagsRepository,
  useHardReplaceFilters,
  useQFBuilder,
} from '@/features/query-filters';
import { useSetTenant } from '@/features/tenancy';

import {
  decodeShareableState,
  toDatesPayload,
  toFilterInputs,
} from '../utils/shareable-state';

export const useHydrateFromShareLink = () => {
  const navigate = useNavigate();
  const { enterprise } = useFeatureFlags();
  const hardReplaceFilters = useHardReplaceFilters();
  const tagFiltersRepo = useFilterFlagsRepository();
  const qfBuilder = useQFBuilder();
  const setTenant = useSetTenant();
  const setDates = useSetDates();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get('s');
    const homeRoute = enterprise ? '/operational-center' : '/explorer';

    const fail = () => {
      toast.error('Invalid share link');
      navigate({ to: homeRoute, replace: true });
    };

    if (!encoded) {
      fail();
      return;
    }

    const state = decodeShareableState(encoded);
    if (!state) {
      fail();
      return;
    }

    if (state.tenant !== undefined) {
      setTenant(state.tenant);
    }

    setDates(toDatesPayload(state.time));

    const flags = toFilterFlags(state.tags);
    tagFiltersRepo.setEventTypes(flags.eventTypes);
    tagFiltersRepo.setAlertTags(flags.alertTags);
    tagFiltersRepo.setNovelty(flags.novelty);

    hardReplaceFilters(
      toFilterInputs(state.filters).map((input) =>
        qfBuilder.createFilter(input.key, input.value, input.options),
      ),
    );

    navigate({ to: state.route, replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Run once on mount to hydrate state from URL
  }, []);
};
