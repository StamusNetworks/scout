import { FlowbitsMatch } from '../../../../model/analysis.matches';
import { Badge } from '../badge';
import { Match, MatchContent, MatchLabel, MatchName } from './match';

interface FlowbitsMatchProps {
  flowbits: FlowbitsMatch['flowbits'];
}

export const FlowbitsMatchTemplate = ({ flowbits }: FlowbitsMatchProps) => {
  return (
    <Match>
      <MatchLabel>
        <MatchName>Flowbits</MatchName>
        <Badge>{flowbits.cmd}</Badge>
        {flowbits.operator && <Badge>{flowbits.operator}</Badge>}
      </MatchLabel>
      <MatchContent className="flex flex-col">
        {flowbits.names?.map((name) => (
          <div key={name}>{name}</div>
        ))}
      </MatchContent>
    </Match>
  );
};
