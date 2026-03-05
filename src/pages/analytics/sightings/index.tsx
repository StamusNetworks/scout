import { useNavigate } from 'react-router-dom';

import {
  Page,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from '@/common/design-system/atoms/page';
import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';
import { TogglePageContainer } from '@/common/design-system/molecules/toggle-container';
import { SightingsTable } from '@/features/analytics/sightings/components/sightings-table/sightings-table';
import {
  allSightingsExport,
  allSightingsTableColumns,
} from '@/features/analytics/sightings/components/sightings-table/sightings-table.columns';
import { routes } from '@/pages/routes.config';

export const Sightings = () => {
  const navigate = useNavigate();
  return (
    <Page>
      <OutletBreadcrumb>Sightings</OutletBreadcrumb>
      <TogglePageContainer>
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>Sightings</PageTitle>
            <PageDescription>
              Sightings events identify never observed before metadata, such as
              a HTTP User-Agent, a domain name, a JA4 hash, and more.
            </PageDescription>
          </PageHeaderContent>
        </PageHeader>
        <SightingsTable
          columns={allSightingsTableColumns}
          onRowClick={(row) =>
            navigate(
              routes.sightings_details.replace(':sightingId', row.original._id),
            )
          }
          exportColumns={allSightingsExport}
        />
      </TogglePageContainer>
    </Page>
  );
};
