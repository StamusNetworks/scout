import {
  AlertDialog as AlertDialogPrimitive,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../atoms/ui/alert-dialog';

interface AlertDialogProps {
  title?: string;
  description?: string;
  onCancel?: () => void;
  onConfirm: () => void;
  trigger: React.ReactNode;
}
export function AlertDialog({
  title,
  description,
  onCancel,
  onConfirm,
  trigger,
}: AlertDialogProps) {
  return (
    <AlertDialogPrimitive>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {title || 'Are you absolutely sure ?'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {description || 'This action cannot be undone.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialogPrimitive>
  );
}
