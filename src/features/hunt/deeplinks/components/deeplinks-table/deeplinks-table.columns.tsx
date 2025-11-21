import { Edit, Trash } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Row } from '@/common/design-system/atoms/layout/row';
import { Button } from '@/common/design-system/atoms/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/common/design-system/atoms/ui/dialog';
import { Switch } from '@/common/design-system/atoms/ui/switch';
import { DataTableColumnHeader } from '@/common/design-system/molecules/data-table/data-table.columnHeader';
import { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';

import {
  useDeleteDeepLinkMutation,
  useUpdateDeepLinkMutation,
} from '../../api/deeplinks.api';
import { Deeplink } from '../../model/deep-link.model';
import { DeeplinksForm } from '../deeplinks-form/deeplinks-form';

export const columns: CustomColumnDef<Deeplink>[] = [
  {
    id: 'enabled',
    header: () => null,
    cell: ({ row }) => <SwitchDeeplinkEnabled deeplink={row.original} />,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Name"
      />
    ),
    enableSorting: false,
  },
  {
    id: 'entities',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Filter types"
      />
    ),
    cell: ({ row }) =>
      row.original.all
        ? 'All'
        : row.original.entities.map((entity) => entity.name).join(', '),
  },
  {
    accessorKey: 'template',
    enableSorting: false,
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Template"
        className="w-0"
      />
    ),
  },
  {
    id: 'actions',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Actions"
      />
    ),
    cell: ({ row }) => <DeeplinkActions deeplink={row.original} />,
  },
];

const DeeplinkActions = ({ deeplink }: { deeplink: Deeplink }) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteDeepLink] = useDeleteDeepLinkMutation();

  const handleDelete = () => {
    deleteDeepLink({ pk: deeplink.pk })
      .unwrap()
      .then(() => {
        toast.info('Deeplink deleted successfully');
      })
      .catch((error) => {
        toast.error('Error deleting deeplink', {
          description: error.message,
        });
      });
  };

  if (!deeplink.user_defined) return null;

  return (
    <Row className="w-0 items-center">
      <Dialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      >
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="none"
            className="h-fit p-2"
            role="edit"
          >
            <Edit size={14} />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Edit deeplink</DialogTitle>
          <DialogDescription>Edit a deeplink.</DialogDescription>
          <DeeplinksForm
            handleClose={() => setEditDialogOpen(false)}
            deepLink={deeplink}
          />
        </DialogContent>
      </Dialog>
      <Dialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      >
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="none"
            className="h-fit p-2"
            role="delete"
          >
            <Trash size={14} />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Delete deeplink</DialogTitle>
          <DialogDescription>This action is irreversible.</DialogDescription>
          <Button
            variant="destructive"
            onClick={handleDelete}
          >
            Confirm delete
          </Button>
        </DialogContent>
      </Dialog>
    </Row>
  );
};

const SwitchDeeplinkEnabled = ({ deeplink }: { deeplink: Deeplink }) => {
  const [updateDeeplink] = useUpdateDeepLinkMutation();
  const handleSwitchEnabled = () => {
    updateDeeplink({ pk: deeplink.pk, enabled: !deeplink.enabled })
      .unwrap()
      .then(() => {
        toast.info(
          `Deeplink ${deeplink.enabled ? 'disabled' : 'enabled'} successfully`,
        );
      })
      .catch((error) => {
        toast.error(
          `Error ${deeplink.enabled ? 'disabling' : 'enabling'} deeplink`,
          {
            description: error.message,
          },
        );
      });
  };

  return (
    <Switch
      checked={deeplink.enabled}
      onCheckedChange={handleSwitchEnabled}
      size="sm"
    />
  );
};
