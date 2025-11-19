import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/common/design-system/atoms/ui/dialog';
import { useAppDispatch, useAppSelector } from '@/store/store';

import { selectQueryFilters } from '../../../query-filters/store/query-filters.selector';
import { selectTagFilters } from '../../../query-filters/store/query-filters.selector';
import { SaveFilterSetForm } from './save-filterset.form';
import {
  closeSaveFilterSetModal,
  openSaveFilterSetModal,
  selectSaveFilterSetModal,
} from './save-filterset.slice';

export const SaveFilterSetModal = () => {
  const dispatch = useAppDispatch();
  const { isOpen, mode, filters } = useAppSelector(selectSaveFilterSetModal);
  const appFilters = useAppSelector(selectQueryFilters).filter(
    (f) => !f.is_suspended,
  );
  const globalFilters = useAppSelector(selectTagFilters);

  const handleOpenChange = (open: boolean) =>
    open
      ? dispatch(openSaveFilterSetModal())
      : dispatch(closeSaveFilterSetModal());
  const handleClose = () => dispatch(closeSaveFilterSetModal());

  return (
    <Dialog
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      <DialogContent aria-describedby={undefined}>
        <DialogTitle>Save Filter Set</DialogTitle>
        <SaveFilterSetForm
          onClose={handleClose}
          tags={globalFilters}
          filters={mode === 'create' ? appFilters : filters!}
        />
      </DialogContent>
    </Dialog>
  );
};
