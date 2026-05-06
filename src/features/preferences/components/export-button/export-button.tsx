import { EllipsisVertical } from 'lucide-react';

import { Button } from '@/common/design-system/atoms/ui/button';
import { ButtonGroup } from '@/common/design-system/atoms/ui/button-group';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuIcon,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/common/design-system/atoms/ui/dropdown-menu';
import { cn } from '@/common/lib/utils';
import { useAppSelector } from '@/store/store';

import {
  actionTypes,
  copyActions,
  copyActionsItems,
  downloadActions,
  downloadActionsItems,
} from '../../definitions/export-actions.config';
import {
  ExportAction,
  selectEnabledActions,
  selectExportAction,
  selectExportFormat,
} from '../../state/preferences.slice';

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
