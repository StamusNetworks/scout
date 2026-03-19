import { EventValue } from '@/features/filtering/query-filters/use-cases/interactive-value/event-value';

import { Row } from '../atoms/layout/row';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../atoms/ui/tooltip';

export const SNI = ({ values }: { values: string[] }) => {
  const validSNIs = values.filter((value) => value);

  if (validSNIs.length === 0 || !validSNIs) return null;

  return validSNIs.length > 1 ? (
    <TooltipProvider>
      <Tooltip>
        <TooltipContent>
          <ul>
            {validSNIs.slice(1).map((value, i) => (
              <li
                key={value + '-' + i}
                className="flex items-center gap-1"
              >
                -{' '}
                <EventValue
                  query_key="tls.sni"
                  value={value}
                />
              </li>
            ))}
          </ul>
        </TooltipContent>
        <TooltipTrigger>
          <Row className="gap-1">
            <EventValue
              query_key="tls.sni"
              value={values[0]}
            />
            {values.length > 1 && (
              <span className="text-muted-foreground">
                +{validSNIs.length - 1}
              </span>
            )}
          </Row>
        </TooltipTrigger>
      </Tooltip>
    </TooltipProvider>
  ) : (
    <EventValue
      query_key="tls.sni"
      value={validSNIs[0]}
    />
  );
};
