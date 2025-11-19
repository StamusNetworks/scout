import { Row as TanstackRow } from '@tanstack/react-table';

import { Column } from '@/common/design-system/atoms/layout/column';
import { Grid } from '@/common/design-system/atoms/layout/grid';
import { Row } from '@/common/design-system/atoms/layout/row';
import {
  DataEntry,
  ValueListCard,
} from '@/common/design-system/molecules/value-list-card';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { useGetDashboardFieldsQuery } from '@/features/hunt/dashboard/api/dashboard.api';
import { useQFBuilder } from '@/features/hunt/filtering/query-filters/hooks/use-qf-builder';
import { KillchainTag } from '@/features/hunt/killchain/components/killchain-tag';
import { ThreatTag } from '@/features/hunt/threats/components/threat-tag';
import { useThreat } from '@/features/hunt/threats/hooks/use-threat';

import { Signature } from '../../model/signature';
import { SignatureAnalysis } from '../signature-analysis';
import { SignatureFlow } from '../signature-flow/signature-flow';
import { SignatureRulesetStatus } from '../signature-ruleset-status/signature-ruleset-status';
import { SignaturesTableTimeline } from '../signature-timeline';

type FieldStats = {
  src_ip: DataEntry[];
  dest_ip: DataEntry[];
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
  const { data } = useCardsStats(detectionMethod.pk);
  const formattedData = data as FieldStats;
  const { data: currentThreat } = useThreat(detectionMethod.method!.threat_id);

  const threat = {
    threat__threat_id: currentThreat?.pk || 0,
    threat__name: currentThreat?.name || '',
    threat__family__family_id: currentThreat?.family || 0,
    kill_chain: detectionMethod?.method?.kill_chain || 1,
    kill_chain_offender: 0,
  };
  return (
    <Column className="bg-card gap-3 p-2">
      <Row className="justify-between">
        <div>
          {detectionMethod.method &&
            Object.keys(detectionMethod.method).length > 0 && (
              <Row className="mt-1 gap-2">
                Method for <ThreatTag threat={threat} /> in stage{' '}
                <KillchainTag kc={detectionMethod.method.kill_chain} />
              </Row>
            )}
        </div>
        <SignatureRulesetStatus pk={detectionMethod.pk} />
      </Row>

      {detectionMethod.versions?.length > 0 && (
        <SignatureAnalysis rule={detectionMethod.versions[0]} />
      )}
      <SignaturesTableTimeline sid={detectionMethod.pk} />
      <Grid className="grid-cols-4 gap-2">
        <ValueListCard
          es_key="src_ip"
          title="Source IP"
          data={formattedData?.src_ip}
        />
        <ValueListCard
          es_key="dest_ip"
          title="Destination IP"
          data={formattedData?.dest_ip}
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
      <SignatureFlow
        sid={detectionMethod.pk}
        methodType={detectionMethod.method?.method_type}
      />
    </Column>
  );
};

const useCardsStats = (sid: number) => {
  const QFBuilder = useQFBuilder();
  const params = useGlobalQueryParams(['tenant', 'dates', 'qfilter']);
  return useGetDashboardFieldsQuery({
    ...params,
    fields: 'src_ip,dest_ip,stamus.asset,stamus.source',
    qfilter: QFBuilder.toQFString([
      QFBuilder.createFilter('alert.signature_id', sid),
    ]),
  });
};
