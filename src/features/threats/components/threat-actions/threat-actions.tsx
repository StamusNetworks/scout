import { useNavigate } from '@tanstack/react-router';
import { Binary, LayoutDashboard } from 'lucide-react';

import { Button } from '@/common/design-system/atoms/ui/button';
import { useQFBuilder } from '@/features/filtering/filters/query-filters/hooks/use-qf-builder';
import { useCreateFilter } from '@/features/filtering/filters/query-filters/use-cases/create-filter/create-filter';
import { useEnableTags } from '@/features/filtering/filters/tag-filters/use-cases/update-tag-filters/update-tag-filters';

type Props = {
  /** The threat name used as the filter value when navigating to events/explorer. */
  threatName: string;
};

/**
 * Page actions for a threat detail view: jump to detection events or open
 * the explorer, both pre-filtered by the threat name.
 */
export const ThreatActions = ({ threatName }: Props) => {
  const navigate = useNavigate();
  const createFilter = useCreateFilter();
  const enableTags = useEnableTags();
  const QFBuilder = useQFBuilder();
  const disabled = !QFBuilder;

  const applyThreatNameFilter = () => {
    enableTags();
    createFilter({ key: 'stamus.threat_name', value: threatName });
  };

  return (
    <>
      <Button
        variant="outline"
        disabled={disabled}
        onClick={() => {
          applyThreatNameFilter();
          navigate({ to: '/detection-events' });
        }}
      >
        <Binary />
        See events
      </Button>
      <Button
        disabled={disabled}
        onClick={() => {
          applyThreatNameFilter();
          navigate({ to: '/explorer' });
        }}
      >
        <LayoutDashboard />
        Investigate
      </Button>
    </>
  );
};
