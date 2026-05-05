import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Row } from '@/common/design-system/atoms/layout/row';
import { Button } from '@/common/design-system/atoms/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/common/design-system/atoms/ui/form';
import { Input } from '@/common/design-system/atoms/ui/input';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/common/design-system/atoms/ui/radio-group';
import { Spin } from '@/common/design-system/atoms/ui/spin';
import { Textarea } from '@/common/design-system/atoms/ui/textarea';

import { useUpdateFilterActionPositionMutation } from '../../api/filter-actions.api';
import { FilterAction } from '../../model/filter-action';

const getFormSchema = (max: number) =>
  z
    .object({
      comment: z.string().optional(),
    })
    .and(
      z.discriminatedUnion('action', [
        z.object({
          action: z.literal('top'),
          index: z.number().optional(),
        }),
        z.object({
          action: z.literal('bottom'),
          index: z.number().optional(),
        }),
        z.object({
          action: z.literal('move'),
          index: z.number().min(0).max(max),
        }),
      ]),
    );

export const MoveFilterActionForm = ({
  filterAction,
  lastIndex,
  handleClose,
}: {
  filterAction: FilterAction;
  lastIndex: number;
  handleClose: () => void;
}) => {
  const schema = getFormSchema(lastIndex);
  const form = useForm<z.infer<typeof schema>>({
    defaultValues: {
      action: 'move',
      index: filterAction.index,
      comment: '',
    },
    resolver: zodResolver(schema),
    mode: 'onChange',
  });

  const action = form.watch('action');
  useEffect(() => {
    if (action !== 'move') {
      form.clearErrors();
    } else {
      form.trigger();
    }
  }, [form, action]);

  const [updateFilterActionPosition] = useUpdateFilterActionPositionMutation();
  const handleSubmit = (data: z.infer<typeof schema>) => {
    const body = {
      id: filterAction.id,
      comment: data.comment || '',
      index:
        data.action === 'top'
          ? 0
          : data.action === 'bottom'
            ? lastIndex
            : data.index,
    };
    updateFilterActionPosition(body)
      .unwrap()
      .then(() => {
        toast.success('Filter action moved successfully');
        handleClose();
      })
      .catch((error) =>
        toast.error('Failed to move filter action', {
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
          name="action"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-y-0 space-x-2">
                    <FormControl>
                      <RadioGroupItem value="top" />
                    </FormControl>
                    <FormLabel className="font-normal">Send to top</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-y-0 space-x-2">
                    <FormControl>
                      <RadioGroupItem value="move" />
                    </FormControl>
                    <FormLabel className="pr-2 font-normal text-nowrap">
                      Move at index
                    </FormLabel>
                    <FormField
                      name="index"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              value={field.value}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value))
                              }
                              type="number"
                              min={0}
                              max={lastIndex}
                              className="w-24"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </FormItem>
                  <FormItem className="flex items-center space-y-0 space-x-2">
                    <FormControl>
                      <RadioGroupItem value="bottom" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Send to bottom
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comment</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <Row className="justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
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
