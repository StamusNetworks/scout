import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/common/design-system/atoms/ui/dialog';
import {
  type Modal as TModal,
  selectIsModalOpen,
  setOpenModal,
} from '@/features/ui/ui-state.slice';
import { useAppDispatch, useAppSelector } from '@/store/store';

interface ModalProps {
  title: string;
  modal: TModal;
  children: React.ReactNode;
  description?: string;
  className?: string;
}

export const Modal = ({
  title,
  modal,
  children,
  description,
  className,
}: ModalProps) => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(selectIsModalOpen(modal));

  const handleOpenChange = (open: boolean) =>
    open ? dispatch(setOpenModal(modal)) : dispatch(setOpenModal(null));

  return (
    <Dialog
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      <DialogContent
        className={className}
        aria-describedby={description || undefined}
      >
        <DialogTitle>{title}</DialogTitle>
        {description && <DialogDescription>{description}</DialogDescription>}
        {children}
      </DialogContent>
    </Dialog>
  );
};
