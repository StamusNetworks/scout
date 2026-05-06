import { Copy, Download, EllipsisVertical } from 'lucide-react';
import { toPairs } from 'ramda';

import {
  downloadBlob,
  formatTo,
  formatToCsv,
  formatToHtmlTable,
  formatToMarkdown,
  saveToClipboard,
} from '@/common/lib/save';
import { cn } from '@/common/lib/utils';
import {
  ExportAction,
  selectEnabledActions,
  selectExportAction,
  selectExportFormat,
} from '@/features/preferences/state/preferences.slice';
import { useAppSelector } from '@/store/store';

import { Button } from '../atoms/ui/button';
import { ButtonGroup } from '../atoms/ui/button-group';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuIcon,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../atoms/ui/dropdown-menu';

export const actionTypes = {
  download: {
    label: 'Download',
    Icon: Download,
  },
  copy: {
    label: 'Copy',
    Icon: Copy,
  },
};

type Action = {
  label: string;
  action: (data: object[], headers?: string[]) => void;
};

export const downloadActions: Record<string, Action> = {
  csv: {
    label: 'CSV',
    action: (data, headers) => downloadBlob(formatToCsv(data, headers)),
  },
  tsv: {
    label: 'TSV',
    action: (data, headers) => downloadBlob(formatTo('\t', data, headers)),
  },
};
export const downloadActionsItems = toPairs(downloadActions).map(
  ([key, action]) => ({
    id: 'download-' + key,
    Icon: actionTypes.download.Icon,
    label: actionTypes.download.label + ' as ' + action.label,
    formatLabel: action.label,
    format: key,
    action: action.action,
  }),
);

export const copyActions: Record<string, Action> = {
  csv: {
    label: 'CSV',
    action: (data, headers) =>
      saveToClipboard(
        formatToCsv(data, headers),
        formatToHtmlTable(data, headers),
      ),
  },
  tsv: {
    label: 'TSV',
    action: (data, headers) =>
      saveToClipboard(
        formatTo('\t', data, headers),
        formatToHtmlTable(data, headers),
      ),
  },
  markdown: {
    label: 'Markdown',
    action: (data, headers) => saveToClipboard(formatToMarkdown(data, headers)),
  },
};
export const copyActionsItems = toPairs(copyActions).map(([key, action]) => ({
  id: 'copy-' + key,
  Icon: actionTypes.copy.Icon,
  label: actionTypes.copy.label + ' as ' + action.label,
  formatLabel: action.label,
  format: key,
  action: action.action,
}));

interface ExportButtonProps {
  data: object[];
  headers?: string[];
  className?: string;
  demo?: boolean;
}
export const ExportButton = ({
  data,
  headers,
  className,
  demo = false,
}: ExportButtonProps) => {
  const exportFormat = useAppSelector(selectExportFormat);
  const exportAction = useAppSelector(selectExportAction);
  const enabledActions = useAppSelector(selectEnabledActions);

  const handleDefaultAction = (data: object[], headers?: string[]) => {
    if (exportAction === 'download') {
      downloadActions[exportFormat].action(data, headers);
    } else {
      copyActions[exportFormat].action(data, headers);
    }
  };

  const DefaultIcon = actionTypes[exportAction].Icon;

  return (
    <ButtonGroup className={className}>
      <Button
        variant="outline"
        onClick={() => !demo && handleDefaultAction(data, headers)}
        className={className}
      >
        <DefaultIcon />
        {actionTypes[exportAction].label}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={cn('h-8 w-8', className)}
          >
            <EllipsisVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            {downloadActionsItems
              .filter((action) =>
                enabledActions.includes(action.id as ExportAction),
              )
              .map((action) => (
                <DropdownMenuItem
                  key={action.id}
                  onClick={() => !demo && action.action(data, headers)}
                >
                  <DropdownMenuIcon Icon={action.Icon} />
                  {action.label}
                </DropdownMenuItem>
              ))}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {copyActionsItems
              .filter((action) =>
                enabledActions.includes(action.id as ExportAction),
              )
              .map((action) => (
                <DropdownMenuItem
                  key={action.id}
                  onClick={() => !demo && action.action(data, headers)}
                >
                  <DropdownMenuIcon Icon={action.Icon} />
                  {action.label}
                </DropdownMenuItem>
              ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </ButtonGroup>
  );
};
