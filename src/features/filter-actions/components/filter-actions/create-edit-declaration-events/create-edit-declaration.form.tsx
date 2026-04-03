import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { Edit, Plus } from 'lucide-react';
import { values } from 'ramda';
import { useEffect, useMemo, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Column } from '@/common/design-system/atoms/layout/column';
import { Grid } from '@/common/design-system/atoms/layout/grid';
import { Row } from '@/common/design-system/atoms/layout/row';
import { Button } from '@/common/design-system/atoms/ui/button';
import { Checkbox } from '@/common/design-system/atoms/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/common/design-system/atoms/ui/dialog';
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
  RadioGroup,
  RadioGroupItem,
} from '@/common/design-system/atoms/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/common/design-system/atoms/ui/select';
import { Separator } from '@/common/design-system/atoms/ui/separator';
import { Spin } from '@/common/design-system/atoms/ui/spin';
import { DefaultField } from '@/common/design-system/molecules/default-field';
import { Dates, QFilter, Tenant } from '@/common/fetching/fetching.types';
import { useUpdateEffect } from '@/common/lib/use-update-effect';
import { useGetRulesetsQuery } from '@/features/detection-methods/rulesets.api';
import { FilterInput } from '@/features/filtering/filters/query-filters/use-cases/update-filter/filter-input';
import { useGlobalQueryParams } from '@/features/filtering/use-global-query-params';
import {
  KillChainKeys,
  killChainSchema,
  killChainsConfig,
} from '@/features/threats/common/killchain/killchain';
import { CreateEditThreatForm } from '@/features/threats/common/molecules/create-edit-threat-form';
import { useGetCustomThreatsQuery } from '@/features/threats/common/threats.api';

import {
  useCreateFilterActionMutation,
  useUpdateFilterActionMutation,
} from '../../../api/filter-actions.api';
import {
  FilterActionPayload,
  filterActionTargetType,
  ThreatFilterAction,
} from '../../../model/filter-action.schema';
import { baseFilterActionSchema } from '../filter-actions.baseSchema';
import { toFilterDefDto } from '../to-dto';
import { useInitialValues } from '../use-initial-values';

const formSchema = baseFilterActionSchema.extend({
  type: z.enum(['doc', 'dopv']),
  threat: z.string().refine((value) => value.length > 0, {
    message: 'You have to select a value',
  }),
  kill_chain: killChainSchema,
  track_options: z
    .object({
      track_offender: z.boolean(),
      track_target: z.boolean(),
    })
    .refine((value) => value.track_offender || value.track_target, {
      message: 'You have to select at least one option',
    }),
  target_type: filterActionTargetType,
  target_key: z.string().refine((value) => value.length > 0, {
    message: 'You have to select a value',
  }),
  source_key: z.string().refine((value) => value.length > 0, {
    message: 'You have to select a value',
  }),
  stamus_event: z.boolean(),
  checkWebhooks: z.boolean(),
});

export type DeclarationFormValues = z.infer<typeof formSchema>;

const useDeclarationInitialValues = (
  filterAction?: ThreatFilterAction,
): DeclarationFormValues => {
  const initialValues = useInitialValues('threat', filterAction);
  return useMemo(
    () => ({
      ...initialValues,
      type:
        filterAction?.options.kill_chain === 'pre_condition' ? 'dopv' : 'doc',
      threat: filterAction?.options.threat ?? '',
      kill_chain: filterAction?.options.kill_chain ?? 'reconnaissance',
      track_options: {
        track_offender: filterAction?.options.track_offender ?? false,
        track_target: filterAction?.options.track_target ?? true,
      },
      target_type: filterAction?.options.target_type ?? 'ip',
      target_key: filterAction?.options.target_key ?? '',
      source_key: filterAction?.options.source_key ?? '',
      stamus_event: filterAction?.options.stamus_event ?? false,
      checkWebhooks: filterAction?.options.checkWebhooks ?? false,
    }),
    [filterAction, initialValues],
  );
};

interface CreateEditDeclarationThreatFilterActionFormProps {
  edit: boolean;
  filterAction?: ThreatFilterAction | undefined;
  onClose?: () => void;
}
export const CreateEditDeclarationFilterActionForm = ({
  edit,
  filterAction,
  onClose,
}: CreateEditDeclarationThreatFilterActionFormProps) => {
  const params = useGlobalQueryParams(['tenant', 'qfilter', 'dates']);
  const navigate = useNavigate();
  const { data: rulesetsList } = useGetRulesetsQuery();

  const initialValues = useDeclarationInitialValues(filterAction);
  const form = useForm<DeclarationFormValues>({
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

  const isDoc = form.watch('type') === 'doc';
  const withHistorical = form.watch('stamus_event');
  useUpdateEffect(() => {
    if (isDoc) {
      form.setValue('kill_chain', 'reconnaissance');
      form.setValue('threat', '');
    } else {
      form.setValue('kill_chain', 'pre_condition');
      form.setValue('threat', '');
    }
    setPendingThreat(null);
  }, [form, isDoc]);

  const { data: threatOptions } = useGetCustomThreatsQuery(
    { tenant: params.tenant },
    {
      selectFromResult: (result) => ({
        ...result,
        data:
          result.data &&
          values(result.data.entities).filter(
            (threat) => threat.family_class === (isDoc ? 'doc' : 'dopv'),
          ),
      }),
    },
  );

  const [createThreatFilterAction] = useCreateFilterActionMutation();
  const [updateFilterAction] = useUpdateFilterActionMutation();
  const handleSubmit = (data: z.infer<typeof formSchema>): void => {
    const response: FilterActionPayload & { params: Tenant & Dates & QFilter } =
      {
        params,
        action: 'threat',
        comment: data.comment || '',
        filter_defs: data.filters.filter((f) => f.enabled).map(toFilterDefDto),
        rulesets: data.rulesets,
        options: {
          threat: data.threat,
          kill_chain: data.kill_chain,
          source_key: data.source_key,
          target_key: data.target_key,
          track_offender: data.track_options.track_offender,
          track_target: data.track_options.track_target,
          target_type: data.target_type,
          stamus_event: data.stamus_event,
          checkWebhooks: data.stamus_event && data.checkWebhooks,
        },
      };
    const submitFn =
      edit && filterAction
        ? () => updateFilterAction({ ...response, pk: filterAction.pk })
        : () => createThreatFilterAction(response);
    submitFn()
      .unwrap()
      .then(() => {
        onClose?.();
        navigate({
          to: '/filters-actions',
          search: { page: 1, page_size: 10 },
        });
        toast.success(
          `Filter Action ${edit ? 'updated' : 'created'} successfully`,
        );
      })
      .catch((error) =>
        toast.error(`Failed to ${edit ? 'update' : 'create'} filter action`, {
          description: error.data.detail,
        }),
      );
  };

  const [threatModal, setThreatModal] = useState<'create' | 'edit' | null>(
    null,
  );
  const [pendingThreat, setPendingThreat] = useState<string | null>(null);
  const handleCustomThreatMutationSuccess = (threat: string) => {
    setPendingThreat(threat);
    setThreatModal(null);
  };
  // Auto-select once the option appears in the cache-filtered list
  useEffect(() => {
    if (pendingThreat && threatOptions?.some((t) => t.name === pendingThreat)) {
      form.setValue('threat', pendingThreat);
      setPendingThreat(null);
    }
  }, [form, pendingThreat, threatOptions]);

  const victimType = form.watch('target_type');
  useUpdateEffect(() => {
    form.setValue('target_key', '');
  }, [form, victimType]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <Column>
              <FormItem className="mb-2 flex items-center space-y-0">
                <FormLabel>Declaration(s) of:</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="ml-4 flex gap-4"
                  >
                    <FormItem className="flex items-center gap-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="doc" />
                      </FormControl>
                      <FormLabel className="font-normal">Compromise</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center gap-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="dopv" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Policy violation
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
              </FormItem>
              <FormDescription>
                These Declarations of{' '}
                {isDoc ? 'Compromise (DoC)' : 'Policy Violation (DoPV)'} will
                appear in the Custom {isDoc ? 'Threats' : 'Policy Violations'}{' '}
                family
              </FormDescription>
            </Column>
          )}
        />
        <Separator />
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
        <Grid className="grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="threat"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{isDoc ? 'Threat' : 'Policy Violation'}</FormLabel>
                <Row className="items-center gap-1">
                  <FormControl>
                    <Select
                      defaultValue={field.value}
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {threatOptions?.map((threat) => (
                          <SelectItem
                            key={threat.pk}
                            value={threat.name}
                          >
                            {threat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <Dialog
                    open={threatModal === 'create'}
                    onOpenChange={(open) =>
                      setThreatModal(open ? 'create' : null)
                    }
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="h-7 w-7 shrink-0 px-0"
                        onClick={() => setThreatModal('create')}
                      >
                        <Plus size={14} />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogTitle>
                        Create custom {isDoc ? 'Threat' : 'Policy Violation'}
                      </DialogTitle>
                      <CreateEditThreatForm
                        isDoc={isDoc}
                        handleClose={handleCustomThreatMutationSuccess}
                      />
                    </DialogContent>
                  </Dialog>
                  <Dialog
                    open={threatModal === 'edit'}
                    onOpenChange={(open) =>
                      setThreatModal(open ? 'edit' : null)
                    }
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="h-7 w-7 shrink-0 px-0"
                        disabled={!field.value}
                        onClick={() => setThreatModal('edit')}
                      >
                        <Edit size={14} />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogTitle>
                        Edit custom {isDoc ? 'Threat' : 'Policy Violation'}
                      </DialogTitle>
                      <CreateEditThreatForm
                        isDoc={isDoc}
                        threat={threatOptions?.find(
                          (threat) => threat.name === field.value,
                        )}
                        handleClose={handleCustomThreatMutationSuccess}
                      />
                    </DialogContent>
                  </Dialog>
                </Row>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="kill_chain"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kill chain phase</FormLabel>
                <FormControl>
                  <Select
                    defaultValue={field.value}
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={!isDoc}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {KillChainKeys.filter((kc) =>
                        isDoc ? kc !== 'pre_condition' : kc === 'pre_condition',
                      ).map((kc) => (
                        <SelectItem
                          key={kc}
                          value={kc}
                        >
                          {killChainsConfig[kc].name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Grid>
        <FormField
          control={form.control}
          name="track_options"
          render={() => (
            <FormItem>
              <Row className="pt-2">
                <FormLabel>Track options:</FormLabel>
                <Row className="ml-4 gap-4">
                  <FormField
                    control={form.control}
                    name="track_options.track_target"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-y-0 space-x-2">
                        <FormControl>
                          <Checkbox
                            checked={!!field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Track Victim
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="track_options.track_offender"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-y-0 space-x-2">
                        <FormControl>
                          <Checkbox
                            checked={!!field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Track Offender
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </Row>
              </Row>
              <FormMessage />
            </FormItem>
          )}
        />
        <Grid className="grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="target_type"
            render={({ field }) => (
              <DefaultField label="Victim type">
                <Select
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ip">IP</SelectItem>
                    <SelectItem value="username">Username</SelectItem>
                    <SelectItem value="mail">Mail</SelectItem>
                  </SelectContent>
                </Select>
              </DefaultField>
            )}
          />
          <FormField
            control={form.control}
            name="target_key"
            render={({ field }) => (
              <DefaultField label="Victim key">
                <Select
                  defaultValue={field.value}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {keyOptions[victimType].map((key) => (
                      <SelectItem
                        key={key}
                        value={key}
                      >
                        {key}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </DefaultField>
            )}
          />
        </Grid>
        <Grid className="grid-cols-2 gap-4">
          <DefaultField label="Offender type">
            <Select
              defaultValue="ip"
              disabled
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ip">IP</SelectItem>
              </SelectContent>
            </Select>
          </DefaultField>
          <FormField
            control={form.control}
            name="source_key"
            render={({ field }) => (
              <DefaultField label="Offender key">
                <Select
                  defaultValue={field.value}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {keyOptions.ip.map((key) => (
                      <SelectItem
                        key={key}
                        value={key}
                      >
                        {key}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </DefaultField>
            )}
          />
        </Grid>
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
        <Separator />
        <Column className="gap-2">
          <FormLabel>Historical data</FormLabel>
          <FormField
            control={form.control}
            name="stamus_event"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-y-0 space-x-2">
                <FormControl>
                  <Checkbox
                    checked={!!field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="font-normal">
                  Generate {isDoc ? 'DoC' : 'DoPV'}s from historical data for
                  this tenant
                </FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="checkWebhooks"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-y-0 space-x-2">
                <FormControl>
                  <Checkbox
                    checked={!!field.value}
                    onCheckedChange={field.onChange}
                    disabled={!withHistorical}
                  />
                </FormControl>
                <FormLabel className="font-normal">
                  Generate webhook events from historical data
                </FormLabel>
              </FormItem>
            )}
          />
        </Column>
        <Row className="mt-4 justify-end gap-2">
          {onClose && (
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
            >
              Cancel
            </Button>
          )}
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

const keyOptions = {
  ip: [
    'src_ip',
    'dest_ip',
    'flow.src_ip',
    'flow.dest_ip',
    'alert.target.ip',
    'alert.source.ip',
  ],
  username: ['krb5.cname', 'smb.ntlmssp.user'],
  mail: ['smtp.rcpt_to', 'email.cc', 'email.to', 'sdp.email'],
} as const;
