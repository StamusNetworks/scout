import { toast } from 'sonner';

import { Row } from '@/common/design-system/atoms/layout/row';
import { Button } from '@/common/design-system/atoms/ui/button';
import { Spin } from '@/common/design-system/atoms/ui/spin';

import { useDeleteFilterActionMutation } from '../../api/filter-actions.api';
import { FilterAction } from '../../model/filter-action.schema';

export const DeleteFilterActionForm = ({
  filterAction,
  handleClose,
}: {
  filterAction: FilterAction;
  handleClose: () => void;
}) => {
  const [deleteFilterAction, { isLoading }] = useDeleteFilterActionMutation();
  const handleDelete = () => {
    deleteFilterAction(filterAction.pk)
      .unwrap()
      .then(() => {
        toast.success('Filter action deleted successfully');
        handleClose();
      })
      .catch((error) =>
        toast.error('Failed to delete filter action', {
          description: error.data.detail,
        }),
      );
  };

  return (
    <Row className="justify-end gap-2">
      <Button
        type="button"
        variant="secondary"
        onClick={handleClose}
      >
        Cancel
      </Button>
      <Button
        type="button"
        disabled={isLoading}
        onClick={handleDelete}
        variant="destructive"
      >
        Delete {isLoading && <Spin />}
      </Button>
    </Row>
  );
};
