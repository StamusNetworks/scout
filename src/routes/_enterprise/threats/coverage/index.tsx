import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { Row } from '@/common/design-system/atoms/layout/row';
import {
  Page,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from '@/common/design-system/atoms/page';
import { Divider } from '@/common/design-system/atoms/ui/divider';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/common/design-system/atoms/ui/pillTabs';
import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';
import { TextFilter } from '@/common/design-system/molecules/data-table/filters/text-filter';
import { TogglePageContainer } from '@/common/design-system/molecules/toggle-container';
import {
  ActiveFamiliesList,
  ActiveThreatsList,
  FamiliesList,
  ThreatsList,
} from '@/features/threats';

const searchSchema = z.object({
  show: z.enum(['threat', 'family']).default('threat'),
  search: z.string().default(''),
});

export const Route = createFileRoute('/_enterprise/threats/coverage/')({
  validateSearch: searchSchema,
  component: () => (
    <PageBoundary key="threats-coverage">
      <ThreatsCoveragePage />
    </PageBoundary>
  ),
});

function ThreatsCoveragePage() {
  const { show, search } = Route.useSearch();
  const navigate = Route.useNavigate();
  const setShow = (next: 'threat' | 'family') =>
    navigate({ search: (prev) => ({ ...prev, show: next }) });
  const setSearch = (next: string) =>
    navigate({ search: (prev) => ({ ...prev, search: next }) });

  return (
    <Page>
      <OutletBreadcrumb>Coverage</OutletBreadcrumb>
      <TogglePageContainer>
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>Coverage</PageTitle>
            <PageDescription>
              Review the coverage of threat detection methods and families in
              your environment.
            </PageDescription>
          </PageHeaderContent>
        </PageHeader>
        <Tabs
          className="p-1"
          value={show}
          onValueChange={(v) => setShow(v as 'threat' | 'family')}
        >
          <Row className="w-full gap-2">
            <TabsList className="flex w-fit">
              <TabsTrigger value="threat">Threats</TabsTrigger>
              <TabsTrigger value="family">Families</TabsTrigger>
            </TabsList>
            <Row className="gap-3">
              <TextFilter
                value={search}
                onChange={setSearch}
                placeholder="Search..."
              />
            </Row>
          </Row>
          {show === 'family' ? (
            <>
              <Divider
                label="Active families"
                className="my-6"
              />
              <ActiveFamiliesList
                kind="compromise"
                searchInput={search}
              />
              <Divider
                label="All families"
                className="my-6"
              />
              <FamiliesList
                kind="compromise"
                searchInput={search}
              />
            </>
          ) : (
            <>
              <Divider
                label="Active Threats"
                className="my-6"
              />
              <ActiveThreatsList
                kind="compromise"
                searchInput={search}
              />
              <Divider
                label="All Threats"
                className="my-6"
              />
              <ThreatsList
                kind="compromise"
                searchInput={search}
              />
            </>
          )}
        </Tabs>
      </TogglePageContainer>
    </Page>
  );
}
