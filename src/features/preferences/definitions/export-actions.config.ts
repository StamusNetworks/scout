import { Copy, Download } from 'lucide-react';
import { toPairs } from 'ramda';

import {
  downloadBlob,
  formatTo,
  formatToCsv,
  formatToHtmlTable,
  formatToMarkdown,
  saveToClipboard,
} from '@/common/lib/save';

export const actionTypes = {
  download: {
    label: 'Download',
    Icon: Download,
  },
  copy: {
    label: 'Copy',
    Icon: Copy,
  },
};

type Action = {
  label: string;
  action: (data: object[], headers?: string[]) => void;
};

export const downloadActions: Record<string, Action> = {
  csv: {
    label: 'CSV',
    action: (data, headers) => downloadBlob(formatToCsv(data, headers)),
  },
  tsv: {
    label: 'TSV',
    action: (data, headers) => downloadBlob(formatTo('\t', data, headers)),
  },
};

export const downloadActionsItems = toPairs(downloadActions).map(
  ([key, action]) => ({
    id: 'download-' + key,
    Icon: actionTypes.download.Icon,
    label: actionTypes.download.label + ' as ' + action.label,
    formatLabel: action.label,
    format: key,
    action: action.action,
  }),
);

export const copyActions: Record<string, Action> = {
  csv: {
    label: 'CSV',
    action: (data, headers) =>
      saveToClipboard(
        formatToCsv(data, headers),
        formatToHtmlTable(data, headers),
      ),
  },
  tsv: {
    label: 'TSV',
    action: (data, headers) =>
      saveToClipboard(
        formatTo('\t', data, headers),
        formatToHtmlTable(data, headers),
      ),
  },
  markdown: {
    label: 'Markdown',
    action: (data, headers) => saveToClipboard(formatToMarkdown(data, headers)),
  },
};

export const copyActionsItems = toPairs(copyActions).map(([key, action]) => ({
  id: 'copy-' + key,
  Icon: actionTypes.copy.Icon,
  label: actionTypes.copy.label + ' as ' + action.label,
  formatLabel: action.label,
  format: key,
  action: action.action,
}));
