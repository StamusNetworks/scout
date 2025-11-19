// Based on https://stackoverflow.com/questions/10420352/converting-file-size-in-bytes-to-human-readable-string/10420404
export const formatNumber = (
  number: number,
  si = true,
  dp = 1,
  withSpace = false,
) => {
  const thresh = si ? 1000 : 1024;

  if (Math.abs(number) < thresh) {
    return number.toFixed(0);
  }

  const units = si
    ? ['k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y']
    : ['Ki', 'Mi', 'Gi', 'Ti', 'Pi', 'Ei', 'Zi', 'Yi'];
  let u = -1;
  const r = 10 ** dp;

  do {
    number /= thresh;
    u += 1;
  } while (
    Math.round(Math.abs(number) * r) / r >= thresh &&
    u < units.length - 1
  );

  return `${number.toFixed(dp)}${withSpace ? ' ' : ''}${units[u]}`;
};

export const formatBytes = (
  number: number,
  si: boolean = true,
  dp: number = 1,
) => {
  let nbrText = formatNumber(number, si, dp, true);
  const thresh = si ? 1000 : 1024;

  if (number < thresh) {
    nbrText += ' ';
  }
  return `${nbrText}B`;
};
