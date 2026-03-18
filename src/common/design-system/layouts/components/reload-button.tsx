import { RefreshCw } from 'lucide-react';

import { Button } from '@/common/design-system/atoms/ui/button';
import { cn } from '@/common/lib/utils';
import { useGetSTIThreatsQuery } from '@/features/threats/common/threats.api';
import { API } from '@/store/api';
import { useAppDispatch } from '@/store/store';

export const ReloadButton = () => {
  const dispatch = useAppDispatch();
  const { isFetching } = useGetSTIThreatsQuery();
  return (
    <Button
      variant="secondary"
      onClick={() => {
        dispatch(API.util.invalidateTags(['Reload']));
      }}
      size="sm"
      data-testid="reload-button"
    >
      <RefreshCw className={cn(isFetching && 'animate-spin')} />
      Reload
    </Button>
  );
};
