import { CircleCheck, Ellipsis, Undo2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/common/design-system/atoms/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/common/design-system/atoms/ui/dropdown-menu';

import { useUpdateEntityStatusMutation } from '../../../api/entities.api';

export const ImpactedEntitiesTableActions = ({
  threatId,
  threatStatus,
  entityId,
  entityStatus,
}: {
  entityId: number;
  entityStatus: 'new' | 'fixed';
  threatId?: number;
  threatStatus?: 'new' | 'fixed';
}) => {
  const [updateEntityStatus] = useUpdateEntityStatusMutation();

  const handleUpdatEntityStatus = () => {
    toast.info('Updating entity status...');
    updateEntityStatus({
      pk: entityId,
      status: entityStatus === 'new' ? 'fixed' : 'new',
    })
      .unwrap()
      .then(() => toast.success('Entity status updated'))
      .catch((e) =>
        toast.error('Failed to update entity status', {
          description: e.data.detail,
        }),
      );
  };
  const handleUpdateThreatStatus = () => {
    toast.info('Updating threat status...');
    updateEntityStatus({
      pk: entityId,
      status: threatStatus === 'new' ? 'fixed' : 'new',
      threatId,
    })
      .unwrap()
      .then(() => toast.success('Threat status updated'))
      .catch((e) =>
        toast.error('Failed to update threat status', {
          description: e.data.detail,
        }),
      );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="h-5 w-5"
          size="icon"
        >
          <Ellipsis />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
        {threatId && (
          <DropdownMenuItem onClick={handleUpdateThreatStatus}>
            <span className="mr-2">
              {threatStatus === 'new' ? <CircleCheck /> : <Undo2 />}
            </span>
            {threatStatus === 'new' ? 'Acknowledge' : 'Revert'} current threat
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={handleUpdatEntityStatus}>
          <span className="mr-2">
            {entityStatus === 'new' ? <CircleCheck /> : <Undo2 />}
          </span>
          {entityStatus === 'new' ? 'Acknowledge' : 'Revert'} all threats
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
