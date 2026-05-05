import { Row as TanstackRow } from '@tanstack/react-table';
import { useState } from 'react';

import { Column } from '@/common/design-system/atoms/layout/column';
import { Grid } from '@/common/design-system/atoms/layout/grid';
import { Row } from '@/common/design-system/atoms/layout/row';
import { Button } from '@/common/design-system/atoms/ui/button';
import { SwitchFilter } from '@/common/design-system/molecules/data-table/filters/switch-filter';
import { HtmlCodeDisplay } from '@/common/design-system/molecules/htmlCodeDisplay/htmlCodeDisplay';
import {
  DataEntry,
  ValueListCard,
} from '@/common/design-system/molecules/value-list-card';
import { useGetDashboardFieldsQuery } from '@/features/events';
import { KillchainTag } from '@/features/threats';
import { ThreatTag } from '@/features/threats';

import { Signature } from '../../model/signature';
import { SignatureAnalysis } from '../signature-analysis';
import { SignatureFlow } from '../signature-flow/signature-flow';
import { SignatureRulesetStatus } from '../signature-ruleset-status/signature-ruleset-status';
import { SignaturesTableTimeline } from '../signature-timeline';
import { useSignatureDetailsParams } from './signatures-table.utils';

type FieldStats = {
  'flow.src_ip': DataEntry[];
  'flow.dest_ip': DataEntry[];
  'stamus.asset': DataEntry[];
  'stamus.source': DataEntry[];
};

export const DetectionMethodsExpandedRow = ({
  row,
}: {
  row: TanstackRow<Signature>;
}) => <DetectionMethodExpandedRowTemplate detectionMethod={row.original} />;

export const DetectionMethodExpandedRowTemplate = ({
  detectionMethod,
}: {
  detectionMethod: Signature;
}) => {
  const [applyGlobalFilters, setApplyGlobalFilters] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const { data } = useCardsStats(detectionMethod.pk, applyGlobalFilters);
  const formattedData = data as FieldStats;

  return (
    <Column className="gap-3 p-2 text-sm">
      <Row className="justify-between">
        <div>
          {detectionMethod.method &&
            Object.keys(detectionMethod.method).length > 0 && (
              <Row className="mt-1 gap-2">
                Method for{' '}
                <ThreatTag
                  threat_id={detectionMethod.method!.threat_id}
                  kill_chain={detectionMethod.method.kill_chain}
                />{' '}
                in stage <KillchainTag kc={detectionMethod.method.kill_chain} />
              </Row>
            )}
        </div>
        <SignatureRulesetStatus pk={detectionMethod.pk} />
      </Row>

      {detectionMethod.versions?.length > 0 && (
        <SignatureAnalysis rule={detectionMethod.versions[0]} />
      )}

      <Row className="gap-4">
        <Button
          variant="outline"
          onClick={() => setShowOriginal((prev) => !prev)}
          size="sm"
          className="w-24"
        >
          {!showOriginal ? 'Show' : 'Hide'} raw
        </Button>
        <SwitchFilter
          value={applyGlobalFilters}
          setValue={setApplyGlobalFilters}
          title="Apply Global Filters"
        />
      </Row>
      <SignatureContent
        content={detectionMethod.versions[0].content_html}
        open={showOriginal}
      />
      <SignatureFlow
        sid={detectionMethod.pk}
        methodType={detectionMethod.method?.method_type}
        applyGlobalFilters={applyGlobalFilters}
      />
      <SignaturesTableTimeline
        sid={detectionMethod.pk}
        applyGlobalFilters={applyGlobalFilters}
      />
      <Grid className="grid-cols-4 gap-2">
        <ValueListCard
          es_key="src_ip"
          title="Source IP"
          data={formattedData?.['flow.src_ip']}
        />
        <ValueListCard
          es_key="dest_ip"
          title="Destination IP"
          data={formattedData?.['flow.dest_ip']}
        />
        <ValueListCard
          es_key="stamus.asset"
          title="Entity"
          data={formattedData?.['stamus.asset']}
        />
        <ValueListCard
          es_key="stamus.source"
          title="Source"
          data={formattedData?.['stamus.source']}
        />
      </Grid>
    </Column>
  );
};

const useCardsStats = (sid: number, applyGlobalFilter: boolean) => {
  const params = useSignatureDetailsParams(sid, applyGlobalFilter);
  return useGetDashboardFieldsQuery({
    ...params,
    fields: 'flow.src_ip,flow.dest_ip,stamus.asset,stamus.source',
  });
};

const SignatureContent = ({
  open,
  content,
}: {
  open: boolean;
  content: string;
}) => open && <HtmlCodeDisplay innerHtml={content} />;
