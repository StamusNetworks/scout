import { Copy, Download, EllipsisVertical, LucideIcon } from 'lucide-react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/common/design-system/atoms/ui/card';
import { downloadBlob, formatToCsv, saveToClipboard } from '@/common/lib/save';
import { cn } from '@/common/lib/utils';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuIcon,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../atoms/ui/dropdown-menu';

export const TableCard = ({
  title,
  children,
  Icon,
  className,
  data,
  headers,
  dropdown = true,
  style,
}: {
  title: string | React.ReactNode;
  Icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
  dropdown?: boolean;
  data?: object[];
  headers?: string[];
  style?: React.CSSProperties;
}) => {
  const disabled = !data?.length;
  const handleDownload = () => {
    if (disabled) return;
    downloadBlob(formatToCsv(data, headers));
  };
  const handleCopy = () => {
    if (disabled) return;
    saveToClipboard(formatToCsv(data, headers));
  };
  return (
    <Card
      className={cn('rounded-md text-sm', className)}
      style={style}
    >
      {typeof title === 'string' ? (
        <CardHeader className="mb-1 flex flex-row items-center justify-between space-y-0 overflow-hidden p-3 pb-0 text-nowrap text-ellipsis">
          <CardTitle className="flex items-center">
            {Icon && <Icon className="mr-2" />} {title}
          </CardTitle>
          {dropdown && (
            <DropdownMenu>
              <DropdownMenuTrigger data-testid="dashboard-card-dropdown-trigger">
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
          )}
        </CardHeader>
      ) : (
        title
      )}
      <CardContent className="px-3 pt-0 pb-2">{children}</CardContent>
    </Card>
  );
};
