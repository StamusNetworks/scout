import {
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from '@radix-ui/react-icons';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Copy,
  Crosshair,
  Download,
  DownloadIcon,
  EllipsisVertical,
  List,
  Search,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useState } from 'react';

import { Column } from '@/common/design-system/atoms/layout/column';
import { Row } from '@/common/design-system/atoms/layout/row';
import { Button } from '@/common/design-system/atoms/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/common/design-system/atoms/ui/card';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/common/design-system/atoms/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuIcon,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/common/design-system/atoms/ui/dropdown-menu';
import { ScrollArea } from '@/common/design-system/atoms/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/common/design-system/atoms/ui/select';
import { Skeleton } from '@/common/design-system/atoms/ui/skeleton';
import { Spin } from '@/common/design-system/atoms/ui/spin';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/common/design-system/atoms/ui/tooltip';
import { FormattedBadge } from '@/common/design-system/molecules/formatted-badge';
import { downloadBlob, formatToCsv, saveToClipboard } from '@/common/lib/save';
import { cn } from '@/common/lib/utils';
import {
  addFindingsKey,
  selectInvestigationStage,
  selectIsActiveFindings,
  startInvestigation,
} from '@/features/investigation/investigation.slice';
import { EventValue } from '@/features/query-filters/components/interactive-value/event-value';
import { useAppDispatch, useAppSelector } from '@/store/store';

import { useDashboard } from '../../hooks/use-dashboard';
import { useFieldsStats } from '../../hooks/use-fields-stats';
import { selectOrdering } from '../../state/dashboard.selectors';

export type DataEntry = {
  key: string;
  doc_count: number;
};

const selectDashboardData =
  (key: string) =>
  (data: Record<string, DataEntry[]> = {}) =>
    data[key];

export const ValueListCard = ({
  es_key,
  title,
  tooltip,
}: {
  es_key: string;
  title: string;
  tooltip: string;
}) => {
  const dispatch = useAppDispatch();

  const investigationStage = useAppSelector(selectInvestigationStage);
  const isActiveIoc = useAppSelector(selectIsActiveFindings(es_key));

  const { data: dashboardData } = useDashboard();
  const data =
    selectDashboardData(es_key)(dashboardData as Record<string, DataEntry[]>) ||
    [];

  const [viewMoreDialogOpen, setViewMoreDialogOpen] = useState(false);

  const actionDisabled = data?.length === 0;

  const header = [title, 'hits'];
  const handleDownload = () => {
    if (actionDisabled) return;
    downloadBlob(formatToCsv(data, header));
  };
  const handleCopy = () => {
    if (actionDisabled) return;
    saveToClipboard(formatToCsv(data, header));
  };

  return (
    <Card
      className={cn(
        'h-full rounded-none border-0',
        data.length === 0 && 'opacity-20',
        isActiveIoc && 'text-red-700',
      )}
    >
      <CardHeader className="flex flex-row items-center space-y-0 overflow-hidden p-4 text-nowrap text-ellipsis">
        <CardTitle className="flex w-full items-center text-sm font-bold">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>{title}</TooltipTrigger>
              <TooltipContent className="max-w-56">{tooltip}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        <Dialog
          open={viewMoreDialogOpen}
          onOpenChange={setViewMoreDialogOpen}
        >
          <DropdownMenu>
            <DropdownMenuTrigger data-testid="dashboard-card-dropdown-trigger">
              <EllipsisVertical className="text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                disabled={actionDisabled}
                data-testid="dashboard-card-dropdown-item-view-all"
              >
                <DialogTrigger className="flex items-center">
                  <DropdownMenuIcon Icon={List} /> View all
                </DialogTrigger>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  dispatch(
                    startInvestigation({
                      key: es_key,
                      values: data.map((d) => d.key),
                    }),
                  )
                }
                disabled={
                  actionDisabled ||
                  (investigationStage !== 'idle' && investigationStage !== null)
                }
                data-testid="dashboard-card-dropdown-item-investigate"
              >
                <DropdownMenuIcon Icon={Search} />{' '}
                {investigationStage === 'idle'
                  ? 'Continue investigation'
                  : 'Investigate'}
              </DropdownMenuItem>
              {investigationStage !== null && (
                <DropdownMenuItem
                  onClick={() => dispatch(addFindingsKey(es_key))}
                  disabled={actionDisabled}
                  data-testid="dashboard-card-dropdown-item-copy"
                >
                  <DropdownMenuIcon Icon={Crosshair} /> Add to Findings list
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={handleCopy}
                disabled={actionDisabled}
                data-testid="dashboard-card-dropdown-item-copy"
              >
                <DropdownMenuIcon Icon={Copy} /> Copy
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDownload}
                disabled={actionDisabled}
                data-testid="dashboard-card-dropdown-item-download"
              >
                <DropdownMenuIcon Icon={Download} /> Export
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DialogContent className="flex max-h-[80vh] w-fit max-w-screen min-w-lg overflow-hidden p-0 pr-0.5">
            <ScrollArea className="overflow-auto p-4 pb-2">
              <ViewAll
                es_key={es_key}
                title={title}
              />
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="px-4 pb-3">
        <AnimatePresence mode="popLayout">
          {data?.map((item) => (
            <motion.div
              key={item.key}
              className="mb-1 flex w-full justify-between gap-1 text-sm last:mb-0"
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
              <EventValue
                query_key={es_key}
                value={item.key}
              />
              <FormattedBadge
                className="rounded-full"
                variant="secondary"
                value={item.doc_count}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

const pageSizeOptions = [20, 50, 100];

const ViewAll = ({ es_key, title }: { es_key: string; title: string }) => {
  const ordering = useAppSelector(selectOrdering);
  const { data: allData, isFetching: isLoadingAllData } = useFieldsStats(
    `${ordering === 'ascending' ? '-' : ''}${es_key}`,
    { page_size: 100000000 },
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(pageSizeOptions[0]);
  const pages = allData?.[es_key]
    ? Math.ceil(allData?.[es_key]?.length / pageSize)
    : 0;
  const handlePageSizeChange = useCallback(
    (value: string) => {
      const newValue = parseInt(value);
      const totalItems = allData?.[es_key]?.length || 0;
      const firstItemIndex = (currentPage - 1) * pageSize;
      const newPage = Math.floor(firstItemIndex / newValue) + 1;
      setPageSize(newValue);
      setCurrentPage(
        newPage > 0 ? Math.min(newPage, Math.ceil(totalItems / newValue)) : 1,
      );
    },
    [currentPage, pageSize, allData, es_key],
  );

  const header = [title, 'hits'];
  const handleDownload = () => {
    if (!allData?.[es_key]?.length) return;
    downloadBlob(formatToCsv(allData[es_key], header));
  };
  const handleCopy = () => {
    if (!allData?.[es_key]?.length) return;
    saveToClipboard(formatToCsv(allData[es_key], header));
  };

  return (
    <Column>
      <Row className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          {title}{' '}
          {isLoadingAllData ? (
            <Spin className="h-5 w-5 animate-spin" />
          ) : (
            `(${allData?.[es_key]?.length})`
          )}
        </h2>
        <Row className="gap-2">
          <Button
            variant="outline"
            onClick={handleCopy}
            disabled={!allData?.[es_key]?.length}
          >
            <Copy />
            Copy
          </Button>
          <Button
            variant="outline"
            onClick={handleDownload}
            disabled={!allData?.[es_key]?.length}
          >
            <DownloadIcon />
            Export
          </Button>
        </Row>
      </Row>
      {isLoadingAllData &&
        [...Array(6).keys()].map((_, i) => (
          <Row
            key={i}
            className="mb-1 flex justify-between"
          >
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-5 w-8 rounded-full" />
          </Row>
        ))}
      {allData?.[es_key]
        ?.slice((currentPage - 1) * pageSize, currentPage * pageSize)
        .map((item, i) => (
          <motion.div
            key={item.key + i}
            className="mb-1 flex w-full justify-between gap-4 text-sm last:mb-0"
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
            <EventValue
              query_key={es_key}
              value={item.key}
            />
            <FormattedBadge
              className="rounded-full"
              variant="secondary"
              value={item.doc_count}
            />
          </motion.div>
        ))}
      <Row className="mt-4 -translate-y-1 items-center justify-end gap-2">
        <Row className="items-center gap-2">
          <span className="text-sm">Per page</span>
          <Select
            value={pageSize.toString()}
            onValueChange={handlePageSizeChange}
          >
            <SelectTrigger className="h-8 w-fit">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((option) => (
                <SelectItem
                  key={option}
                  value={option.toString()}
                >
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Row>
        <Button
          variant="outline"
          className="hidden h-8 w-8 p-0 lg:flex"
          onClick={() => setCurrentPage(1)}
          disabled={currentPage === 1}
        >
          <span className="sr-only">Go to first page</span>
          <DoubleArrowLeftIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <span className="sr-only">Go to previous page</span>
          <ChevronLeftIcon className="h-4 w-4" />
        </Button>
        <Select
          value={currentPage.toString()}
          onValueChange={(value) => setCurrentPage(parseInt(value))}
        >
          <SelectTrigger className="h-8 w-fit">
            <SelectValue />
            <span className="w-1.5" />
          </SelectTrigger>
          <SelectContent>
            {[...Array(pages)].map((_, i) => (
              <SelectItem
                key={i}
                value={(i + 1).toString()}
              >
                {i + 1}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === pages}
        >
          <span className="sr-only">Go to next page</span>
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="hidden h-8 w-8 p-0 lg:flex"
          onClick={() => setCurrentPage(pages)}
          disabled={currentPage === pages}
        >
          <span className="sr-only">Go to last page</span>
          <DoubleArrowRightIcon className="h-4 w-4" />
        </Button>
      </Row>{' '}
    </Column>
  );
};
