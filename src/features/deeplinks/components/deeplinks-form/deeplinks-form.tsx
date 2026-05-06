import { zodResolver } from '@hookform/resolvers/zod';
import { isNil } from 'ramda';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Column } from '@/common/design-system/atoms/layout/column';
import { Row } from '@/common/design-system/atoms/layout/row';
import { Button } from '@/common/design-system/atoms/ui/button';
import { Checkbox } from '@/common/design-system/atoms/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/common/design-system/atoms/ui/form';
import { Input } from '@/common/design-system/atoms/ui/input';
import { MultiSelect } from '@/common/design-system/atoms/ui/multi-select';
import { FilterType } from '@/features/query-filters/definitions/query-filter.config';

import {
  useCreateDeepLinkMutation,
  useUpdateDeepLinkMutation,
} from '../../api/deeplinks.api';
import {
  CreateDeeplink,
  Deeplink,
  deeplinkCreateSchema,
} from '../../model/deep-link';

const getInitialValues = (deepLink?: Deeplink): CreateDeeplink => ({
  name: deepLink?.name ?? '',
  template: deepLink?.template ?? '',
  entities: deepLink?.entities ?? [],
  all: deepLink?.all ?? false,
});

export const DeeplinksForm = ({
  handleClose,
  deepLink,
}: {
  handleClose: () => void;
  deepLink?: Deeplink;
}) => {
  const isCreate = isNil(deepLink?.id);

  const form = useForm<CreateDeeplink>({
    resolver: zodResolver(deeplinkCreateSchema),
    defaultValues: getInitialValues(deepLink),
  });

  const [createDeepLink] = useCreateDeepLinkMutation();
  const [updateDeepLink] = useUpdateDeepLinkMutation();

  const handleSubmit = (data: CreateDeeplink) => {
    const submitFn = isCreate
      ? () => createDeepLink(data)
      : () => updateDeepLink({ ...data, id: deepLink.id });
    submitFn()
      .unwrap()
      .then((payload) => {
        toast.info('Deeplink created successfully', {
          description: payload.name,
        });
        handleClose();
      })
      .catch((error) => {
        toast.error('Error creating deeplink', {
          description: error.message,
        });
      });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Google"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="template"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Template</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://google.com/search?q={{ value }}"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="all"
          render={({ field }) => (
            <FormItem className="flex space-x-2">
              <FormControl>
                <Checkbox
                  checked={!!field.value}
                  onCheckedChange={field.onChange}
                  className="mt-1"
                />
              </FormControl>
              <Column>
                <FormLabel>All filter types</FormLabel>
                <FormDescription>
                  By ticking this box, this deeplink will be available for all
                  entities in the right click menu.
                </FormDescription>
                <FormMessage />
              </Column>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="entities"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Filter types</FormLabel>
              <FormControl>
                <MultiSelect
                  options={Object.values(FilterType)
                    .toSorted()
                    .map((value) => ({
                      label: value,
                      value,
                    }))}
                  onValueChange={field.onChange}
                  {...field}
                  defaultValue={form.getValues('entities')}
                  disabled={form.getValues('all')}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Row className="justify-end">
          <Button type="submit">Submit</Button>
        </Row>
      </form>
    </Form>
  );
};
