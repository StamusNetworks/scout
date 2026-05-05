import { IsdataatMatch } from '../../../../model/analysis';
import { Badge } from '../badge';
import { Match, MatchContent, MatchLabel, MatchName } from './match';

interface IsdataatMatchProps {
  isdataat: IsdataatMatch['isdataat'];
}

export const IsdataatMatchTemplate = ({ isdataat }: IsdataatMatchProps) => {
  return (
    <Match>
      <MatchLabel>
        <MatchName>Is data at</MatchName>
        {isdataat.relative && <Badge variant="important">relative</Badge>}
      </MatchLabel>
      <MatchContent className="flex flex-col">
        Offset: {isdataat.offset}
      </MatchContent>
    </Match>
  );
};
