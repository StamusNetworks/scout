import { useNavigate } from '@tanstack/react-router';
import { GitGraph, Lock, ShieldAlert, Swords } from 'lucide-react';

import { BlockTitle } from '@/common/design-system/atoms/block';
import { Column } from '@/common/design-system/atoms/layout/column';
import { Grid } from '@/common/design-system/atoms/layout/grid';
import { IndicatorsDocDopv } from '@/features/operational-center/components/indicators/docdopv.indicators';
import { IndicatorsAppliancePreview } from '@/features/operational-center/components/indicators/indicators.preview';
import { CipherSecurity } from '@/features/operational-center/entities/cipher-security';
import { IndicidentsTable } from '@/features/operational-center/entities/incidents-table';
import { MitreTechniques } from '@/features/operational-center/entities/mitre-techniques';
import { OutliersTimeline } from '@/features/operational-center/entities/outliers-timeline';
import { useClearFilters } from '@/features/query-filters/hooks/use-clear-filters';
import { useEnableTags } from '@/features/query-filters/hooks/use-enable-tags';
import { KillChainCounters } from '@/features/threats/common/killchain/components/killchain-counters/killchain-counters';
import { OffendersWorldMap } from '@/features/threats/common/molecules/offenders-world-map/offenders-world-map';
interface OperationalCenterViewProps {
  enterprise: boolean;
}

export const OperationalCenterView = ({
  enterprise,
}: OperationalCenterViewProps) => {
  const navigate = useNavigate();
  const clearFilters = useClearFilters();
  const enableTags = useEnableTags();

  const handleClickOutliers = () => {
    enableTags({ novelty: true });
    clearFilters();
    navigate({ to: '/explorer' });
  };

  return (
    <>
      {enterprise ? <IndicatorsDocDopv /> : <IndicatorsAppliancePreview />}
      <div className="mb-4">
        <KillChainCounters />
      </div>
      <Grid className="grid-cols-2 gap-8">
        <Column className="gap-4">
          <Column>
            <BlockTitle className="mb-2">
              <ShieldAlert />
              New Incidents
            </BlockTitle>
            <IndicidentsTable />
          </Column>
          <Column>
            <BlockTitle className="mb-2">
              <Swords /> Offenders
            </BlockTitle>
            <OffendersWorldMap />
          </Column>
        </Column>
        <Column className="gap-4">
          <Column>
            <BlockTitle
              className="mb-2 cursor-pointer"
              onClick={handleClickOutliers}
            >
              <GitGraph />
              Outlier Events
            </BlockTitle>
            <OutliersTimeline />
          </Column>
          <Column className="w-full">
            <BlockTitle className="mb-2">
              <ShieldAlert />
              MITRE Techniques
            </BlockTitle>
            <MitreTechniques />
          </Column>
          <Column>
            <BlockTitle className="mb-2">
              <Lock />
              Cipher Security
            </BlockTitle>
            <CipherSecurity />
          </Column>
        </Column>
      </Grid>
    </>
  );
};
