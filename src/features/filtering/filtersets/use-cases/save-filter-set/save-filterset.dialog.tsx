import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/common/design-system/atoms/ui/dialog';
import {
  selectGatedFilterFlags,
  selectQueryFilters,
} from '@/features/filtering/filters/query-filters/query-filters.selectors';
import { useAppDispatch, useAppSelector } from '@/store/store';

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
  const flags = useAppSelector(selectGatedFilterFlags);

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
          flags={flags ?? undefined}
          filters={mode === 'create' ? appFilters : filters!}
        />
      </DialogContent>
    </Dialog>
  );
};
