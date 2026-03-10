import { parseAsString, parseAsStringLiteral, useQueryState } from 'nuqs';

import { Row } from '@/common/design-system/atoms/layout/row';
import { Divider } from '@/common/design-system/atoms/ui/divider';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/common/design-system/atoms/ui/pillTabs';
import { TextFilter } from '@/common/design-system/molecules/data-table/filters/text-filter';
import { ActiveFamiliesList } from '@/features/hunt/threats/templates/active-families-list';
import { ActiveThreatsList } from '@/features/hunt/threats/templates/active-threats-list';
import { FamiliesList } from '@/features/hunt/threats/templates/threat-families-list';

import { ThreatsList } from './threats-list';

export const CoveragePage = ({
  familyClass,
}: {
  familyClass: 'doc' | 'dopv';
}) => {
  const [entityOrFamily, setEntityOrFamily] = useQueryState(
    'show',
    parseAsStringLiteral(['threat', 'family']).withDefault('threat'),
  );
  const [search, setSearch] = useQueryState(
    'search',
    parseAsString.withDefault(''),
  );
  const entity = familyClass === 'doc' ? 'Threat' : 'Policy Violation';
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
              familyClass={familyClass}
              searchInput={search}
            />
            <Divider
              label="All families"
              className="my-6"
            />
            <FamiliesList
              familyClass={familyClass}
              searchInput={search}
            />
          </>
        ) : (
          <>
            <Divider
              label={
                familyClass === 'doc' ? 'Active Threats' : 'Violated policies'
              }
              className="my-6"
            />
            <ActiveThreatsList
              familyClass={familyClass}
              searchInput={search}
            />
            <Divider
              label={`All ${entity}s`}
              className="my-6"
            />
            <ThreatsList
              familyClass={familyClass}
              searchInput={search}
            />
          </>
        )}
      </Tabs>
    </>
  );
};
