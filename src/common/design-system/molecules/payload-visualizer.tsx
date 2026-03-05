import { Fragment, useMemo, useState } from 'react';

import { cn } from '@/common/lib/utils';

import { CONTROL_CHARS } from './control-chars';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';

interface PayloadVisualizerProps {
  hex: string;
  className?: string;
}

const hover =
  'hover:bg-accent hover:text-accent-foreground border border-transparent hover:border-primary';

export const PayloadVisualizer = ({
  hex,
  className,
}: PayloadVisualizerProps) => {
  const [hoveredByte, setHoveredByte] = useState<{
    value: number;
    offset: number;
  } | null>(null);

  const bytes = useMemo(() => {
    if (!hex) return new Uint8Array();
    try {
      const clean = hex.replace(/\s/g, '');
      const arr = new Uint8Array(clean.length / 2);
      for (let i = 0; i < clean.length; i += 2) {
        arr[i / 2] = parseInt(clean.substring(i, i + 2), 16);
      }
      return arr;
    } catch {
      return new Uint8Array();
    }
  }, [hex]);

  if (bytes.length === 0) {
    return (
      <div className={cn('font-mono text-xs', className)}>
        <span className="text-muted-foreground">Empty payload</span>
      </div>
    );
  }

  return (
    <Tooltip open={hoveredByte !== null}>
      <TooltipTrigger asChild>
        <div
          className={cn('flex flex-wrap font-mono text-sm', className)}
          onMouseLeave={() => setHoveredByte(null)}
          onMouseOver={(e) => {
            if (
              !(e.target instanceof HTMLElement) ||
              !e.target.closest('[data-byte]')
            )
              setHoveredByte(null);
          }}
        >
          {Array.from(bytes).map((byte, i) => {
            const control = CONTROL_CHARS[byte];
            const isPrintable = byte >= 0x20 && byte <= 0x7e;

            if (isPrintable) {
              return (
                <span
                  key={i}
                  data-byte
                  className={cn(
                    'inline-block w-[1ch] cursor-default text-center',
                    hover,
                  )}
                  onMouseEnter={() =>
                    setHoveredByte({ value: byte, offset: i })
                  }
                >
                  {String.fromCharCode(byte)}
                </span>
              );
            }

            if (control) {
              const charSpan = (
                <span
                  key={i}
                  data-byte
                  className={cn(
                    'text-muted-foreground relative mx-0.5 inline-block w-[1ch] cursor-default text-center',
                    hover,
                  )}
                  onMouseEnter={() =>
                    setHoveredByte({ value: byte, offset: i })
                  }
                >
                  {'\u200b'}
                  <span
                    className="absolute top-0 -left-1 inline-block cursor-default"
                    style={{ transform: `scaleX(${1 / control.abbr.length})` }}
                  >
                    {control.abbr}
                  </span>
                </span>
              );

              if (byte === 0x0a) {
                return (
                  <Fragment key={i}>
                    {charSpan}
                    <div className="basis-full" />
                  </Fragment>
                );
              }

              return charSpan;
            }

            // Extended byte
            return (
              <span
                key={i}
                data-byte
                className={cn(
                  'text-muted-foreground inline-block w-[1ch] text-center',
                  hover,
                )}
                onMouseEnter={() => setHoveredByte({ value: byte, offset: i })}
              >
                ·
              </span>
            );
          })}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        {hoveredByte && (
          <div className="flex flex-col gap-1 text-xs">
            <span>
              <span className="text-muted-foreground">Offset:</span>{' '}
              {hoveredByte.offset}
            </span>
            <span>
              <span className="text-muted-foreground">Hex:</span> 0x
              {hoveredByte.value.toString(16).toUpperCase().padStart(2, '0')}
            </span>
            <span>
              <span className="text-muted-foreground">Decimal:</span>{' '}
              {hoveredByte.value}
            </span>
            <span>
              <span className="text-muted-foreground">Char:</span>{' '}
              {hoveredByte.value >= 0x20 && hoveredByte.value <= 0x7e
                ? String.fromCharCode(hoveredByte.value)
                : (CONTROL_CHARS[hoveredByte.value]?.name ?? 'Extended')}
            </span>
          </div>
        )}
      </TooltipContent>
    </Tooltip>
  );
};
