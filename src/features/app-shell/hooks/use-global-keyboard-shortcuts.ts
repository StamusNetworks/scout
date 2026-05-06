import { useEffect } from 'react';

import { useQfilterModal } from '@/features/query-filters';

import { useGlobalCommandModal } from './use-global-command-modal';

const isTypingTarget = (element: Element | null) =>
  element?.tagName === 'INPUT' ||
  element?.tagName === 'TEXTAREA' ||
  element?.getAttribute('contenteditable') === 'true' ||
  element?.getAttribute('role') === 'textbox';

export const useGlobalKeyboardShortcuts = () => {
  const qfilterModal = useQfilterModal();
  const globalCommandModal = useGlobalCommandModal();

  useEffect(() => {
    const keyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'k') {
          e.preventDefault();
          globalCommandModal.toggle();
        }
        if (e.key === 'l') {
          e.preventDefault();
          qfilterModal.openAddFilter();
        }
        if (e.key === 'o') {
          e.preventDefault();
          qfilterModal.openAddEsFilter();
        }
      }

      if (e.key === '/' && !isTypingTarget(document.activeElement)) {
        e.preventDefault();
        globalCommandModal.toggle();
      }
    };
    document.addEventListener('keydown', keyPress);
    return () => {
      document.removeEventListener('keydown', keyPress);
    };
  }, [qfilterModal, globalCommandModal]);
};
