import { zodResolver } from '@hookform/resolvers/zod';
import { toPairs } from 'ramda';
import { ControllerRenderProps, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Column } from '@/common/design-system/atoms/layout/column';
import { Grid } from '@/common/design-system/atoms/layout/grid';
import { Row } from '@/common/design-system/atoms/layout/row';
import { Button } from '@/common/design-system/atoms/ui/button';
import { Checkbox } from '@/common/design-system/atoms/ui/checkbox';
import { Divider } from '@/common/design-system/atoms/ui/divider';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/common/design-system/atoms/ui/select';
import { Spin } from '@/common/design-system/atoms/ui/spin';
import { Textarea } from '@/common/design-system/atoms/ui/textarea';
import { useFeatureFlags } from '@/common/lib/use-feature-flags';
import { FilterInput } from '@/features/query-filters/components/edit-qfilter-modal/filter-input';
import { type FilterFlags } from '@/features/query-filters/model/filter-flags';
import { QueryFilterState } from '@/features/query-filters/model/query-filter';

import { useCreateFilterSetMutation } from '../../api/filter-sets.api';
import { filterSetPageConfig } from '../../definitions/filter-sets.constants';

const formSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  page: z.string(),
  share: z.boolean().optional(),
  tags: z
    .object({
      alert: z.boolean(),
      discovery: z.boolean(),
      stamus: z.boolean(),
      informational: z.boolean(),
      relevant: z.boolean(),
      untagged: z.boolean(),
    })
    .optional(),
  filters: z.array(
    z.object({
      key: z.string(),
      value: z.string().or(z.number()),
      is_negated: z.boolean(),
      is_wildcarded: z.boolean(),
      enabled: z.boolean(),
    }),
  ),
});

const getDefaultValues = (
  filters: QueryFilterState[],
  flags?: FilterFlags,
) => ({
  name: '',
  page: 'DASHBOARDS',
  share: true,
  description: '',
  tags: {
    alert: flags?.eventTypes.alert ?? false,
    stamus: flags?.eventTypes.stamus ?? false,
    discovery: flags?.eventTypes.discovery ?? false,
    informational: flags?.alertTags.informational ?? false,
    relevant: flags?.alertTags.relevant ?? false,
    untagged: flags?.alertTags.untagged ?? false,
  },
  filters: filters.map((item) => ({
    ...item,
    enabled: !item.is_suspended,
  })),
});

interface DefaultInputProps extends ControllerRenderProps {
  label: string;
  placeholder: string;
}

const DefaultInput = ({ label, placeholder, ...props }: DefaultInputProps) => {
  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <Input
          placeholder={placeholder}
          {...props}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
};

interface SaveFilterSetFormProps {
  filters: QueryFilterState[];
  flags?: FilterFlags;
  onClose?: () => void;
}
export const SaveFilterSetForm = ({
  filters,
  flags,
  onClose,
}: SaveFilterSetFormProps) => {
  const { enterprise } = useFeatureFlags();
  const initialValues = getDefaultValues(filters, flags);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
  });
  const [createFilterSet, { isLoading }] = useCreateFilterSetMutation();

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    createFilterSet({
      name: data.name,
      page: data.page,
      description: data.description,
      share: enterprise ? (data.share ? 'global' : 'private') : undefined,
      tags: data.tags,
      filters: data.filters.map((item) => ({
        key: item.key,
        value: item.value,
        is_negated: item.is_negated,
        is_wildcarded: item.is_wildcarded,
      })),
    })
      .unwrap()
      .then(() => {
        onClose?.();
        toast.success('Filter Set has been created');
      })
      .catch((error) => {
        toast.error('Filter Set could not be created', {
          description: error.data.details,
        });
      });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4"
      >
        <Column className="gap-4">
          {flags && (
            <Grid className="grid-cols-3 gap-2">
              <FormField
                name="tags.alert"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-2 text-sm">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <span>Alerts</span>
                  </FormItem>
                )}
              />
              <FormField
                name="tags.stamus"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-2 text-sm">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <span>Stamus</span>
                  </FormItem>
                )}
              />
              <FormField
                name="tags.discovery"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-2 text-sm">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <span>Sightings</span>
                  </FormItem>
                )}
              />
              <FormField
                name="tags.informational"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-2 text-sm">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <span>Informational</span>
                  </FormItem>
                )}
              />
              <FormField
                name="tags.relevant"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-2 text-sm">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <span>Relevant</span>
                  </FormItem>
                )}
              />
              <FormField
                name="tags.untagged"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-2 text-sm">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <span>Untagged</span>
                  </FormItem>
                )}
              />
            </Grid>
          )}
          <Column className="gap-2">
            {initialValues.filters.map((f, i) => (
              <FormField
                key={f.id + i}
                control={form.control}
                name="filters"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormControl>
                        <FilterInput
                          initialValue={f}
                          onValueChange={(item) =>
                            field.onChange([
                              ...field.value.slice(0, i),
                              item,
                              ...field.value.slice(i + 1),
                            ])
                          }
                          edit={true}
                        />
                      </FormControl>
                    </FormItem>
                  );
                }}
              />
            ))}
          </Column>
        </Column>
        <Divider />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <DefaultInput
              label="Name"
              placeholder="Filter Set name"
              {...field}
            />
          )}
        />
        <FormField
          control={form.control}
          name="page"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Page</FormLabel>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {toPairs(filterSetPageConfig).map(([key, value]) => {
                      const Icon = value.icon;
                      return (
                        <SelectItem
                          key={key}
                          value={key}
                        >
                          <Icon className="mr-1 inline -translate-y-px" />
                          {value.label}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {enterprise && (
          <FormField
            control={form.control}
            name="share"
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
                  <FormMessage />
                  <FormLabel>Shared</FormLabel>
                  <FormDescription>
                    Enabled: Create Filter Set for all users (shared)
                    <br />
                    Disabled: Create Filter Set only for you (personal)
                  </FormDescription>
                </Column>
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Optional description..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Row className="mt-4 justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!form.formState.isValid || isLoading}
          >
            {form.formState.isSubmitting ? <Spin /> : 'Submit'}
          </Button>
        </Row>
      </form>
    </Form>
  );
};
