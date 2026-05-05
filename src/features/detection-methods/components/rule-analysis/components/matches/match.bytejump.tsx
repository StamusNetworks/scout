import { Grid } from '@/common/design-system/atoms/layout/grid';

import { ByteJumpMatch } from '../../../../model/analysis';
import {
  Match,
  MatchContent,
  MatchContentLabel,
  MatchLabel,
  MatchName,
} from './match';

interface BytejumpMatchProps {
  bytejump: ByteJumpMatch['byte_jump'];
}

export const BytejumpMatchTemplate = ({ bytejump }: BytejumpMatchProps) => {
  return (
    <Match>
      <MatchLabel>
        <MatchName>Byte test</MatchName>
      </MatchLabel>
      <MatchContent className="flex flex-col">
        <Grid className="grid-cols-2">
          <div>
            <MatchContentLabel>Offset:</MatchContentLabel> {bytejump.offset}
          </div>
          <div>
            <MatchContentLabel>Nbytes:</MatchContentLabel> {bytejump.nbytes}
          </div>
          <div>
            <MatchContentLabel>Multiplier:</MatchContentLabel>{' '}
            {bytejump.multiplier}
          </div>
          <div>
            <MatchContentLabel>Post Offset:</MatchContentLabel>{' '}
            {bytejump.post_offset}
          </div>
          <div>
            <MatchContentLabel>Base:</MatchContentLabel> {bytejump.base}
          </div>
          <div>
            <MatchContentLabel>Flags:</MatchContentLabel>{' '}
            {bytejump.flags.join(', ')}
          </div>
        </Grid>
      </MatchContent>
    </Match>
  );
};
