import { useEffect } from 'react';

import { useTheme } from '@/features/theming';

import { SunburstGraphReturn } from './use-draw-graph';

interface UseApplyThemeProps {
  graphReady: boolean;
  parentLabelRef: SunburstGraphReturn['parentLabelRef'];
  labelRef: SunburstGraphReturn['labelRef'];
}

export function useApplyTheme({
  graphReady,
  parentLabelRef,
  labelRef,
}: UseApplyThemeProps) {
  const { isDark } = useTheme();
  return useEffect(() => {
    if (!graphReady) return;

    const parentLabel = parentLabelRef.current;
    const label = labelRef.current;

    if (!parentLabel || !label) return;

    parentLabel.attr('fill', isDark ? 'white' : 'black');
    label.attr('fill', isDark ? 'white' : 'black');
  }, [isDark, graphReady, parentLabelRef, labelRef]);
}
