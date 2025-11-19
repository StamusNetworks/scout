import { ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Column } from '../atoms/layout/column';
import { Row } from '../atoms/layout/row';
import { Button } from '../atoms/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '../atoms/ui/dialog';
import { Spin } from '../atoms/ui/spin';

interface DeleteModalProps {
  title: string;
  description: string;
  handleDelete: () => Promise<void>;
  handleSuccess?: () => void;
  trigger?: React.ReactNode;
}
export const DeleteModal = ({
  title,
  description,
  handleDelete,
  handleSuccess,
  trigger,
}: DeleteModalProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleSubmit = () => {
    setLoading(true);
    handleDelete()
      .then(() => {
        setLoading(false);
        handleSuccess?.();
      })
      .catch(() => {
        setLoading(false);
        toast.error('Failed to delete entity');
      });
  };
  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger asChild>
        {trigger ? trigger : <Button variant="outline">Delete</Button>}
      </DialogTrigger>
      <DialogContent>
        <Row className="gap-4">
          <div className="bg-destructive/10 flex size-8 shrink-0 items-center justify-center rounded-full">
            <ShieldAlert
              size={32}
              className="text-destructive"
            />
          </div>
          <Column>
            <DialogTitle className="mb-1">{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
            <Row className="mt-4 justify-end gap-2">
              <Button
                onClick={() => setOpen(false)}
                variant="ghost"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                variant="destructive"
                className="ml-2"
              >
                {loading ? (
                  <Row className="items-center gap-2">
                    <Spin className="h-4 w-4 animate-spin" />
                    Deleting
                  </Row>
                ) : (
                  'Delete'
                )}
              </Button>
            </Row>
          </Column>
        </Row>
      </DialogContent>
    </Dialog>
  );
};
