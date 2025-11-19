import { Column } from '@/common/design-system/atoms/layout/column';
import { Grid } from '@/common/design-system/atoms/layout/grid';
import { Row } from '@/common/design-system/atoms/layout/row';
import { Card } from '@/common/design-system/atoms/ui/card';
import { DateTime } from '@/common/design-system/entities/date-time';
import { CheckboxValue } from '@/common/design-system/molecules/checkbox-value';
import { LabelValue } from '@/common/design-system/molecules/label-value';
import { cn } from '@/common/lib/utils';
import { EventValue } from '@/features/hunt/filtering/query-filters/components/event-value/event-value';
import { QueryFilterState } from '@/features/hunt/filtering/query-filters/model/query-filter';
import { TagFilters } from '@/features/hunt/filtering/query-filters/store/query-filters.slice';
import { getFilterLabel } from '@/features/hunt/filtering/query-filters/utils/get-filter-label';

import { valueVariants } from '../ongoing-investigation/ongoing-investigation.current';

interface InvestigationParamsProps {
  startDate: number;
  endDate: number;
  tags: TagFilters;
  qfilter: QueryFilterState[];
  comment?: string;
}
export const InvestigationParams = ({
  startDate,
  endDate,
  tags,
  comment,
  qfilter,
}: InvestigationParamsProps) => (
  <Column className="gap-4">
    <Row className="gap-8">
      <LabelValue
        label="Start date"
        value={<DateTime date={startDate} />}
      />
      <LabelValue
        label="End date"
        value={<DateTime date={endDate} />}
      />
      <LabelValue
        label="Events types"
        value={
          <Column className="mt-1 gap-1">
            <CheckboxValue
              checked={tags.alert}
              label="Alerts"
            />
            <CheckboxValue
              checked={tags.stamus}
              label="Stamus"
            />
            <CheckboxValue
              checked={tags.discovery}
              label="Sightings"
            />
          </Column>
        }
      />
      <LabelValue
        label="Alert tags"
        value={
          <Column className="mt-1 gap-1">
            <CheckboxValue
              checked={tags.informational}
              label="Informational"
            />
            <CheckboxValue
              checked={tags.relevant}
              label="Relevant"
            />
            <CheckboxValue
              checked={tags.untagged}
              label="Untagged"
            />
          </Column>
        }
      />
      <LabelValue
        label="Other"
        value={
          <Column className="mt-1 gap-1">
            <CheckboxValue
              checked={tags.novelty}
              label="Outlier events"
            />
          </Column>
        }
      />
      {comment && (
        <LabelValue
          label="Comment"
          value={comment}
        />
      )}
    </Row>
    {qfilter.length > 0 && (
      <LabelValue
        label="Query filters"
        value={
          <Grid className="mt-1 grid-cols-4 gap-2">
            {qfilter.map((filter, i) => {
              return (
                <Card
                  key={i}
                  className={cn(
                    'cursor-default rounded-md p-2 py-1',
                    valueVariants({
                      status: filter.is_suspended ? 'ignored' : 'undefined',
                    }),
                  )}
                >
                  <label className="text-xs font-medium opacity-50">
                    {getFilterLabel(filter.key)}
                  </label>
                  <EventValue
                    query_key={filter.key}
                    value={filter.value}
                    className="whitespace-pre-wrap text-inherit"
                  />
                </Card>
              );
            })}
          </Grid>
        }
      />
    )}
  </Column>
);
