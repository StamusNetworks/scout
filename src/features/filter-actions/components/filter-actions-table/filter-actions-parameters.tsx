import { FilterAction } from '@/features/filter-actions/model/filter-action';
import { useTenancy } from '@/features/tenancy';

type KeyToDisplay = {
  name: string;
  key: string;
  value?: string;
  formatedValue?: Record<string, string>;
};

const keysToDisplay: KeyToDisplay[] = [
  { name: 'Threat Name', key: 'threat' },
  { name: 'Kill Chain', key: 'killChain' },
  { name: 'Offender Key', key: 'sourceKey' },
  { name: 'Victim Type', key: 'targetType' },
  { name: 'Victim Key', key: 'targetKey' },
  { name: 'Count', key: 'count' },
  { name: 'Seconds', key: 'seconds' },
  {
    name: 'Track',
    key: 'track',
    formatedValue: { by_src: 'By Source', by_dst: 'By Destination' },
  },
];

const formatOptions = (options: Record<string, unknown>) =>
  keysToDisplay.reduce<KeyToDisplay[]>((acc, { name, key, formatedValue }) => {
    const optionValue = options[key];
    if (optionValue !== undefined) {
      const displayValue =
        formatedValue &&
        typeof optionValue === 'string' &&
        formatedValue[optionValue]
          ? formatedValue[optionValue]
          : String(optionValue);
      return [...acc, { name, key, value: displayValue }];
    }
    return acc;
  }, []);

const formatTenants = (
  options: Extract<FilterAction, { kind: 'threat' }>['options'],
) => {
  if (options.allTenants) {
    return ['All tenants', options.noTenant && 'No tenant']
      .filter(Boolean)
      .join(', ');
  }
  if (options.tenantsStr) {
    return options.tenantsStr.join(', ');
  }
  return '';
};

const trackValue = (trackOffender: boolean, trackTarget: boolean) => {
  if (trackOffender && trackTarget) return 'Both';
  if (trackOffender) return 'Offender';
  if (trackTarget) return 'Victim';
  return '';
};

export const FilterActionParameters = ({
  filterAction,
}: {
  filterAction: FilterAction;
}) => {
  const { multitenancy } = useTenancy();

  const threatOptions =
    filterAction.kind === 'threat' ? filterAction.options : null;

  const optionsRecord =
    'options' in filterAction
      ? (filterAction.options as Record<string, unknown>)
      : {};

  let formattedOptions: KeyToDisplay[] = [
    {
      name: 'Threat Type',
      key: 'threatType',
      value: threatOptions?.killChain
        ? threatOptions.killChain === 'pre_condition'
          ? 'Declaration of policy violation'
          : 'Declaration of Compromise'
        : '',
    },
    ...formatOptions(optionsRecord),
    {
      name: 'Tracking',
      key: 'tracking',
      value: trackValue(
        threatOptions?.trackOffender ?? false,
        threatOptions?.trackTarget ?? false,
      ),
    },
  ];

  if (multitenancy && threatOptions) {
    formattedOptions = [
      ...formattedOptions,
      {
        name: 'Tenants',
        key: 'tenants',
        value: formatTenants(threatOptions),
      },
    ];
  }

  formattedOptions = formattedOptions.filter((option) => option.value);

  return (
    <>
      {formattedOptions.map((option) => (
        <div key={option.key}>
          <strong>{option.name}</strong>: {option.value}
        </div>
      ))}
    </>
  );
};
