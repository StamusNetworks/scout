import { parseAsStringLiteral, useQueryState } from 'nuqs';

import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/common/design-system/atoms/ui/pillTabs';

export const HomeNetPicker = () => {
  const [inHomeNet, setInHomeNet] = useQueryState(
    'in_home_net',
    parseAsStringLiteral(['internal', 'external', 'all']).withDefault('all'),
  );
  return (
    <Tabs
      value={inHomeNet}
      onValueChange={(value) =>
        setInHomeNet(value as 'internal' | 'external' | 'all')
      }
    >
      <TabsList>
        <TabsTrigger value="true">Internal</TabsTrigger>
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="false">External</TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
