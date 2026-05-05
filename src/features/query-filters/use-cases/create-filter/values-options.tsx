import { Badge } from '@/common/design-system/atoms/ui/badge';
import {
  CommandGroup,
  CommandItem,
  CommandLoading,
} from '@/common/design-system/atoms/ui/command';
import { formatNumber } from '@/common/lib/numbers';
import { useGetDashboardFieldsQuery } from '@/features/events/detection-events/use-cases/explorer/api/dashboard.api';
import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';
import { setOpenModal } from '@/features/ui/ui-state.slice';
import { useAppDispatch, useAppSelector } from '@/store/store';

import { FilterInputType } from '../../constants/query-filter.config';
import { useQueryFilterDefinition } from '../../hooks/use-filters-definitions';
import { getFilterValue } from '../../utils/get-filter-label';
import { handleSubmit } from './add-qfilter-command';
import { selectFilterCommand } from './add-qfilter-command.selectors';
import { useCreateFilter } from './create-filter';

export const ValuesOptions = () => {
  const dispatch = useAppDispatch();
  const createFilter = useCreateFilter();
  const closeModal = () => dispatch(setOpenModal(null));
  const { filter, search, negated, wildcarded } =
    useAppSelector(selectFilterCommand);
  const filterDef = useQueryFilterDefinition(filter ?? '');
  const params = useGlobalQueryParams(['tenant', 'dates']);

  const { data, isFetching } = useGetDashboardFieldsQuery({
    ...params,
    fields: filter || '',
    page_size: 100,
    discovery: true,
    alert: true,
    stamus: true,
  });
  const options = data?.[filter || ''] || [];

  return (
    <>
      {search &&
        !options.map((item) => item.key.toString()).includes(search) && (
          <CommandGroup heading="Custom value">
            <CommandItem
              value={search}
              onSelect={() =>
                handleSubmit(
                  createFilter,
                  closeModal,
                  filter!,
                  asStringOrNumber(search, filterDef),
                  !!negated,
                  !!wildcarded,
                )
              }
            >
              {search}
            </CommandItem>
          </CommandGroup>
        )}
      {isFetching && <CommandLoading>Fetching options...</CommandLoading>}
      {filterDef?.inputType === FilterInputType.SELECT ? (
        <CommandGroup>
          {'options' in filterDef &&
            filterDef.options?.map(({ label, value }) => (
              <CommandItem
                key={value}
                value={value}
                onSelect={() =>
                  handleSubmit(
                    createFilter,
                    closeModal,
                    filter!,
                    value,
                    !!negated,
                    !!wildcarded,
                  )
                }
                className="justify-between"
              >
                <span>{label}</span>
              </CommandItem>
            ))}
        </CommandGroup>
      ) : (
        options.length > 0 && (
          <CommandGroup heading="Values from data">
            {options?.map((item) => (
              <CommandItem
                key={item.key}
                value={item.key + getFilterValue(filter!, item.key)}
                onSelect={() =>
                  handleSubmit(
                    createFilter,
                    closeModal,
                    filter!,
                    item.key,
                    !!negated,
                    !!wildcarded,
                  )
                }
                className="justify-between"
              >
                <span>{getFilterValue(filter!, item.key)}</span>
                <Badge variant="secondary">
                  {formatNumber(item.doc_count)}
                </Badge>
              </CommandItem>
            ))}
          </CommandGroup>
        )
      )}
    </>
  );
};

const asStringOrNumber = (
  value: string,
  definition?: ReturnType<typeof useQueryFilterDefinition>,
) =>
  definition?.inputType === FilterInputType.NUMBER
    ? isNaN(Number(value))
      ? value
      : Number(value)
    : value;
