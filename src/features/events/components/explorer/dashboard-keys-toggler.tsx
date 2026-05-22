import { Blocks } from 'lucide-react';

import { Column } from '@/common/design-system/atoms/layout/column';
import { Grid } from '@/common/design-system/atoms/layout/grid';
import { Button } from '@/common/design-system/atoms/ui/button';
import { Checkbox } from '@/common/design-system/atoms/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/common/design-system/atoms/ui/dialog';
import { useFeatureFlags } from '@/common/lib/use-feature-flags';
import { useAppDispatch, useAppSelector } from '@/store/store';

import {
  CEdashboard,
  dashboard,
  DashboardPanel,
} from '../../definitions/dashboard.config';
import { selectDisabledKeys } from '../../state/dashboard.selectors';
import { toggleDisabledKey } from '../../state/dashboard.slice';

export const DashboardKeysToggler = ({
  panelId,
}: {
  panelId: keyof typeof dashboard;
}) => {
  const { enterprise } = useFeatureFlags();
  const config: DashboardPanel | undefined = enterprise
    ? dashboard[panelId]
    : CEdashboard[panelId];
  const disabledKeys = useAppSelector(selectDisabledKeys);
  const dispatch = useAppDispatch();

  if (!config) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon-xs"
          className="text-muted-foreground hover:text-foreground"
          data-testid="toggle-dashboard-keys"
        >
          <Blocks />
        </Button>
      </DialogTrigger>
      <DialogContent aria-describedby={undefined}>
        <DialogTitle>{config.title}</DialogTitle>
        <Grid className="grid-cols-2 gap-4">
          {config.items.map((item) => (
            <label
              key={item.i}
              className="flex items-center gap-2"
            >
              <Checkbox
                checked={!disabledKeys.includes(item.i)}
                onCheckedChange={() => dispatch(toggleDisabledKey(item.i))}
              />
              <Column className="gap-0 truncate leading-none">
                <span>{item.title}</span>
                <span
                  title={item.i}
                  className="text-muted-foreground truncate text-sm leading-none"
                >
                  {item.i}
                </span>
              </Column>
            </label>
          ))}
        </Grid>
      </DialogContent>
    </Dialog>
  );
};
