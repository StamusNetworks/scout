import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/common/design-system/atoms/ui/dialog';

import { useFilterActionModal } from '../../hooks/use-filter-action-modal';
import { ThresholdForm } from './threshold-form';

export const ThresholdModal = () => {
  const { state, close } = useFilterActionModal();
  const threshold = state.kind === 'threshold' ? state : null;

  return (
    <Dialog
      open={!!threshold}
      onOpenChange={(open) => !open && close()}
    >
      {threshold && (
        <DialogContent>
          <DialogTitle>
            {threshold.mode === 'create' ? 'Create ' : 'Edit '} Threshold filter
            action
          </DialogTitle>
          <DialogDescription>
            Create a Threshold filter action to limit the number of events
            matching the filters in a given time period.
          </DialogDescription>
          <ThresholdForm
            edit={threshold.mode === 'edit'}
            filterAction={threshold.filterAction}
            onClose={close}
          />
        </DialogContent>
      )}
    </Dialog>
  );
};
