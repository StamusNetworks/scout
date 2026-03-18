import { useMemo } from 'react';

import { DataTable } from '@/common/design-system/molecules/data-table';
import { allSightingsTableColumns } from '@/features/analytics/sightings/components/sightings-table/sightings-table.columns';

import { useGetSightingById } from '../hooks/use-get-sighting-by-id';

interface PatientZeroDetailsProps {
  sightingId: string;
}
export const PatientZeroDetails = ({ sightingId }: PatientZeroDetailsProps) => {
  const { data: sighting, isFetching } = useGetSightingById(sightingId);

  const sightingData = useMemo(() => {
    if (!sighting) return undefined;
    return {
      results: [sighting],
      count: 1,
    };
  }, [sighting]);

  return (
    <DataTable
      data={sightingData}
      columns={allSightingsTableColumns}
      isLoading={isFetching}
      skeletonRows={1}
      paginationbar={false}
    />
  );
};
