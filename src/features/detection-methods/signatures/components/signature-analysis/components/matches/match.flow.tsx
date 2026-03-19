import { toPairs } from 'ramda';

import { FlowMatch } from '../../../../model/analysis.matches';
import { Match, MatchContent, MatchLabel, MatchName } from './match';

interface FlowMatchProps {
  flow: FlowMatch['flow'];
}

export const FlowMatchTemplate = ({ flow }: FlowMatchProps) => {
  const tags = toPairs(flow)
    .filter(([, value]) => value === true)
    .map(([key]) => key);
  return (
    <Match>
      <MatchLabel>
        <MatchName>Flow</MatchName>
      </MatchLabel>
      <MatchContent className="flex gap-1">{tags.join(', ')}</MatchContent>
    </Match>
  );
};
