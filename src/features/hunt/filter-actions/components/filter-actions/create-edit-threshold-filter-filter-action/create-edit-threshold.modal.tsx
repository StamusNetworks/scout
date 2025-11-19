import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/common/design-system/atoms/ui/dialog';
import { useAppDispatch, useAppSelector } from '@/store/store';

import { CreateEditThresholdFilterActionForm } from './create-edit-threshold.form';
import {
  closeThresholdModal,
  selectThresholdModal,
} from './create-edit-threshold.slice';

export const CreateEditThresholdModal = () => {
  const dispatch = useAppDispatch();
  const { isOpen, mode, filterAction } = useAppSelector(selectThresholdModal);

  const handleOpenChange = (open: boolean) =>
    !open && dispatch(closeThresholdModal());
  const handleClose = () => dispatch(closeThresholdModal());
  return (
    <Dialog
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      <DialogContent>
        <DialogTitle>
          {mode === 'create' ? 'Create ' : 'Edit '} Threshold filter action
        </DialogTitle>
        <DialogDescription>
          Create a Threshold filter action to limit the number of events
          matching the filters in a given time period.
        </DialogDescription>
        <CreateEditThresholdFilterActionForm
          edit={mode === 'edit'}
          filterAction={filterAction}
          onClose={handleClose}
        />
      </DialogContent>
    </Dialog>
  );
};
