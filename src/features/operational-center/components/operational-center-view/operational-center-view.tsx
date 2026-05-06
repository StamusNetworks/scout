import { useNavigate } from '@tanstack/react-router';
import { GitGraph, Lock, ShieldAlert, Swords } from 'lucide-react';

import { BlockTitle } from '@/common/design-system/atoms/block';
import { Column } from '@/common/design-system/atoms/layout/column';
import { Grid } from '@/common/design-system/atoms/layout/grid';
import { useClearFilters } from '@/features/query-filters/hooks/use-clear-filters';
import { useEnableFilterFlags } from '@/features/query-filters/hooks/use-enable-filter-flags';
import { KillChainCounters, OffendersWorldMap } from '@/features/threats';

import { CipherSecurity } from '../cipher-security/cipher-security';
import { IndicidentsTable } from '../incidents-table/incidents-table';
import { IndicatorsDocDopv } from '../indicators/docdopv.indicators';
import { IndicatorsAppliancePreview } from '../indicators/indicators.preview';
import { MitreTechniques } from '../mitre-techniques/mitre-techniques';
import { OutliersTimeline } from '../outliers-timeline/outliers-timeline';
interface OperationalCenterViewProps {
  enterprise: boolean;
}

export const OperationalCenterView = ({
  enterprise,
}: OperationalCenterViewProps) => {
  const navigate = useNavigate();
  const clearFilters = useClearFilters();
  const enableTags = useEnableFilterFlags();

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
