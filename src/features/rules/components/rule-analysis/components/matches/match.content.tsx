import { pipe, toPairs } from 'ramda';

import { decodeUnicodeEscapeSequence } from '@/common/lib/strings';

import { ContentMatch } from '../../../../model/analysis';
import { Badge } from '../badge';
import {
  Match,
  MatchContent,
  MatchLabel,
  MatchName,
  MatchPrefix,
} from './match';

interface ContentMatchProps {
  content: ContentMatch['content'];
}

export const ContentMatchTemplate = ({ content }: ContentMatchProps) => {
  return (
    <Match>
      <MatchLabel>
        <MatchName>Content</MatchName>
        {getTags(content).map((tag) => (
          <Badge
            key={tag}
            variant={tag === 'fast_pattern' ? 'important' : 'default'}
          >
            {tag}
          </Badge>
        ))}
      </MatchLabel>
      <MatchContent>
        {content.starts_with && <MatchPrefix>Starts with</MatchPrefix>}
        {content.ends_with && <MatchPrefix>Ends with</MatchPrefix>}
        {cleanUpPattern(content.pattern)}
      </MatchContent>
    </Match>
  );
};

function getTags(content: ContentMatch['content']) {
  return toPairs(content)
    .filter(
      ([key, value]) =>
        !['is_mpm', 'no_double_inspect', 'starts_with', 'ends_with'].includes(
          key,
        ) && value === true,
    )
    .map(([key]) => key);
}

function cleanUpPattern(pattern: string) {
  return pipe(decodeUnicodeEscapeSequence)(pattern);
}
