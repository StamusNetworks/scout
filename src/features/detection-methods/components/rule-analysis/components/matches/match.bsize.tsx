import { BsizeMatch } from '../../../../model/analysis';
import { Match, MatchContent, MatchLabel, MatchName } from './match';

interface BsizeMatchProps {
  bsize: BsizeMatch['bsize'];
}

export const BsizeMatchTemplate = ({ bsize }: BsizeMatchProps) => {
  return (
    <Match>
      <MatchLabel>
        <MatchName>Bsize</MatchName>
      </MatchLabel>
      <MatchContent className="flex flex-col">
        {getNumberComparisonDescription(bsize)}
      </MatchContent>
    </Match>
  );
};

function getNumberComparisonDescription(bsize: BsizeMatch['bsize']) {
  const { mode, arg1, arg2 } = bsize || {};
  switch (mode) {
    case 'eq':
      return `val = ${arg1}`;
    case 'neq':
      return `val != ${arg1}`;
    case 'gt':
      return `val > ${arg1}`;
    case 'ge':
      return `val >= ${arg1}`;
    case 'lt':
      return `val < ${arg1}`;
    case 'le':
      return `val <= ${arg1}`;
    case 'range':
      return `${arg1} < val < ${arg2}`;
    default:
      return 'unknown';
  }
}
