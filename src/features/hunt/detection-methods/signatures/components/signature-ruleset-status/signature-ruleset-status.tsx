import { Check, Power, PowerOff, X } from 'lucide-react';

import { Button } from '@/common/design-system/atoms/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/common/design-system/atoms/ui/popover';
import { Spin } from '@/common/design-system/atoms/ui/spin';
import { DataTable } from '@/common/design-system/molecules/data-table/data-table';
import { DataTableColumnHeader } from '@/common/design-system/molecules/data-table/data-table.columnHeader';
import { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';

import { useGetSignatureRulesetsStatusQuery } from '../../api/signatures.api';
import { SignatureStatus } from '../../model/signature-status';

interface SignatureRulesetStatusProps {
  pk: number;
}

export const SignatureRulesetStatus = ({ pk }: SignatureRulesetStatusProps) => {
  const { isFetching, status } = useGetSignatureRulesetsStatusQuery(
    {
      pk,
    },
    {
      selectFromResult: (result) => {
        const activeRulesets = result.data?.filter(
          (item) => item.active === true,
        );
        const danger = activeRulesets?.every(
          (item) => item.valid.status === false,
        );
        const warning = activeRulesets?.some(
          (item) => item.valid.status === false,
        );
        return {
          ...result,
          status: danger ? 'danger' : warning ? 'warning' : 'success',
        };
      },
    },
  );
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={isFetching}
        >
          {isFetching ? (
            <Spin />
          ) : status === 'danger' ? (
            <div className="mr-2 size-2 rounded-full bg-red-600" />
          ) : status === 'warning' ? (
            <div className="mr-2 size-2 rounded-full bg-yellow-600" />
          ) : (
            <div className="mr-2 size-2 rounded-full bg-green-600" />
          )}{' '}
          Status
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-fit max-w-[800px]">
        <SignatureRulesetStatusContent pk={pk} />
      </PopoverContent>
    </Popover>
  );
};

export const SignatureRulesetStatusContent = ({
  pk,
}: SignatureRulesetStatusProps) => {
  const { data: rulesetsStatus } = useGetSignatureRulesetsStatusQuery(
    {
      pk,
    },
    {
      selectFromResult: (result) => ({
        ...result,
        data: {
          results: result.data || [],
          next: undefined,
          previous: undefined,
          count: result.data?.length || 0,
        },
      }),
    },
  );
  return (
    <DataTable
      data={rulesetsStatus}
      columns={columns}
      serverSide={false}
    />
  );
};

const columns: CustomColumnDef<SignatureStatus>[] = [
  {
    id: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Ruleset"
      />
    ),
    accessorFn: (row) => row.name,
  },
  {
    id: 'valid',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Valid"
      />
    ),
    cell: ({ row }) => (row.original.valid.status ? <Check /> : <X />),
  },
  {
    id: 'active',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Active"
      />
    ),
    cell: ({ row }) => (row.original.active ? <Power /> : <PowerOff />),
  },
  {
    id: 'target',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Target"
      />
    ),
    accessorFn: (row) => row.transformations.target,
  },
  {
    id: 'lateral',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Lateral"
      />
    ),
    accessorFn: (row) => row.transformations.lateral,
  },
];
