import { useMemo, useState } from 'react';

import { cn } from '@/common/lib/utils';

import { ScrollArea } from '../atoms/ui/scroll-area';
import { CONTROL_CHARS } from './control-chars';

interface HexViewerProps {
  base64: string;
  className?: string;
  bytesPerRow?: number;
}

const highlight =
  'outline-primary bg-accent text-accent-foreground rounded-xs outline';

export const HexViewer = ({
  base64,
  className,
  bytesPerRow = 48,
}: HexViewerProps) => {
  const [hoveredByteIndex, setHoveredByteIndex] = useState<number | null>(null);

  const { bytes, rows, error } = useMemo(() => {
    if (!base64) return { bytes: new Uint8Array(), rows: [], error: null };

    try {
      const raw = atob(base64);
      const bytes = Uint8Array.from(raw, (c) => c.charCodeAt(0));
      const rows: Uint8Array[] = [];
      for (let i = 0; i < bytes.length; i += bytesPerRow) {
        rows.push(bytes.slice(i, i + bytesPerRow));
      }
      return { bytes, rows, error: null };
    } catch {
      return {
        bytes: new Uint8Array(),
        rows: [],
        error: 'Invalid base64 input',
      };
    }
  }, [base64, bytesPerRow]);

  if (error) {
    return (
      <div
        className={cn(
          'border-border bg-card rounded-md border p-4 font-mono text-xs',
          className,
        )}
      >
        <span className="text-destructive">{error}</span>
      </div>
    );
  }

  if (bytes.length === 0) {
    return (
      <div
        className={cn(
          'border-border bg-card rounded-md border p-4 font-mono text-xs',
          className,
        )}
      >
        <span className="text-muted-foreground">Empty payload</span>
      </div>
    );
  }

  const columnHeaders = Array.from({ length: bytesPerRow }, (_, i) =>
    i.toString(16).toUpperCase().padStart(2, '0'),
  );

  // Compute the minimum number of hex digits needed for offsets
  const maxOffset = Math.max(0, (rows.length - 1) * bytesPerRow);
  const offsetWidth = Math.max(2, maxOffset.toString(16).length);

  return (
    <ScrollArea
      className={cn('font-mono text-xs', className)}
      onMouseLeave={() => setHoveredByteIndex(null)}
    >
      <div>
        {/* Header row */}
        <div className="text-muted-foreground flex">
          <div
            className="flex shrink-0"
            style={{ width: `${bytesPerRow}ch` }}
          >
            <span>ASCII</span>
          </div>
          <span className="mx-2">|</span>
          <span
            className="shrink-0 text-right"
            style={{ width: `${offsetWidth}ch` }}
          ></span>
          <span className="mx-2">|</span>
          <div className="flex shrink-0">
            {columnHeaders.map((h) => (
              <span
                key={h}
                className="w-[3ch] text-center"
              >
                {h}
              </span>
            ))}
          </div>
        </div>

        {/* Data rows */}
        {rows.map((row, rowIndex) => {
          const rowOffset = rowIndex * bytesPerRow;
          const offsetStr = rowOffset
            .toString(16)
            .toUpperCase()
            .padStart(offsetWidth, '0');

          return (
            <div
              key={rowOffset}
              className="flex"
            >
              {/* ASCII */}
              <div
                className="flex shrink-0"
                style={{ width: `${bytesPerRow}ch` }}
              >
                {Array.from({ length: bytesPerRow }, (_, colIndex) => {
                  const absIndex = rowOffset + colIndex;
                  if (colIndex < row.length) {
                    const byte = row[colIndex];
                    const isPrintable = byte >= 0x20 && byte <= 0x7e;
                    const control = CONTROL_CHARS[byte];

                    if (isPrintable) {
                      return (
                        <span
                          key={colIndex}
                          className={cn(
                            'w-[1ch] text-center transition-colors',
                            hoveredByteIndex === absIndex && highlight,
                          )}
                          onMouseEnter={() => setHoveredByteIndex(absIndex)}
                        >
                          {String.fromCharCode(byte)}
                        </span>
                      );
                    }

                    if (control) {
                      return (
                        <span
                          key={colIndex}
                          className={cn(
                            'text-muted-foreground relative w-[1ch] text-center transition-colors',
                            hoveredByteIndex === absIndex && highlight,
                          )}
                          onMouseEnter={() => setHoveredByteIndex(absIndex)}
                        >
                          {'\u200b'}
                          <span
                            className="absolute top-0 left-0 inline-block"
                            style={{
                              transform: `scaleX(${1 / control.abbr.length})`,
                            }}
                          >
                            {control.abbr}
                          </span>
                        </span>
                      );
                    }

                    // Extended byte
                    return (
                      <span
                        key={colIndex}
                        className={cn(
                          'text-muted-foreground w-[1ch] text-center transition-colors',
                          hoveredByteIndex === absIndex && highlight,
                        )}
                        onMouseEnter={() => setHoveredByteIndex(absIndex)}
                      >
                        ·
                      </span>
                    );
                  }
                  return (
                    <span
                      key={colIndex}
                      className="w-[1ch]"
                    />
                  );
                })}
              </div>

              <span className="text-muted-foreground mx-2">|</span>

              {/* Offset */}
              <span
                className="text-muted-foreground shrink-0 text-right"
                style={{ width: `${offsetWidth}ch` }}
              >
                {offsetStr}
              </span>
              <span className="text-muted-foreground mx-2">|</span>

              {/* Hex bytes */}
              <div className="flex shrink-0">
                {Array.from({ length: bytesPerRow }, (_, colIndex) => {
                  const absIndex = rowOffset + colIndex;
                  if (colIndex < row.length) {
                    const hex = row[colIndex]
                      .toString(16)
                      .toUpperCase()
                      .padStart(2, '0');
                    return (
                      <span
                        key={colIndex}
                        className={cn(
                          'w-[3ch] text-center transition-colors',
                          hoveredByteIndex === absIndex && highlight,
                        )}
                        onMouseEnter={() => setHoveredByteIndex(absIndex)}
                      >
                        {hex}
                      </span>
                    );
                  }
                  return (
                    <span
                      key={colIndex}
                      className="w-[3ch]"
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};
