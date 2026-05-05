import { Column } from '@/common/design-system/atoms/layout/column';
import { Grid } from '@/common/design-system/atoms/layout/grid';
import { Card } from '@/common/design-system/atoms/ui/card';
import { cn } from '@/common/lib/utils';

import {
  KILL_CHAIN_PHASES,
  KILL_CHAIN_PHASES_KEYS_WITHOUT_POLICIES,
  KillChainCountersData,
  KillChainPhase,
} from '../../model/kill-chain';
import { KCItem, KCTitle } from './kill-chain-counters.item';

export const KillChainCountersTemplate = ({
  data,
  className,
  onKCClick,
  isLoading,
}: {
  data?: KillChainCountersData;
  className?: string;
  onKCClick: (killchain: KillChainPhase) => void;
  isLoading: boolean;
}) => {
  return (
    <Column className={cn('gap-2', className)}>
      <Card className="p-1 shadow-none">
        <Grid className="grid-cols-7 gap-[32px] overflow-clip rounded-lg">
          {KILL_CHAIN_PHASES_KEYS_WITHOUT_POLICIES.map((phase) => (
            <KCItem
              key={phase}
              value={data?.[phase] ?? 0}
              variant={phase}
              onKCClick={onKCClick}
              isLoading={isLoading}
            />
          ))}
        </Grid>
      </Card>
      <Grid className="grid-cols-7">
        {KILL_CHAIN_PHASES_KEYS_WITHOUT_POLICIES.map((phase) => (
          <KCTitle
            key={phase}
            value={KILL_CHAIN_PHASES[phase].name}
          />
        ))}
      </Grid>
    </Column>
  );
};
