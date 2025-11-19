import { values } from 'ramda';
import { toast } from 'sonner';

export const formatTo = (
  separator: string,
  data: object[],
  header?: string[],
) =>
  [
    ...(header ? [header.join(separator)] : []),
    ...data.map((row) =>
      Object.values(row)
        .map((value) => `"${value}"`)
        .join(separator),
    ),
  ].join('\n');

export const formatToCsv = (data: object[], header?: string[]) =>
  formatTo(',', data, header);

export const formatToHtmlTable = (data: object[], header?: string[]) => {
  if (!data || data.length === 0) {
    return '';
  }

  let html = '<table>';

  if (header && header.length > 0) {
    html +=
      '<thead><tr>' +
      header.map((h) => `<th>${h}</th>`).join('') +
      '</tr></thead>';
  }

  html += '<tbody>';
  data.forEach((row) => {
    html +=
      '<tr>' +
      values(row)
        .map((value) => `<td>${value !== undefined ? value : ''}</td>`)
        .join('') +
      '</tr>';
  });
  html += '</tbody></table>';
  return html;
};

export const formatToMarkdown = (data: object[], header?: string[]) =>
  [
    ...(header ? [header.join(' | ')] : []),
    ...(header ? [header.map(() => '---').join(' | ')] : []),
    ...data.map((row) =>
      Object.values(row)
        .map((value) => value.toString())
        .join(' | '),
    ),
  ]
    .map((row) => `| ${row} |`)
    .join('\n');

export const downloadBlob = (data: BlobPart) => {
  // Create blob and download link
  const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', 'export.csv');
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const saveToClipboard = (stringified: string, html?: string) => {
  const item: Record<string, Blob> = {
    'text/plain': new Blob([stringified], { type: 'text/plain' }),
  };
  if (html) {
    item['text/html'] = new Blob([html], { type: 'text/html' });
  }
  // Copy to clipboard
  navigator.clipboard
    .write([new ClipboardItem(item)])
    .then(() => toast.success('Copied to clipboard'))
    .catch((err) => {
      console.error('Failed to copy text: ', err);
    });
};
