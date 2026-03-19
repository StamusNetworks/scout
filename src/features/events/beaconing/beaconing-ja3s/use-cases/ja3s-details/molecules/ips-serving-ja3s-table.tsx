import { ExternalLink } from '@/common/design-system/atoms/external-link';
import { Country } from '@/common/design-system/atoms/flag';
import { DataTable } from '@/common/design-system/molecules/data-table';
import { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';
import { usePaginationState } from '@/common/design-system/molecules/data-table/hooks/use-pagination';
import { esEscape } from '@/common/lib/strings';
import { useGetBeaconingEventsQuery } from '@/features/events/beaconing/common/beaconing.api';
import { BeaconingEvent } from '@/features/events/beaconing/common/beaconing-event.model';
import { EventValue } from '@/features/filtering/filters/query-filters/use-cases/interactive-value/event-value';
import { useGlobalQueryParams } from '@/features/filtering/use-global-query-params';

export const ipsServingJa3sTableColumns: CustomColumnDef<BeaconingEvent>[] = [
  {
    id: 'IP',
    header: 'IP',
    cell: ({ row }) => (
      <EventValue
        query_key="ip"
        value={row.original.beacon_report.value}
      />
    ),
  },
  {
    id: 'IP Country',
    header: 'IP Country',
    cell: ({ row }) => (
      <EventValue
        query_key="geoip.country_name"
        value={row.original.beacon_report.geoip_serving_ip?.ip_country}
      >
        <Country
          code={row.original.beacon_report.geoip_serving_ip?.country_code}
          country={row.original.beacon_report.geoip_serving_ip?.ip_country}
        />
      </EventValue>
    ),
  },
  {
    id: 'ASN',
    header: 'ASN',
    accessorFn: (row) => row.beacon_report.geoip_serving_ip?.asn_code,
  },
  {
    id: 'ASN Organization',
    header: 'ASN Organization',
    accessorFn: (row) => row.beacon_report.geoip_serving_ip?.asn_organization,
  },
  {
    id: 'Entities',
    header: 'Entities',
    cell: ({ row }) => row.original.beacon_report.assets?.length,
  },
  {
    id: 'VirusTotal',
    header: 'VirusTotal',
    cell: ({ row }) => (
      <ExternalLink
        to={`https://www.virustotal.com/gui/ip-address/${row.original.beacon_report.value}`}
      />
    ),
  },
];

interface IpsServingJa3sTableProps {
  ja3s: string;
}

export const IpsServingJa3sTable = ({ ja3s }: IpsServingJa3sTableProps) => {
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const [pagination, setPagination] = usePaginationState();
  const { data, isFetching } = useGetBeaconingEventsQuery({
    ...params,
    ...pagination,
    qfilter: `beacon_report.document_type:agg_serving_ip AND beacon_report.server_hash:${esEscape(ja3s)}`,
  });

  return (
    <DataTable
      data={data}
      isLoading={isFetching}
      columns={ipsServingJa3sTableColumns}
      pagination={pagination}
      onPaginationChange={setPagination}
    />
  );
};
