import { useSelector } from 'react-redux';

import { FilterAction } from '@/features/filter-actions/model/filter-action';
import { selectTenancy } from '@/features/user/tenancy/tenancy.selector';

type KeyToDisplay = {
  name: string;
  key: string;
  value?: string;
  formatedValue?: Record<string, string>;
};

const keysToDisplay: KeyToDisplay[] = [
  { name: 'Threat Name', key: 'threat' },
  { name: 'Kill Chain', key: 'kill_chain' },
  { name: 'Offender Type', key: 'offender_type' },
  { name: 'Offender Key', key: 'source_key' },
  { name: 'Victim Type', key: 'target_type' },
  { name: 'Victim Key', key: 'target_key' },
  { name: 'Count', key: 'count' },
  { name: 'Seconds', key: 'seconds' },
  {
    name: 'Track',
    key: 'track',
    formatedValue: { by_src: 'By Source', by_dst: 'By Destination' },
  },
];

const formatOptions = (options: FilterAction['options']) =>
  keysToDisplay.reduce((acc, { name, key, formatedValue }) => {
    const optionValue = options[key as keyof FilterAction['options']];
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
  }, [] as KeyToDisplay[]);

const formatTenantArray = (filterAction: FilterAction) => {
  if (filterAction.action !== 'threat') return '';
  const options = filterAction.options as Extract<
    FilterAction,
    { action: 'threat' }
  >['options'];
  if (options.all_tenants) {
    return ['All tenants', options.no_tenant && 'No tenant']
      .filter(Boolean)
      .join(', ');
  }
  if (options.tenants_str) {
    return options.tenants_str.join(', ');
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
  const { multitenancy } = useSelector(selectTenancy);

  const threatOptions =
    filterAction.action === 'threat'
      ? (filterAction.options as Extract<
          FilterAction,
          { action: 'threat' }
        >['options'])
      : null;

  let formattedOptions: KeyToDisplay[] = [
    {
      name: 'Threat Type',
      key: 'threat_type',
      value: threatOptions?.kill_chain
        ? threatOptions.kill_chain === 'pre_condition'
          ? 'Declaration of policy violation'
          : 'Declaration of Compromise'
        : '',
    },
    ...formatOptions(filterAction.options),
    {
      name: 'Tracking',
      key: 'tracking',
      value: trackValue(
        threatOptions?.track_offender ?? false,
        threatOptions?.track_target ?? false,
      ),
    },
  ];

  if (multitenancy) {
    formattedOptions = [
      ...formattedOptions,
      {
        name: 'Tenants',
        key: 'tenants',
        value: formatTenantArray(filterAction),
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
