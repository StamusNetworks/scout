import { Row } from '@tanstack/react-table';

import { Grid } from '@/common/design-system/atoms/layout/grid';

import { Host } from '../../model/host';
import { HostBlock } from '../host-insights/hostBlock';
import { getBlocks } from '../host-insights/hostBlock/hostBlock.config';

export const HostsTableExpandedRow = ({ row }: { row: Row<Host> }) => {
  const blocks = getBlocks(row.original);
  return (
    <Grid className="grid-cols-[repeat(auto-fill,minmax(32rem,1fr))] gap-2 p-2">
      {blocks
        .filter((block) => block.data?.length)
        .map((block) => (
          <HostBlock
            key={block.title}
            title={block.title + ` (${block.data?.length})`}
            data={block.data}
            filterId={block.filter}
            type={block.type as 'default' | 'expandable'}
            Icon={block.Icon}
          />
        ))}
    </Grid>
  );
};
