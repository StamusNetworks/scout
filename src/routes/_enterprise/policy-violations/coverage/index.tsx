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
} from '@/common/design-system/atoms/ui/pill-tabs';
import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';
import { TextFilter } from '@/common/design-system/molecules/data-table/filters/text-filter';
import { TogglePageContainer } from '@/features/app-shell';
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

export const Route = createFileRoute(
  '/_enterprise/policy-violations/coverage/',
)({
  validateSearch: searchSchema,
  component: () => (
    <PageBoundary key="pv-coverage">
      <PolicyViolationsCoveragePage />
    </PageBoundary>
  ),
});

function PolicyViolationsCoveragePage() {
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
              Review the coverage of policy violation detection methods and
              families in your environment.
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
              <TabsTrigger value="threat">Policy Violations</TabsTrigger>
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
                kind="policyViolation"
                searchInput={search}
              />
              <Divider
                label="All families"
                className="my-6"
              />
              <FamiliesList
                kind="policyViolation"
                searchInput={search}
              />
            </>
          ) : (
            <>
              <Divider
                label="Violated policies"
                className="my-6"
              />
              <ActiveThreatsList
                kind="policyViolation"
                searchInput={search}
              />
              <Divider
                label="All Policy Violations"
                className="my-6"
              />
              <ThreatsList
                kind="policyViolation"
                searchInput={search}
              />
            </>
          )}
        </Tabs>
      </TogglePageContainer>
    </Page>
  );
}
