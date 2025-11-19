import { useNavigate } from 'react-router-dom';

import { SightingsTable } from '@/features/analytics/sightings/components/sightings-table/sightings-table';
import {
  allSightingsExport,
  allSightingsTableColumns,
} from '@/features/analytics/sightings/components/sightings-table/sightings-table.columns';
import { routes } from '@/pages/routes.config';

export const Sightings = () => {
  const navigate = useNavigate();
  return (
    <SightingsTable
      columns={allSightingsTableColumns}
      onRowClick={(row) =>
        navigate(
          routes.sightings_details.replace(':sightingId', row.original._id),
        )
      }
      exportColumns={allSightingsExport}
    />
  );
};
