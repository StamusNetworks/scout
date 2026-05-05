import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/common/design-system/atoms/ui/select';
import { Spin } from '@/common/design-system/atoms/ui/spin';
import { useGetRuleSetsQuery } from '@/features/detection-methods/api/rules.api';
import { FilterInput } from '@/features/query-filters/components/edit-qfilter-modal/filter-input';

import {
  useCreateFilterActionMutation,
  useUpdateFilterActionMutation,
} from '../../api/filter-actions.api';
import { useFilterActionFormValues } from '../../hooks/use-filter-action-form-values';
import {
  FilterActionPayload,
  TagAndKeepFilterAction,
  TagFilterAction,
} from '../../model/filter-action';
import { baseFilterActionFormSchema } from '../../model/filter-action-form';

const formSchema = baseFilterActionFormSchema.extend({
  tag: z.enum(['relevant', 'informational']),
});

export type TagFormValues = z.infer<typeof formSchema>;

const useInitialTagValues = (
  keep?: boolean,
  filterAction?: TagFilterAction | TagAndKeepFilterAction,
): TagFormValues => {
  const initialValues = useFilterActionFormValues(
    keep ? 'tagAndKeep' : 'tag',
    filterAction,
  );
  return {
    ...initialValues,
    tag: filterAction?.options.tag ?? 'relevant',
  };
};

interface TagFormProps {
  edit: boolean;
  filterAction?: TagFilterAction | TagAndKeepFilterAction | undefined;
  keep?: boolean;
  onClose?: () => void;
}
export const TagForm = ({
  edit,
  filterAction,
  keep,
  onClose,
}: TagFormProps) => {
  const navigate = useNavigate();
  const initialValues = useInitialTagValues(keep, filterAction);
  const { data: rulesetsList } = useGetRuleSetsQuery();

  const form = useForm<TagFormValues>({
    defaultValues: initialValues,
    resolver: zodResolver(formSchema),
    mode: 'onChange',
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: 'filters',
  });
  useEffect(() => {
    form.setValue('filters', initialValues?.filters ?? []);
  }, [form, initialValues?.filters]);

  const [createFilterAction] = useCreateFilterActionMutation();
  const [updateFilterAction] = useUpdateFilterActionMutation();

  const handleSubmit = (data: TagFormValues): void => {
    const payload: FilterActionPayload = {
      kind: keep ? 'tagAndKeep' : 'tag',
      comment: data.comment || '',
      filterDefs: data.filters
        .filter((f) => f.enabled)
        .map((f) => ({
          key: f.key,
          value: f.value,
          isNegated: f.isNegated,
          isWildcarded: f.isWildcarded,
        })),
      rulesets: data.rulesets,
      options: {
        tag: data.tag,
      },
    };
    const submitFn =
      edit && filterAction
        ? () => updateFilterAction({ id: filterAction.id, ...payload })
        : () => createFilterAction(payload);
    submitFn()
      .unwrap()
      .then(() => {
        onClose?.();
        navigate({
          to: '/filters-actions',
          search: { page: 1, page_size: 10 },
        });
        toast.success(
          `Filter action ${edit ? 'updated' : 'created'} successfully`,
        );
      })
      .catch((error) =>
        toast.error(`Failed to ${edit ? 'update' : 'create'} filter action`, {
          description: error.data.detail,
        }),
      );
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="filters"
          render={() => (
            <FormItem>
              <FormLabel>Filters</FormLabel>
              <Column className="gap-3">
                {fields.map((field, index) => (
                  <FormField
                    key={field.id}
                    control={form.control}
                    name={`filters.${index}`}
                    render={({ field: formField }) => {
                      return (
                        <FormItem>
                          <FormControl>
                            <FilterInput
                              initialValue={formField.value}
                              edit={edit}
                              onValueChange={(item) => formField.onChange(item)}
                            />
                          </FormControl>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </Column>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tag"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{keep ? 'Tag and keep' : 'Tag'}</FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tag" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="informational">Informational</SelectItem>
                  <SelectItem value="relevant">Relevant</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="rulesets"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel>Rulesets</FormLabel>
                <FormDescription>
                  Select the rulesets on which to apply the filter action.
                </FormDescription>
              </div>
              {rulesetsList?.map((item) => (
                <FormField
                  key={item.id}
                  control={form.control}
                  name="rulesets"
                  render={({ field }) => {
                    return (
                      <FormItem
                        key={item.id}
                        className="flex flex-row items-start space-y-0 space-x-3"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(item.id)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...field.value, item.id])
                                : field.onChange(
                                    field.value?.filter(
                                      (value) => value !== item.id,
                                    ),
                                  );
                            }}
                          />
                        </FormControl>
                        <FormLabel>{item.name}</FormLabel>
                      </FormItem>
                    );
                  }}
                />
              ))}
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
            disabled={!form.formState.isValid}
          >
            {form.formState.isSubmitting ? <Spin /> : 'Submit'}
          </Button>
        </Row>
      </form>
    </Form>
  );
};
