import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/common/design-system/atoms/ui/dialog';

import { useFilterActionModal } from '../../hooks/use-filter-action-modal';
import { SuppressForm } from './suppress-form';

export const SuppressModal = () => {
  const { state, close } = useFilterActionModal();
  const suppress = state.kind === 'suppress' ? state : null;

  return (
    <Dialog
      open={!!suppress}
      onOpenChange={(open) => !open && close()}
    >
      {suppress && (
        <DialogContent>
          <DialogTitle>
            {suppress.mode === 'create' ? 'Create ' : 'Edit '}Suppress filter
            action
          </DialogTitle>
          <DialogDescription>
            Create a Suppress filter action to suppress events matching the
            filters.
          </DialogDescription>
          <SuppressForm
            edit={suppress.mode === 'edit'}
            filterAction={suppress.filterAction}
            onClose={close}
          />
        </DialogContent>
      )}
    </Dialog>
  );
};
