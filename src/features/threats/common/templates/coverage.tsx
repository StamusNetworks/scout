import { parseAsString, parseAsStringLiteral, useQueryState } from 'nuqs';

import { Row } from '@/common/design-system/atoms/layout/row';
import { Divider } from '@/common/design-system/atoms/ui/divider';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/common/design-system/atoms/ui/pillTabs';
import { TextFilter } from '@/common/design-system/molecules/data-table/filters/text-filter';

import { ThreatKind } from '../../model/threat';
import { ActiveFamiliesList } from './active-families-list';
import { ActiveThreatsList } from './active-threats-list';
import { FamiliesList } from './threat-families-list';
import { ThreatsList } from './threats-list';

export const CoveragePage = ({ kind }: { kind: ThreatKind }) => {
  const [entityOrFamily, setEntityOrFamily] = useQueryState(
    'show',
    parseAsStringLiteral(['threat', 'family']).withDefault('threat'),
  );
  const [search, setSearch] = useQueryState(
    'search',
    parseAsString.withDefault(''),
  );
  const entity = kind === 'compromise' ? 'Threat' : 'Policy Violation';
  return (
    <>
      <Tabs
        className="p-1"
        value={entityOrFamily}
        onValueChange={(value) =>
          setEntityOrFamily(value as 'family' | 'threat')
        }
      >
        <Row className="w-full gap-2">
          <TabsList className="flex w-fit">
            <TabsTrigger value="threat">{entity}s</TabsTrigger>
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
        {entityOrFamily === 'family' ? (
          <>
            <Divider
              label="Active families"
              className="my-6"
            />
            <ActiveFamiliesList
              kind={kind}
              searchInput={search}
            />
            <Divider
              label="All families"
              className="my-6"
            />
            <FamiliesList
              kind={kind}
              searchInput={search}
            />
          </>
        ) : (
          <>
            <Divider
              label={
                kind === 'compromise' ? 'Active Threats' : 'Violated policies'
              }
              className="my-6"
            />
            <ActiveThreatsList
              kind={kind}
              searchInput={search}
            />
            <Divider
              label={`All ${entity}s`}
              className="my-6"
            />
            <ThreatsList
              kind={kind}
              searchInput={search}
            />
          </>
        )}
      </Tabs>
    </>
  );
};
