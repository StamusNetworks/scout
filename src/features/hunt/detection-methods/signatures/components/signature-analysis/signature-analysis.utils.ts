import { pipe } from 'ramda';

import { Engine } from '../../model/analysis';
import { Rule } from '../../model/signature';

export const getRuleData = (rule: Rule) => ({
  generalData: getSignatureGeneralData(rule),
  engines: getUniqueEngines(rule.analysis.engines),
  payload: rule.analysis.lists.payload,
  packet: rule.analysis.lists.packet,
  postmatch: rule.analysis.lists.postmatch,
  threshold: rule.analysis.lists.threshold,
  metadata: getSignatureMetadata(rule),
  references: getSignatureReferences(rule.content),
});

const getSignatureGeneralData = (rule: Rule) => {
  const { destination, target } = getDirection();
  const { originIp, originPort, destinationIp, destinationPort } =
    parseRuleContent(rule.content);

  const rawClasstype = /(?<=classtype:).*?(?=;)/g.exec(rule.content);
  const classtype = !rawClasstype
    ? 'None'
    : rawClasstype[0]
        .split('-')
        .map((item) => item[0].toUpperCase() + item.slice(1))
        .join(' ');

  return {
    originIp: formatString(originIp),
    originPort: formatString(originPort),
    destinationIp: formatString(destinationIp),
    destinationPort: formatString(destinationPort),
    protocol: rule.analysis.app_proto,
    rev: rule.analysis.rev,
    classtype,
    destination,
    target,
  };

  function getDirection() {
    let destination = 'unknown';
    if (rule.analysis.flags?.includes('toclient')) destination = 'client';
    if (rule.analysis.flags?.includes('toserver')) destination = 'server';

    let target = 'unknown';
    if (rule.analysis.flags?.includes('src_is_target')) target = 'source';
    if (rule.analysis.flags?.includes('dst_is_target')) target = 'destination';
    return { destination, target };
  }
};

const getUniqueEngines = (engines?: Engine[]) =>
  engines?.reduce((prev, cur) => {
    if (prev.find((obj) => obj?.name === cur.name)) return prev;
    return [...prev, cur];
  }, [] as Engine[]) || [];

const getSignatureMetadata = (rule: Rule) => {
  const metadata =
    rule.content
      ?.split('metadata:')[1]
      ?.split(', ')
      .map((data: string) => data.split(' '))
      .map(([label, value]: string[]) => ({
        label: label
          .split('_')
          .join(' ')
          .replace(/Signature/i, 'Detection method'),
        value: formatReference(value, label),
      }))
      .filter(
        ({ label }: { label: string }) =>
          label !== 'created at' && label !== 'updated at',
      ) || [];

  return [
    ...metadata,
    { label: 'created at', value: rule.created || 'unknown' },
    { label: 'updated at', value: rule.updated || 'unknown' },
  ];
};

const formatReference = (value: string, label: string) => {
  const trimmedValue = value.trim();
  const cleanValue = trimmedValue.endsWith(';)')
    ? trimmedValue.slice(0, -2)
    : trimmedValue;
  if (value.startsWith('http://')) return cleanValue;
  if (value.startsWith('https://')) return cleanValue;
  if (label.toLowerCase() === 'url') return `https://${cleanValue}`;
  return cleanValue;
};

const getSignatureReferences = (raw: string) =>
  raw
    .split('; ')
    .slice(1)
    .filter((data) => data.startsWith('reference:'))
    .map((data) => data.slice(10))
    .map((data) => data.split(','))
    .map(([label, value]) => ({
      label,
      value: formatReference(value, label),
      link: getReferenceLink(label, value),
    }));

const getReferenceLink = (label: string, value: string) => {
  if (label.toLowerCase() === 'cve')
    return `https://nvd.nist.gov/vuln/detail/CVE-${value}`;
  if (label.toLowerCase() === 'url') return formatReference(value, label);
  return undefined;
};

const fallback = {
  originIp: 'unknown',
  originPort: 'unknown',
  destinationIp: 'unknown',
  destinationPort: 'unknown',
};

const parseRuleContent = (content: string) => {
  // Find the rule header section (before the first parenthesis)
  const headerEnd = content.indexOf('(');
  if (headerEnd === -1) return fallback;

  const header = content.substring(0, headerEnd).trim();
  const tokens = tokenizeHeader(header);

  // Snort rule format: alert <protocol> <source_ip> <source_port> -> <destination_ip> <destination_port>
  // We need to find the arrow (->) to separate source and destination
  const arrowIndex = tokens.findIndex(
    (token) => token === '->' || token === '=>' || token === '<>',
  );
  if (arrowIndex === -1 || arrowIndex < 3) return fallback;

  // Extract source IP and port (before the arrow)
  const sourceIp = tokens[arrowIndex - 2];
  const sourcePort = tokens[arrowIndex - 1];

  // Extract destination IP and port (after the arrow)
  const destinationIp = tokens[arrowIndex + 1];
  const destinationPort = tokens[arrowIndex + 2];

  return {
    originIp: sourceIp || fallback.originIp,
    originPort: sourcePort || fallback.originPort,
    destinationIp: destinationIp || fallback.destinationIp,
    destinationPort: destinationPort || fallback.destinationPort,
  };
};

const tokenizeHeader = (header: string): string[] => {
  const tokens: string[] = [];
  let currentToken = '';
  let bracketDepth = 0;
  let i = 0;

  while (i < header.length) {
    const char = header[i];

    // Check for negation followed by bracket
    if (
      char === '!' &&
      i + 1 < header.length &&
      header[i + 1] === '[' &&
      bracketDepth === 0 &&
      currentToken === ''
    ) {
      // Start a new token with negation
      currentToken = '![';
      bracketDepth = 1;
      i += 2; // Skip both ! and [
      continue;
    }

    if (char === '[') {
      if (bracketDepth === 0) {
        // Start of a new bracket group
        if (currentToken.trim()) {
          tokens.push(currentToken.trim());
          currentToken = '';
        }
        currentToken = '[';
        bracketDepth = 1;
      } else {
        // Nested bracket
        currentToken += char;
        bracketDepth++;
      }
    } else if (char === ']') {
      bracketDepth--;
      currentToken += char;
      if (bracketDepth === 0) {
        // End of bracket group
        tokens.push(currentToken);
        currentToken = '';
      }
    } else if (char === ' ' && bracketDepth === 0) {
      // Space outside brackets - end of token
      if (currentToken.trim()) {
        tokens.push(currentToken.trim());
        currentToken = '';
      }
    } else {
      // Add character to current token
      currentToken += char;
    }
    i++;
  }
  // Add any remaining token
  if (currentToken.trim()) {
    tokens.push(currentToken.trim());
  }
  return tokens.filter((token) => token.length > 0);
};

function trimOuterBrackets(string: string) {
  const start = string.indexOf('[');
  const end = string.lastIndexOf(']');
  if (start !== 0 || end === -1) return string;
  return string.slice(start + 1, end);
}

function addSpaceAfterComma(string: string) {
  return string.replaceAll(',', ', ');
}

function formatString(string: string) {
  return pipe(trimOuterBrackets, addSpaceAfterComma)(string);
}
