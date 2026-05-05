import { zodResolver } from '@hookform/resolvers/zod';
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
import { useTenantsList } from '@/features/tenancy';

import { toThreatPayloadDto } from '../../api/threat.transforms';
import {
  useCreateThreatMutation,
  useUpdateThreatMutation,
} from '../../api/threats.api';
import { Threat, ThreatKind, ThreatPayload } from '../../model/threat';

const formSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  additionalInfo: z.string().optional(),
  isVisibleWithoutTenant: z.boolean(),
  tenantScopeMode: z.enum(['all', 'specific']),
  tenantIds: z.array(z.number()),
});

type FormValues = z.infer<typeof formSchema>;

const toFormValues = (threat: Threat | undefined): FormValues => {
  if (!threat) {
    return {
      name: '',
      description: '',
      additionalInfo: '',
      isVisibleWithoutTenant: true,
      tenantScopeMode: 'all',
      tenantIds: [],
    };
  }
  return {
    name: threat.name,
    description: threat.description,
    additionalInfo: threat.additionalInfo ?? '',
    isVisibleWithoutTenant: threat.isVisibleWithoutTenant,
    tenantScopeMode: threat.tenantScope.mode,
    tenantIds:
      threat.tenantScope.mode === 'specific'
        ? threat.tenantScope.tenantIds
        : [],
  };
};

const toPayload = (values: FormValues, kind: ThreatKind): ThreatPayload => ({
  kind,
  name: values.name,
  description: values.description,
  additionalInfo: values.additionalInfo,
  isVisibleWithoutTenant: values.isVisibleWithoutTenant,
  tenantScope:
    values.tenantScopeMode === 'all'
      ? { mode: 'all' }
      : { mode: 'specific', tenantIds: values.tenantIds },
});

type Props = {
  /**
   * The threat kind for this form. Always set by the surrounding context
   * (the page or modal that opened the form) — users do not pick the kind.
   */
  kind: ThreatKind;
  /** Editing an existing threat. Caller must ensure threat.kind === kind. */
  threat?: Threat;
  onClose: (savedName: string) => void;
};

export const ThreatForm = ({ kind, threat, onClose }: Props) => {
  const isEditing = !!threat;
  const [createThreat] = useCreateThreatMutation();
  const [updateThreat] = useUpdateThreatMutation();

  const form = useForm({
    defaultValues: toFormValues(threat),
    resolver: zodResolver(formSchema),
  });

  const tenantScopeMode = form.watch('tenantScopeMode');
  const tenants = useTenantsList();

  const handleSubmit = (values: FormValues) => {
    const payload = toThreatPayloadDto(toPayload(values, kind));
    const submit = isEditing
      ? updateThreat({ ...payload, pk: threat.id })
      : createThreat(payload);
    submit
      .unwrap()
      .then(() => onClose(values.name))
      .catch((error) =>
        toast.error('Failed to save threat', {
          description: error.data?.detail,
        }),
      );
  };

  return (
    <Form {...form}>
      <form className="space-y-4">
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
          name="additionalInfo"
          render={({ field }) => (
            <DefaultField label="Additional Information">
              <Textarea {...field} />
            </DefaultField>
          )}
        />
        <FormField
          control={form.control}
          name="isVisibleWithoutTenant"
          render={({ field }) => (
            <FormItem>
              <Row className="flex items-center gap-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="font-normal">
                  Visible when no tenant is selected
                </FormLabel>
              </Row>
            </FormItem>
          )}
        />
        <Column className="gap-2">
          <FormLabel className="mb-1">Tenant scope*</FormLabel>
          <FormField
            control={form.control}
            name="tenantScopeMode"
            render={({ field }) => (
              <FormItem>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="flex flex-col gap-2"
                >
                  <FormItem className="flex items-center space-y-0 space-x-2">
                    <FormControl>
                      <RadioGroupItem value="all" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      All tenants (current and future)
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-y-0 space-x-2">
                    <FormControl>
                      <RadioGroupItem value="specific" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Specific tenants
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormItem>
            )}
          />
          {tenantScopeMode === 'specific' && (
            <FormField
              control={form.control}
              name="tenantIds"
              render={({ field }) => (
                <FormItem className="pl-6">
                  {tenants.map((tenant) => (
                    <FormItem key={tenant.tenantId}>
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
