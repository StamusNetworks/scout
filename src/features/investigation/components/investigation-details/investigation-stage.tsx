import { Column } from '@/common/design-system/atoms/layout/column';
import { Grid } from '@/common/design-system/atoms/layout/grid';
import { Row } from '@/common/design-system/atoms/layout/row';
import { Card } from '@/common/design-system/atoms/ui/card';
import { Separator } from '@/common/design-system/atoms/ui/separator';
import { LabelValue } from '@/common/design-system/molecules/label-value';
import { cn } from '@/common/lib/utils';
import { EventValue } from '@/features/query-filters/use-cases/interactive-value/event-value';
import {
  getFilterLabel,
  getFilterValue,
} from '@/features/query-filters/utils/get-filter-label';

import { InvestigationStage as InvestigationStageType } from '../../investigation.slice';
import { valueVariants } from '../ongoing-investigation/ongoing-investigation.current';

interface InvestigationStageProps {
  stage: InvestigationStageType;
  index: number;
  showOnlyKept: boolean;
}
export const InvestigationStage = ({
  stage,
  index,
  showOnlyKept,
}: InvestigationStageProps) => (
  <Column className="gap-2">
    <Row className="gap-8">
      <LabelValue
        label="Stage"
        value={index + 1}
      />
      <LabelValue
        label="Key"
        value={stage.key}
      />
      <LabelValue
        label="Comment"
        value={stage.comment}
      />
    </Row>
    <Grid className="grid-cols-4 gap-2">
      {stage.values
        .filter((v) => (showOnlyKept ? v.result === 'kept' : true))
        .map((value) => (
          <Card
            key={value.value}
            className={cn(
              valueVariants({
                status: value.result === 'kept' ? 'undefined' : 'ignored',
              }),
              'rounded-md p-1 px-2 text-sm',
            )}
          >
            <p
              className="line-clamp-2"
              title={getFilterValue(stage.key, value.value).toString()}
            >
              <EventValue
                query_key={stage.key}
                value={value.value}
                className="whitespace-pre-wrap text-inherit"
              />
              <Column className="mt-1 gap-1">
                {value.evidence.map((evidence) => (
                  <Column key={evidence.value}>
                    <p className="text-xs opacity-50">
                      {getFilterLabel(evidence.key)}
                    </p>
                    <p className="line-clamp-2">
                      {getFilterValue(evidence.key, evidence.value)}
                    </p>
                  </Column>
                ))}
              </Column>
            </p>
          </Card>
        ))}
    </Grid>
    <Separator className="my-2" />
  </Column>
);
