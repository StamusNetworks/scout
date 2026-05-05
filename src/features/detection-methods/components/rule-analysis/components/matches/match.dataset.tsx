import { Grid } from '@/common/design-system/atoms/layout/grid';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/common/design-system/atoms/ui/tooltip';

import { DatasetMatch } from '../../../../model/analysis';
import { Badge } from '../badge';
import { LabelValue } from '../label-value';
import { Match, MatchContent, MatchLabel, MatchName } from './match';

interface DatasetMatchProps {
  dataset: DatasetMatch['dataset'];
}

export const DatasetMatchTemplate = ({ dataset }: DatasetMatchProps) => {
  return (
    <Match>
      <MatchLabel>
        <MatchName>Dataset</MatchName>
        <Badge>{dataset.cmd}</Badge>
      </MatchLabel>
      <MatchContent className="flex">
        <span className="mr-2">{dataset.name}</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="text-muted-foreground text-xs">
              (view more)
            </TooltipTrigger>
            <TooltipContent className="space-y-2 py-3">
              <Grid className="grid-cols-2">
                <LabelValue
                  label="Cmd"
                  value={dataset.cmd}
                />
                <LabelValue
                  label="Type"
                  value={dataset.type}
                />
              </Grid>
              <LabelValue
                label="Load"
                value={getString(dataset.load)}
              />
              <LabelValue
                label="Save"
                value={getString(dataset.save)}
              />
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </MatchContent>
    </Match>
  );
};

function getString(str: string) {
  const tt = str.split('/')[3];
  return tt.replaceAll('_', '/');
}
