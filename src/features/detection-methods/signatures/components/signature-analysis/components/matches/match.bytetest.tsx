import { Grid } from '@/common/design-system/atoms/layout/grid';

import { ByteTestMatch } from '../../../../../model/analysis';
import {
  Match,
  MatchContent,
  MatchContentLabel,
  MatchLabel,
  MatchName,
} from './match';

interface BytetestMatchProps {
  bytetest: ByteTestMatch['byte_test'];
}

export const BytetestMatchTemplate = ({ bytetest }: BytetestMatchProps) => {
  return (
    <Match>
      <MatchLabel>
        <MatchName>Byte test</MatchName>
      </MatchLabel>
      <MatchContent className="flex flex-col">
        <Grid className="grid-cols-2">
          <div>
            <MatchContentLabel>Offset:</MatchContentLabel> {bytetest.offset}
          </div>
          <div>
            <MatchContentLabel>Nbytes:</MatchContentLabel> {bytetest.nbytes}
          </div>
          <div>
            <MatchContentLabel>Base:</MatchContentLabel> {bytetest.base}
          </div>
          <div>
            <MatchContentLabel>Flags:</MatchContentLabel>{' '}
            {bytetest.flags.join(', ')}
          </div>
        </Grid>
      </MatchContent>
    </Match>
  );
};
