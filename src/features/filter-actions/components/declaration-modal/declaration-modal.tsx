import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/common/design-system/atoms/ui/dialog';

import { useFilterActionModal } from '../../hooks/use-filter-action-modal';
import { DeclarationForm } from './declaration-form';

export const DeclarationModal = () => {
  const { state, close } = useFilterActionModal();
  const declaration = state.kind === 'declaration' ? state : null;

  return (
    <Dialog
      open={!!declaration}
      onOpenChange={(open) => !open && close()}
    >
      {declaration && (
        <DialogContent
          className="max-w-2xl"
          aria-describedby={undefined}
        >
          <DialogTitle>
            {declaration.mode === 'create'
              ? 'Create declaration'
              : 'Edit declaration'}
          </DialogTitle>
          <DeclarationForm
            edit={declaration.mode === 'edit'}
            filterAction={declaration.filterAction}
            onClose={close}
          />
        </DialogContent>
      )}
    </Dialog>
  );
};
