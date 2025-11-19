export const capitalizeAll = (str: string, preserveCapitals = false) =>
  str
    .split(' ')
    .map((word) => capitalizeFirst(word, preserveCapitals))
    .join(' ');

export const capitalizeFirst = (str: string, preserveCapitals = false) =>
  str.charAt(0).toUpperCase() +
  (preserveCapitals ? str.slice(1) : str.slice(1).toLowerCase());

export const isEmail = (str: string) => /\S+@\S+\.\S+/.test(str);
export const isIP = (str: string) =>
  /((^\s*((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/\d+?)?)\s*$)|(^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:)(\/\d+?)?)|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$))/.test(
    str,
  );
export const isUsername = (str: string) => /^([a-zA-Z0-9]+)$/.test(str);

export function esEscape(str: string) {
  // https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html#_reserved_characters
  // Can't search on < >
  const result = str.replace(/[<>]/g, '');
  // Escape other reserved characters
  return result.replace(/[=+\-&|!(){}[\]^"~:\\/]/g, (c) => `\\${c}`);
}

export function decodeHexPipeSeparated(str: string): string {
  return str.replace(/\|([0-9A-Fa-f\s]+)\|/g, (_, hexSequence: string) => {
    return hexSequence
      .trim()
      .split(/\s+/)
      .map((h: string) => String.fromCharCode(parseInt(h, 16)))
      .join('');
  });
}

export function decodeUnicodeEscapeSequence(str: string) {
  return str.replace(/\\u[\dA-F]{4}/gi, function (match) {
    return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16));
  });
}

export function startsWithOneOf(str: string, prefixes: string[]) {
  return prefixes.some((prefix) => str.startsWith(prefix));
}
