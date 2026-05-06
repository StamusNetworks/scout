import { Column } from '@/common/design-system/atoms/layout/column';
import { Grid } from '@/common/design-system/atoms/layout/grid';
import { Row } from '@/common/design-system/atoms/layout/row';
import { Card } from '@/common/design-system/atoms/ui/card';
import { CheckboxValue } from '@/common/design-system/molecules/checkbox-value';
import { LabelValue } from '@/common/design-system/molecules/label-value';
import { useFeatureFlags } from '@/common/lib/use-feature-flags';
import { cn } from '@/common/lib/utils';
import { DateTime } from '@/features/preferences';
import { EventValue } from '@/features/query-filters/components/interactive-value/event-value';
import { type SerializedFilterFlags } from '@/features/query-filters/model/filter-flags';
import { QueryFilterState } from '@/features/query-filters/model/query-filter';
import { getFilterLabel } from '@/features/query-filters/utils/get-filter-label';

import { valueVariants } from '../ongoing-investigation/ongoing-investigation.current';

interface InvestigationParamsProps {
  startDate: number;
  endDate: number;
  flags?: SerializedFilterFlags | null;
  qfilter: QueryFilterState[];
  comment?: string;
}
export const InvestigationParams = ({
  startDate,
  endDate,
  flags,
  comment,
  qfilter,
}: InvestigationParamsProps) => {
  const { enterprise } = useFeatureFlags();
  return (
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
        {enterprise && flags && (
          <>
            <LabelValue
              label="Events types"
              value={
                <Column className="mt-1 gap-1">
                  <CheckboxValue
                    checked={flags.alert}
                    label="Alerts"
                  />
                  <CheckboxValue
                    checked={flags.stamus}
                    label="Stamus"
                  />
                  <CheckboxValue
                    checked={flags.discovery}
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
                    checked={flags.informational}
                    label="Informational"
                  />
                  <CheckboxValue
                    checked={flags.relevant}
                    label="Relevant"
                  />
                  <CheckboxValue
                    checked={flags.untagged}
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
                    checked={flags.novelty}
                    label="Outlier events"
                  />
                </Column>
              }
            />
          </>
        )}

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
                        status: filter.isSuspended ? 'ignored' : 'undefined',
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
};
