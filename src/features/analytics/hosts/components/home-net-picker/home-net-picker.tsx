import { parseAsStringLiteral, useQueryState } from 'nuqs';

import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/common/design-system/atoms/ui/pillTabs';

export const HomeNetPicker = () => {
  const [inHomeNet, setInHomeNet] = useQueryState(
    'in_home_net',
    parseAsStringLiteral(['true', 'false', 'all']).withDefault('all'),
  );
  console.log(inHomeNet);
  return (
    <Tabs
      value={inHomeNet}
      onValueChange={(value) => setInHomeNet(value as 'true' | 'false' | 'all')}
    >
      <TabsList>
        <TabsTrigger value="true">Internal</TabsTrigger>
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="false">External</TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
