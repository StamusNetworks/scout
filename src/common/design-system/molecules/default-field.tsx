import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from '../atoms/ui/form';

export const DefaultField = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <FormItem className="grow">
    <FormLabel>{label}</FormLabel>
    <FormControl>{children}</FormControl>
    <FormMessage />
  </FormItem>
);
