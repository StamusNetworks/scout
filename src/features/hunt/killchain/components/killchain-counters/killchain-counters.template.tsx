import { Column } from '@/common/design-system/atoms/layout/column';
import { Grid } from '@/common/design-system/atoms/layout/grid';
import { Card } from '@/common/design-system/atoms/ui/card';
import { cn } from '@/common/lib/utils';

import { killChainsConfig } from '../../killchain';
import { KCItem, KCTitle } from './killchain-counters.item';

export const KillChainCountersTemplate = ({
  data,
  className,
  onKCClick,
  isLoading,
}: {
  data?: { kill_chain: keyof typeof killChainsConfig; nb_assets: number }[];
  className?: string;
  onKCClick: (killchain: keyof typeof killChainsConfig) => void;
  isLoading: boolean;
}) => {
  const typedData = (data || []) as {
    kill_chain: keyof typeof killChainsConfig;
    nb_assets: number;
  }[];

  const items = [
    {
      title: 'Reconnaissance',
      value: typedData?.find((item) => item.kill_chain === 'reconnaissance')
        ?.nb_assets,
      variant: 'reconnaissance',
    },
    {
      title: 'Weaponization',
      value: typedData?.find((item) => item.kill_chain === 'weaponization')
        ?.nb_assets,
      variant: 'weaponization',
    },
    {
      title: 'Delivery',
      value: typedData?.find((item) => item.kill_chain === 'delivery')
        ?.nb_assets,
      variant: 'delivery',
    },
    {
      title: 'Exploitation',
      value: typedData?.find((item) => item.kill_chain === 'exploitation')
        ?.nb_assets,
      variant: 'exploitation',
    },
    {
      title: 'Installation',
      value: typedData?.find((item) => item.kill_chain === 'installation')
        ?.nb_assets,
      variant: 'installation',
    },
    {
      title: 'Command and Control',
      value: typedData?.find(
        (item) => item.kill_chain === 'command_and_control',
      )?.nb_assets,
      variant: 'command_and_control',
    },
    {
      title: 'Actions on Objectives',
      value: typedData?.find(
        (item) => item.kill_chain === 'actions_on_objectives',
      )?.nb_assets,
      variant: 'actions_on_objectives',
    },
  ];

  return (
    <Column className={cn('gap-2', className)}>
      <Card className="p-1 shadow-none">
        <Grid className="grid-cols-7 gap-[32px] overflow-clip rounded-lg">
          {items.map((item) => (
            <KCItem
              key={item.title}
              value={item.value || 0}
              variant={item.variant as keyof typeof killChainsConfig}
              onKCClick={onKCClick}
              isLoading={isLoading}
            />
          ))}
        </Grid>
      </Card>
      <Grid className="grid-cols-7">
        {items.map((item) => (
          <KCTitle
            key={item.title}
            value={item.title}
          />
        ))}
      </Grid>
    </Column>
  );
};
