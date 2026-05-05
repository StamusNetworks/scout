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
import { Input } from '@/common/design-system/atoms/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/common/design-system/atoms/ui/select';
import { Spin } from '@/common/design-system/atoms/ui/spin';
import { DefaultField } from '@/common/design-system/molecules/default-field';
import { useGetRulesetsQuery } from '@/features/detection-methods/rulesets.api';
import { FilterInput } from '@/features/query-filters/use-cases/update-filter/filter-input';

import {
  useCreateFilterActionMutation,
  useUpdateFilterActionMutation,
} from '../../../api/filter-actions.api';
import {
  FilterActionPayload,
  ThresholdFilterAction,
} from '../../../model/filter-action.schema';
import { baseFilterActionSchema } from '../filter-actions.baseSchema';
import { toFilterDefDto } from '../to-dto';
import { useInitialValues } from '../use-initial-values';

const formSchema = baseFilterActionSchema.extend({
  count: z.number().min(1, 'Count must be a positive number'),
  seconds: z.number().min(1, 'Seconds must be a positive number'),
  track: z.enum(['by_src', 'by_dst']),
});

export type ThresholdFilterActionFormValues = z.infer<typeof formSchema>;

const useThresholdInitialValues = (
  filterAction?: ThresholdFilterAction,
): ThresholdFilterActionFormValues => {
  const initialValues = useInitialValues('threshold', filterAction);
  return {
    ...initialValues,
    count: filterAction?.options.count ?? 1,
    seconds: filterAction?.options.seconds ?? 60,
    track: filterAction?.options.track ?? 'by_src',
  };
};

interface CreateEditThresholdFilterActionFormProps {
  edit: boolean;
  filterAction?: ThresholdFilterAction | undefined;
  onClose?: () => void;
}
export const CreateEditThresholdFilterActionForm = ({
  edit,
  filterAction,
  onClose,
}: CreateEditThresholdFilterActionFormProps) => {
  const navigate = useNavigate();
  const initialValues = useThresholdInitialValues(filterAction);
  const { data: rulesetsList } = useGetRulesetsQuery();

  const form = useForm<ThresholdFilterActionFormValues>({
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

  const handleSubmit = (data: ThresholdFilterActionFormValues): void => {
    const response: FilterActionPayload = {
      action: 'threshold',
      comment: data.comment || '',
      filter_defs: data.filters.filter((f) => f.enabled).map(toFilterDefDto),
      rulesets: data.rulesets,
      options: {
        type: 'both',
        count: data.count,
        seconds: data.seconds,
        track: data.track,
      },
    };
    const submitFn =
      edit && filterAction
        ? () => updateFilterAction({ ...response, pk: filterAction.pk })
        : () => createFilterAction(response);
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
        <Row className="gap-2">
          <FormField
            control={form.control}
            name="count"
            render={({ field }) => (
              <DefaultField label="Count">
                <Input
                  {...field}
                  type="number"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                />
              </DefaultField>
            )}
          />
          <FormField
            control={form.control}
            name="seconds"
            render={({ field }) => (
              <DefaultField label="Seconds">
                <Input
                  {...field}
                  type="number"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                />
              </DefaultField>
            )}
          />
        </Row>
        <FormField
          control={form.control}
          name="track"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Track by</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Track by" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="by_src">Source</SelectItem>
                  <SelectItem value="by_dst">Destination</SelectItem>
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
                  key={item.pk}
                  control={form.control}
                  name="rulesets"
                  render={({ field }) => {
                    return (
                      <FormItem
                        key={item.pk}
                        className="flex flex-row items-center space-y-0 space-x-3"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(item.pk)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...field.value, item.pk])
                                : field.onChange(
                                    field.value?.filter(
                                      (value) => value !== item.pk,
                                    ),
                                  );
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {item.name}
                        </FormLabel>
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
