import { useSyncExternalStore } from 'react';

const getVariableValue = (variable: string) => {
  if (typeof window === 'undefined') return '';
  return getComputedStyle(document.documentElement)
    .getPropertyValue(variable)
    .trim();
};

export const useRootCssVariableValue = (variable: string) => {
  const subscribe = (callback: () => void) => {
    if (typeof window === 'undefined') return () => {};

    const rootElement = document.documentElement;
    const observer = new MutationObserver((mutations) => {
      if (mutations.some((mutation) => mutation.attributeName === 'class')) {
        callback();
      }
    });

    observer.observe(rootElement, { attributes: true });
    return () => observer.disconnect();
  };

  return useSyncExternalStore(
    subscribe,
    () => getVariableValue(variable),
    () => getVariableValue(variable),
  );
};
