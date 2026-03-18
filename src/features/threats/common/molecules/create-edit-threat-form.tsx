import { zodResolver } from '@hookform/resolvers/zod';
import { isNil } from 'ramda';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Column } from '@/common/design-system/atoms/layout/column';
import { Row } from '@/common/design-system/atoms/layout/row';
import { Button } from '@/common/design-system/atoms/ui/button';
import { Checkbox } from '@/common/design-system/atoms/ui/checkbox';
import { DialogClose } from '@/common/design-system/atoms/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/common/design-system/atoms/ui/form';
import { Input } from '@/common/design-system/atoms/ui/input';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/common/design-system/atoms/ui/radio-group';
import { Spin } from '@/common/design-system/atoms/ui/spin';
import { Textarea } from '@/common/design-system/atoms/ui/textarea';
import { DefaultField } from '@/common/design-system/molecules/default-field';
import { selectTenantsList } from '@/features/user/tenancy/tenancy.selector';
import { useAppSelector } from '@/store/store';

import { Threat, threatPayload } from '../threat.model';
import {
  useCreateThreatMutation,
  useUpdateThreatMutation,
} from '../threats.api';

const formSchema = threatPayload;

const getInitialValues = (threat: Threat | undefined, isDoc?: boolean) => ({
  family_class: (threat?.family_class || isNil(isDoc)
    ? 'doc'
    : isDoc
      ? 'doc'
      : 'dopv') as 'doc' | 'dopv',
  name: threat?.name || '',
  description: threat?.description || '',
  additional_info: threat?.additional_info || '',
  no_tenant: threat?.no_tenant || true,
  all_tenants: threat?.all_tenants || true,
  tenants: threat?.tenants || [],
});

interface CreateEditThreatFormProps {
  isDoc?: boolean;
  handleClose: (threat: string) => void;
  threat?: Threat;
}

export const CreateEditThreatForm = ({
  isDoc,
  handleClose,
  threat,
}: CreateEditThreatFormProps) => {
  const isEditing = !!threat;
  const [createThreat] = useCreateThreatMutation();
  const [updateThreat] = useUpdateThreatMutation();

  const defaultValues = getInitialValues(threat, isDoc);

  const form = useForm({
    defaultValues,
    resolver: zodResolver(formSchema),
  });

  const all_tenants = form.watch('all_tenants');

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    const submitFn = isEditing
      ? () =>
          updateThreat({
            ...data,
            pk: threat.pk,
            family_class: defaultValues.family_class,
          })
      : () =>
          createThreat({ ...data, family_class: defaultValues.family_class });
    submitFn()
      .unwrap()
      .then(() => handleClose(data.name))
      .catch((error) =>
        toast.error('Failed to create threat', {
          description: error.data.detail,
        }),
      );
  };

  const tenants = useAppSelector(selectTenantsList);

  return (
    <Form {...form}>
      <form className="space-y-4">
        <FormField
          control={form.control}
          name="family_class"
          disabled={!isNil(isDoc)}
          render={({ field }) => (
            <FormItem>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="flex space-x-4"
                disabled={!isNil(isDoc)}
              >
                <FormItem className="flex items-center space-y-0 space-x-2">
                  <FormControl>
                    <RadioGroupItem value="doc" />
                  </FormControl>
                  <FormLabel>Compromise</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-y-0 space-x-2">
                  <FormControl>
                    <RadioGroupItem value="dopv" />
                  </FormControl>
                  <FormLabel>Policy Violation</FormLabel>
                </FormItem>
              </RadioGroup>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <DefaultField label="Name*">
              <Input {...field} />
            </DefaultField>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <DefaultField label="Description*">
              <Textarea {...field} />
            </DefaultField>
          )}
        />
        <FormField
          control={form.control}
          name="additional_info"
          render={({ field }) => (
            <DefaultField label="Additional Information">
              <Textarea {...field} />
            </DefaultField>
          )}
        />
        <Column className="gap-2">
          <FormLabel className="mb-1">Tenants*</FormLabel>
          <FormField
            control={form.control}
            name="no_tenant"
            render={({ field }) => (
              <FormItem>
                <Row className="flex items-center gap-2">
                  <FormControl>
                    <Checkbox
                      checked={!!field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">No tenant</FormLabel>
                </Row>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="all_tenants"
            render={({ field }) => (
              <FormItem>
                <Row className="flex items-center gap-2">
                  <FormControl>
                    <Checkbox
                      checked={!!field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">All tenants</FormLabel>
                </Row>
              </FormItem>
            )}
          />
          {!all_tenants && (
            <FormField
              control={form.control}
              name="tenants"
              render={() => (
                <FormItem className="pl-4">
                  {tenants.map((tenant) => (
                    <FormField
                      key={tenant.tenantId}
                      control={form.control}
                      name="tenants"
                      render={({ field }) => (
                        <FormItem>
                          <Row className="flex items-center gap-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value.includes(tenant.tenantId)}
                                onCheckedChange={(checked) =>
                                  field.onChange(
                                    checked
                                      ? [...field.value, tenant.tenantId]
                                      : field.value.filter(
                                          (t) => t !== tenant.tenantId,
                                        ),
                                  )
                                }
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {tenant.name}
                            </FormLabel>
                          </Row>
                        </FormItem>
                      )}
                    />
                  ))}
                </FormItem>
              )}
            />
          )}
        </Column>
        <Row className="mt-4 justify-end gap-2">
          <DialogClose asChild>
            <Button
              type="button"
              variant="secondary"
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={form.handleSubmit(handleSubmit)}
            disabled={!form.formState.isValid}
          >
            {form.formState.isSubmitting ? <Spin /> : 'Submit'}
          </Button>
        </Row>
      </form>
    </Form>
  );
};
