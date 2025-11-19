import { ExternalLink } from '@/common/design-system/atoms/external-link';
import { Country } from '@/common/design-system/atoms/flag';
import { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';
import { EventValue } from '@/features/hunt/filtering/query-filters/components/event-value/event-value';

import { BeaconingEvent } from '../../models/beaconing-event.model';

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
