import { useEffect } from 'react';

export const usePageTitle = (title: string, override?: boolean) => {
  useEffect(() => {
    if (override) {
      document.title = title;
    } else {
      document.title = `Clear NDR® - ${title}`;
    }
  }, [title, override]);
};
