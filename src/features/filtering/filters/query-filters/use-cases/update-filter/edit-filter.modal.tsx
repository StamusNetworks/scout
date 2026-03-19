import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/common/design-system/atoms/ui/dialog';

import { QueryFilterState } from '../../query-filter.model';
import { EditFilterForm } from './edit-qfilter-form';

export const EditFilterModal = ({
  isOpen,
  onClose,
  filter,
}: {
  isOpen: boolean;
  onClose: () => void;
  filter: QueryFilterState;
}) => (
  <Dialog
    open={isOpen}
    onOpenChange={onClose}
  >
    <DialogContent>
      <DialogTitle>Edit Filter</DialogTitle>
      <EditFilterForm
        filter={filter}
        onClose={onClose}
      />
    </DialogContent>
  </Dialog>
);
