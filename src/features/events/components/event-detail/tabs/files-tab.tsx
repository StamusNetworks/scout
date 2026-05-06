import { TabsBadge } from '@/common/design-system/atoms/ui/border-tabs';
import { Files } from '@/features/events/components/files-table/files-table';

import { TabComponentType } from '../event-detail-tabs.types';

export const FilesTab: TabComponentType = () => null;

FilesTab.tabConfig = (_props, { files }) => {
  if (files.length === 0) return null;

  return {
    id: 'files',
    label: (
      <>
        Files{' '}
        <TabsBadge
          count={files.length}
          isLoading={false}
        />
      </>
    ),
    content: <Files files={files} />,
  };
};
