export const isMac = () => {
  if (typeof window === 'undefined') return false;
  // Use userAgent as fallback since platform is deprecated
  return /Mac|iPhone|iPod|iPad/i.test(navigator.userAgent);
};

export const getModifierKey = () => {
  return isMac() ? '⌘' : 'Ctrl+';
};

export const getShortcutDisplay = (key: string) => {
  return isMac() ? `⌘${key.toUpperCase()}` : `Ctrl+${key.toUpperCase()}`;
};
