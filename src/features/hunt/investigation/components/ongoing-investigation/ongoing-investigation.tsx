import { Column } from '@/common/design-system/atoms/layout/column';
import { Row } from '@/common/design-system/atoms/layout/row';
import { Separator } from '@/common/design-system/atoms/ui/separator';

import { CancelStageOrInvestigation } from './ongoing-investigation.cancel';
import { CurrentStage } from './ongoing-investigation.current';
import { FindingsKeys } from './ongoing-investigation.findings';
import { SaveInvestigation } from './ongoing-investigation.save';
import { InvestigationStages } from './ongoing-investigation.stages';

export const Investigation = () => {
  return (
    <Column>
      <Row className="mb-2 items-center justify-between">
        <h2 className="text-sm font-bold">Investigation</h2>
      </Row>
      <InvestigationStages />
      <FindingsKeys />
      <CurrentStage />
      <Separator className="my-2" />
      <Column>
        <Row className="mt-2 gap-4">
          <CancelStageOrInvestigation />
          <SaveInvestigation />
        </Row>
      </Column>
    </Column>
  );
};
