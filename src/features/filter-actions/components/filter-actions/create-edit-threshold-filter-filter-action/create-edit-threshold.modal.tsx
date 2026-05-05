import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/common/design-system/atoms/ui/dialog';

import { useFilterActionModal } from '../../../hooks/use-filter-action-modal';
import { CreateEditThresholdFilterActionForm } from './create-edit-threshold.form';

export const CreateEditThresholdModal = () => {
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
          <CreateEditThresholdFilterActionForm
            edit={threshold.mode === 'edit'}
            filterAction={threshold.filterAction}
            onClose={close}
          />
        </DialogContent>
      )}
    </Dialog>
  );
};
