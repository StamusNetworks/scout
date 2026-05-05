import { Copy, Download, EllipsisVertical } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/common/design-system/atoms/ui/card';
import { downloadBlob, formatToCsv, saveToClipboard } from '@/common/lib/save';
import { EventValue } from '@/features/query-filters/components/interactive-value/event-value';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuIcon,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../atoms/ui/dropdown-menu';
import { FormattedBadge } from './formatted-badge';

export type DataEntry = {
  key: string;
  doc_count: number;
};

export const ValueListCard = ({
  es_key,
  title,
  data,
  maxItems,
}: {
  es_key: string;
  title: string;
  data: DataEntry[] | undefined;
  maxItems?: number;
}) => {
  const header = [title, 'hits'];
  const disabled = !data?.length;
  const handleDownload = () => {
    if (disabled) return;
    downloadBlob(formatToCsv(data, header));
  };
  const handleCopy = () => {
    if (disabled) return;
    saveToClipboard(formatToCsv(data, header));
  };
  const slicedData = maxItems ? data?.slice(0, maxItems) : data;
  return (
    <Card className={`h-full rounded-md ${data?.length === 0 && 'opacity-20'}`}>
      <CardHeader className="flex flex-row items-center space-y-0 overflow-hidden py-3 pr-4 pl-2 text-nowrap text-ellipsis">
        <CardTitle className="flex w-full items-center justify-between text-sm font-bold">
          <span>
            {title}
            {/* {` (${Math.round(Math.random() * 1000)})`} */}
          </span>
          {/* <FormattedBadge
            variant="default"
            className="rounded-full"
            value={Math.round(Math.random() * 1000)}
            /> */}
        </CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger
            data-testid="dashboard-card-dropdown-trigger"
            disabled={disabled}
          >
            <EllipsisVertical className="text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={handleCopy}
              disabled={disabled}
              data-testid="dashboard-card-dropdown-item-copy"
            >
              <DropdownMenuIcon Icon={Copy} /> Copy
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDownload}
              disabled={disabled}
              data-testid="dashboard-card-dropdown-item-download"
            >
              <DropdownMenuIcon Icon={Download} /> Export
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="px-4 pb-3">
        <AnimatePresence mode="popLayout">
          {slicedData?.map((item) => (
            <motion.div
              key={item.key}
              className="mb-1 flex w-full justify-between gap-1 last:mb-0"
              layout
              initial={{ opacity: 0, x: -200, scale: 0.5 }}
              animate={{
                opacity: 1,
                x: 0,
                scale: 1,
                transition: { delay: 0.35 },
              }}
              exit={{ opacity: 0, x: 200, scale: 0.5 }}
              transition={{ duration: 0.5, type: 'spring' }}
            >
              <EventValue
                query_key={es_key}
                value={item.key}
                className="text-sm"
              />
              <FormattedBadge
                className="rounded-full"
                variant="secondary"
                value={item.doc_count}
              />
            </motion.div>
          ))}
          {!!data && maxItems && data?.length > maxItems && (
            <motion.div
              key="more"
              className="mb-1 flex w-full justify-between gap-1 last:mb-0"
              layout
              initial={{ opacity: 0, x: -200, scale: 0.5 }}
              animate={{
                opacity: 1,
                x: 0,
                scale: 1,
              }}
              exit={{ opacity: 0, x: 200, scale: 0.5 }}
              transition={{ duration: 0.5, type: 'spring' }}
            >
              <p className="text-muted-foreground text-sm">
                +{data?.length - maxItems}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};
