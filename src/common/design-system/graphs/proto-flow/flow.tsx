import './drawflow.css';
import './flow.css';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { saveToClipboard } from '@/common/lib/save';
import { cn } from '@/common/lib/utils';

import Drawflow from './drawflow';
import { ProtoColumn } from './flow.columns';

const rowsLimit = 10;

const getValue = <T,>(col: ProtoColumn<T>, ev: T) => {
  let val: string | number | object | Array<object> | undefined;
  if (col.valFunc) {
    val = col.valFunc(ev);
  } else {
    val = ev as unknown as object;
    col.key.split('.').forEach((key: string) => {
      if (typeof val === 'object' && !Array.isArray(val)) {
        val = val[key as keyof typeof val];
      }
      if (typeof val === 'object' && Array.isArray(val) && val.length > 0) {
        [val] = val;
      }
    });
  }

  if (typeof val !== 'number' && typeof val !== 'string') {
    return col.missing;
  }
  return val.toString();
};

// Check if the table is empty

const Flow = <T,>({
  events,
  columns,
}: {
  events: T[];
  columns: ProtoColumn<T>[];
}) => {
  const [name] = useState(() => `_nmsp-${Math.random()}`);
  const namespace = useRef(name);
  const container = useRef<HTMLTableRowElement>(null);
  const [caption, setCaption] = useState(false);

  useEffect(() => {
    const currContainer = container.current;
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        e.ctrlKey &&
        target.parentNode instanceof HTMLElement &&
        target.parentNode.classList.contains('drawflow-value')
      ) {
        saveToClipboard(target.innerText);
        toast.success('Copied to clipboard');
      }
    };
    currContainer?.addEventListener('mousedown', onClick);
    return () => {
      currContainer?.removeEventListener('mousedown', onClick);
    };
  }, []);

  const valuesByCol: string[][] = columns.map(() => []);
  let evMax = events.length; // event count when one column reaches rowsLimit entries

  // Build the list of values to be displayed for each column
  events.forEach((ev, evNo) => {
    columns.forEach((col, colNo) => {
      const val = getValue<T>(col, ev);
      if (valuesByCol[colNo].indexOf(val) === -1) {
        valuesByCol[colNo].push(val);
      }
      if (valuesByCol[colNo].length >= rowsLimit + 1 && evNo < evMax) {
        evMax = evNo;
      }
    });
  });

  const headerCols = columns.map((col, colNo) => ({
    name: col.title,
    count: valuesByCol[colNo].includes(col.missing)
      ? valuesByCol[colNo].length - 1
      : valuesByCol[colNo].length,
    countWithMissing: valuesByCol[colNo].length,
  }));

  const rowsCount = Math.min(
    Math.max.apply(
      null,
      headerCols.map((col) => col.countWithMissing),
    ),
    rowsLimit,
  );

  useEffect(() => {
    const id = document.getElementById(`drawflow${namespace.current}`);
    const editor = new Drawflow(id, namespace.current);
    editor.start();
    editor.editor_mode = 'fixed';

    const nodes: string[][] = columns.map(() => []);
    const links: string[] = [];
    const drawflowIds: Record<number, number> = {};

    events.slice(0, evMax).forEach((ev) => {
      let prevNodeId: number;

      columns.forEach((col, colNo) => {
        const val: string = getValue<T>(col, ev);

        if (nodes[colNo].indexOf(val) === -1) {
          const rowNo = nodes[colNo].length;
          const nodeId = rowsLimit * colNo + rowNo;
          const hasInput = colNo === 0 ? 0 : 1;
          const hasOutput = colNo === columns.length - 1 ? 0 : 1;

          const y = rowNo * 50;

          const drawflowId = Object.keys(drawflowIds).length + 1;
          drawflowIds[nodeId] = drawflowId;
          editor.addNode(
            drawflowId,
            hasInput,
            hasOutput,
            colNo * 270,
            y,
            `drawflow-value`,
            {},
            val,
          );
          nodes[colNo].push(val);
        }

        const nodeId = rowsLimit * colNo + nodes[colNo].indexOf(val);

        if (colNo > 0) {
          const linkId = `${nodeId}-${prevNodeId}`;
          if (links.indexOf(linkId) === -1) {
            links.push(linkId);
            editor.addConnection(
              drawflowIds[prevNodeId],
              drawflowIds[nodeId],
              'output_1',
              'input_1',
            );
          }
        }
        prevNodeId = nodeId;
      });
    });
    return () => {
      id?.getElementsByClassName('drawflow')[0]?.remove();
      editor.clear();
    };
  }, [columns, evMax, events, rowsCount]);

  return (
    <div
      onMouseOut={() => setCaption(false)}
      onMouseOver={() => setCaption(true)}
      className="relative"
    >
      <span
        className={cn(
          'invisible absolute bottom-0 left-0 z-20 p-[5px_10px]',
          !!caption && 'visible',
        )}
      >
        CTRL + Left click to copy
      </span>
      <table
        style={{
          // display: areAllColumnsEmpty(columns, events) ? 'none' : 'block',
          overflowX: 'auto',
          width: `auto`,
          minWidth: `100%`,
        }}
      >
        <thead>
          <tr className="border-border/50 mb-3 flex border-b-4">
            {headerCols.map((v) => (
              <th
                key={v.name}
                className="bg-border/50 text-card-foreground mr-[50px] w-[220px] cursor-default rounded-t-lg py-2 text-center text-sm font-bold last:mr-0"
              >
                {v.name} ({v.count})
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr
            ref={container}
            id={`drawflow${name}`}
            style={{ height: `${rowsCount * 50}px` }}
            className="text-sm"
          />
        </tbody>
      </table>
    </div>
  );
};

export default Flow;
