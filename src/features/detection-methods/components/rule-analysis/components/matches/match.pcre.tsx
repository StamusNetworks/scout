import { toPairs } from 'ramda';

import { PcreMatch } from '../../../../model/analysis';
import { Badge } from '../badge';
import { Match, MatchContent, MatchLabel, MatchName } from './match';

interface PcreMatchProps {
  pcre: PcreMatch['pcre'];
}
export const PcreMatchTemplate = ({ pcre }: PcreMatchProps) => {
  return (
    <Match>
      <MatchLabel>
        <MatchName>PCRE</MatchName>
        {getTags(pcre).map((tag) => (
          <Badge key={tag}>{tag}</Badge>
        ))}
      </MatchLabel>
      <MatchContent>{pcre.pattern}</MatchContent>
    </Match>
  );
};

function getTags(pcre: PcreMatch['pcre']) {
  return toPairs(pcre)
    .filter(([, value]) => value === true)
    .map(([key]) => key);
}
