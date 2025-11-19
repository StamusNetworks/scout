import { cva } from 'class-variance-authority';
import { Expand, Minimize } from 'lucide-react';
import React, { RefObject, useEffect, useRef, useState } from 'react';

import { useResizeObserver } from '@/common/lib/use-resize-observer';

import { Button } from '../atoms/ui/button';

const wrapperVariants = cva('group', {
  variants: {
    mode: {
      detached: 'absolute top-0 left-0 w-full h-full bg-background',
      wrapped: 'relative border border-border w-full h-full',
    },
  },
  defaultVariants: {
    mode: 'wrapped',
  },
});

interface ExpandableWrapperProps {
  render: (
    width: number,
    height: number,
    mode: 'detached' | 'wrapped',
  ) => React.JSX.Element;
}

export const ExpandableWrapper = ({ render }: ExpandableWrapperProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { width, height } = useResizeObserver({
    ref: ref as RefObject<HTMLElement>,
  });
  const [mode, setMode] = useState<'detached' | 'wrapped'>('wrapped');
  useEffect(() => {
    const escape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMode('wrapped');
      }
    };
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('keydown', escape);
    };
  }, []);
  return (
    <div
      className={wrapperVariants({ mode })}
      ref={ref}
    >
      <Button
        onClick={() => setMode(mode === 'detached' ? 'wrapped' : 'detached')}
        className="invisible absolute top-5 left-5 z-50 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100"
        variant="secondary"
      >
        {mode === 'detached' ? <Minimize /> : <Expand />}
        {mode === 'detached' ? 'Shrink' : 'Expand'}
      </Button>
      {render(width || 0, height || 0, mode)}
    </div>
  );
};
