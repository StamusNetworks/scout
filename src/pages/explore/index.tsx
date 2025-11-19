import { DefaultPage } from '@/common/design-system/atoms/default-page';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/common/design-system/atoms/ui/borderTabs';

export const ExplorePage = () => {
  return (
    <DefaultPage title="Explore">
      <Tabs>
        <TabsTrigger value="threats">Raw</TabsTrigger>
        <TabsList>
          <TabsContent value="threats"></TabsContent>
        </TabsList>
      </Tabs>
    </DefaultPage>
  );
};
