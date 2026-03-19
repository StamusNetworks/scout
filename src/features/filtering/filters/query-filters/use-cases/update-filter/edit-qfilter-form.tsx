import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Column } from '@/common/design-system/atoms/layout/column';
import { Row } from '@/common/design-system/atoms/layout/row';
import { Button } from '@/common/design-system/atoms/ui/button';
import { Checkbox } from '@/common/design-system/atoms/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  // FormDescription,
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
import { LuceneEditor } from '@/common/design-system/molecules/lucene-editor';
import { useAppDispatch } from '@/store/store';

import { FilterInputType } from '../../constants/query-filter.config';
import {
  isNegatable,
  isWildcardable,
} from '../../constants/query-filter.definition';
import { useQueryFilterDefinition } from '../../hooks/use-filters-definitions';
import { QueryFilterState } from '../../query-filter.model';
import { updateQueryFilter } from '../../query-filters.store';

const formSchema = z
  .object({
    id: z.string(),
    key: z.string(),
    is_suspended: z.boolean(),
    is_negated: z.boolean(),
    is_wildcarded: z.boolean(),
  })
  .and(
    z.discriminatedUnion('is_wildcarded', [
      z.object({
        is_wildcarded: z.literal(true),
        value: z.string().refine((val) => !/\s/.test(val), {
          message: 'Spaces are not allowed when wildcard is enabled',
        }),
      }),
      z.object({
        is_wildcarded: z.literal(false),
        value: z.string().or(z.number()),
      }),
    ]),
  );

const getDefaultValues = (filter?: QueryFilterState) => ({
  id: filter?.id ?? '',
  key: filter?.key ?? '',
  value: filter?.value ?? '',
  is_suspended: filter?.is_suspended ?? false,
  is_negated: filter?.is_negated ?? false,
  is_wildcarded: filter?.is_wildcarded ?? false,
});

export const EditFilterForm = ({
  filter,
  onClose,
}: {
  filter: QueryFilterState;
  onClose?: () => void;
}) => {
  const dispatch = useAppDispatch();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues(filter) as z.infer<typeof formSchema>,
    mode: 'onChange',
  });

  const config = useQueryFilterDefinition(form.watch('key'));
  const negatable = isNegatable(config?.key ?? '');
  const wildcardable = isWildcardable(config?.type ?? '');

  const isWildcarded = form.watch('is_wildcarded');
  useEffect(() => {
    form.trigger('value');
  }, [isWildcarded, form]);

  const handleSubmit = (data: z.infer<typeof formSchema>): void => {
    dispatch(
      updateQueryFilter({
        ...data,
        is_negated: negatable ? data.is_negated : false,
      }),
    );
    onClose?.();
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="key"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Filter</FormLabel>
              <FormControl>
                <Input
                  placeholder="Google"
                  {...field}
                  disabled
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Row>
          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Value</FormLabel>
                <FormControl>
                  {filter.key === 'es_filter' ? (
                    <LuceneEditor
                      value={String(field.value)}
                      onChange={field.onChange}
                      placeholder="e.g. alert.severity:1 AND src_ip:192.168.*"
                      autoFocus
                    />
                  ) : config?.inputType === FilterInputType.NUMBER ? (
                    <Input
                      placeholder="Enter a number"
                      {...field}
                      type="number"
                    />
                  ) : config?.inputType === FilterInputType.SELECT ? (
                    <Select
                      value={field.value as string}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {'options' in config &&
                          config.options?.map(({ label, value }) => (
                            <SelectItem
                              key={value}
                              value={value}
                            >
                              {label}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      placeholder="Enter a value"
                      {...field}
                    />
                  )}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Row>
        <FormField
          control={form.control}
          name="is_negated"
          disabled={!negatable}
          render={({ field }) => (
            <FormItem className="flex space-x-2">
              <FormControl>
                <Checkbox
                  checked={!!field.value}
                  onCheckedChange={field.onChange}
                  className="mt-1"
                  disabled={field.disabled}
                />
              </FormControl>
              <Column>
                <FormMessage />
                <FormLabel>Negate</FormLabel>
                <FormDescription>Negate the filter</FormDescription>
              </Column>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_wildcarded"
          disabled={!wildcardable}
          render={({ field }) => (
            <FormItem className="flex space-x-2">
              <FormControl>
                <Checkbox
                  checked={!!field.value}
                  onCheckedChange={field.onChange}
                  className="mt-1"
                  disabled={field.disabled}
                />
              </FormControl>
              <Column>
                <FormMessage />
                <FormLabel>Wildcard</FormLabel>
                <FormDescription>
                  Enables * and ? symbols to wildcard the string. Without
                  symbols, the string will be treated as a word match.
                </FormDescription>
              </Column>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_suspended"
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
                <FormLabel>Suspend</FormLabel>
                <FormDescription>
                  Suspended filters are not applied to the queries but still
                  displayed in the UI
                </FormDescription>
              </Column>
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
