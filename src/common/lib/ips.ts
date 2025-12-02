/**
 * Compresses an IPv6 address by:
 * 1. Removing leading zeros from each group
 * 2. Compressing the longest sequence of zero groups with ::
 */
export function compressIPv6(ip: string): string {
  if (typeof ip !== 'string' || ip.length === 0) {
    return ip;
  }
  if (isIPv4(ip)) {
    return ip;
  }

  const trimmedIp = ip.trim();

  // Handle IPv6 addresses with IPv4-mapped format (e.g., ::ffff:192.168.1.1)
  if (trimmedIp.includes('.')) {
    // Split at the IPv4 part
    const lastColonIndex = trimmedIp.lastIndexOf(':');
    const ipv6Part = trimmedIp.substring(0, lastColonIndex);
    const ipv4Part = trimmedIp.substring(lastColonIndex + 1);

    // Compress the IPv6 part
    const compressedIpv6 = compressIPv6Groups(ipv6Part);
    // Handle the case where compression results in ending with ::
    if (compressedIpv6.endsWith('::')) {
      return `${compressedIpv6}${ipv4Part}`;
    }
    return compressedIpv6 ? `${compressedIpv6}:${ipv4Part}` : `::${ipv4Part}`;
  }

  return compressIPv6Groups(trimmedIp);
}

/**
 * Compresses IPv6 groups by removing leading zeros and compressing zero sequences
 */
function compressIPv6Groups(ip: string): string {
  // Split into groups
  const groups = ip.split(':');

  // Remove leading zeros from each group (but keep at least one zero if group is all zeros)
  const normalizedGroups = groups.map((group) => {
    if (group === '') {
      return '';
    }
    // Remove leading zeros, but if the result is empty, keep one zero
    const normalized = group.replace(/^0+/, '') || '0';
    return normalized;
  });

  // Find the longest sequence of zero groups (or empty strings from ::)
  let longestZeroStart = -1;
  let longestZeroLength = 0;
  let currentZeroStart = -1;
  let currentZeroLength = 0;

  for (let i = 0; i < normalizedGroups.length; i++) {
    if (normalizedGroups[i] === '0' || normalizedGroups[i] === '') {
      if (currentZeroStart === -1) {
        currentZeroStart = i;
        currentZeroLength = 1;
      } else {
        currentZeroLength++;
      }
    } else {
      if (currentZeroLength > longestZeroLength) {
        longestZeroStart = currentZeroStart;
        longestZeroLength = currentZeroLength;
      }
      currentZeroStart = -1;
      currentZeroLength = 0;
    }
  }

  // Check if we ended with zeros
  if (currentZeroLength > longestZeroLength) {
    longestZeroStart = currentZeroStart;
    longestZeroLength = currentZeroLength;
  }

  // Compress the longest zero sequence
  if (longestZeroLength > 1) {
    const before = normalizedGroups.slice(0, longestZeroStart);
    const after = normalizedGroups.slice(longestZeroStart + longestZeroLength);

    // Handle edge cases
    if (before.length === 0 && after.length === 0) {
      return '::';
    }
    if (before.length === 0) {
      return `::${after.join(':')}`;
    }
    if (after.length === 0) {
      return `${before.join(':')}::`;
    }
    return `${before.join(':')}::${after.join(':')}`;
  }

  // No compression needed, just return normalized groups
  return normalizedGroups.join(':');
}

/**
 * Checks if a string is a valid IPv4 address.
 * Validates format: xxx.xxx.xxx.xxx where each xxx is 0-255 (no leading zeros)
 */
export function isIPv4(ip: string): boolean {
  if (typeof ip !== 'string' || ip.length === 0) {
    return false;
  }

  const trimmedIp = ip.trim();

  // IPv4 regex pattern: 4 groups of 1-3 digits (0-255) separated by dots
  // Strict: no leading zeros (0 is allowed, but 01, 001, etc. are not)
  const ipv4Regex =
    /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;

  return ipv4Regex.test(trimmedIp);
}

/**
 * Checks if a string is a valid IPv6 address.
 * Supports full, compressed, and mixed IPv4/IPv6 formats
 */
export function isIPv6(ip: string): boolean {
  if (typeof ip !== 'string' || ip.length === 0) {
    return false;
  }

  const trimmedIp = ip.trim();

  // Reject trailing single colon
  if (trimmedIp.endsWith(':') && !trimmedIp.endsWith('::')) {
    return false;
  }

  // Reject leading single colon (unless it's part of ::)
  if (trimmedIp.startsWith(':') && !trimmedIp.startsWith('::')) {
    return false;
  }

  // Check for IPv4-mapped IPv6 addresses (::ffff:192.168.1.1 or ::ffff:0:192.168.1.1)
  if (trimmedIp.includes('.')) {
    const ipv4MappedRegex =
      /^::(?:ffff|FFFF)(?::0{1,4}){0,1}:(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (ipv4MappedRegex.test(trimmedIp)) {
      return true;
    }
    // Mixed format: last 32 bits as IPv4
    const mixedRegex =
      /^(?:(?:[0-9a-fA-F]{1,4}:){6}|::(?:[0-9a-fA-F]{1,4}:){5}|(?:[0-9a-fA-F]{1,4}:)?::(?:[0-9a-fA-F]{1,4}:){4}|(?:(?:[0-9a-fA-F]{1,4}:){0,1}[0-9a-fA-F]{1,4})?::(?:[0-9a-fA-F]{1,4}:){3}|(?:(?:[0-9a-fA-F]{1,4}:){0,2}[0-9a-fA-F]{1,4})?::(?:[0-9a-fA-F]{1,4}:){2}|(?:(?:[0-9a-fA-F]{1,4}:){0,3}[0-9a-fA-F]{1,4})?::[0-9a-fA-F]{1,4}:|(?:(?:[0-9a-fA-F]{1,4}:){0,4}[0-9a-fA-F]{1,4})?::)(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return mixedRegex.test(trimmedIp);
  }

  // Check for compressed IPv6 (with ::)
  if (trimmedIp.includes('::')) {
    // Only one :: allowed
    if ((trimmedIp.match(/::/g) || []).length > 1) {
      return false;
    }

    // Reject triple or more colons (:::)
    if (trimmedIp.includes(':::')) {
      return false;
    }

    // Split by ::
    const parts = trimmedIp.split('::');
    const leftParts = parts[0] ? parts[0].split(':').filter(Boolean) : [];
    const rightParts = parts[1] ? parts[1].split(':').filter(Boolean) : [];

    // Total parts (excluding ::) should be at most 7 (since :: can represent multiple groups)
    if (leftParts.length + rightParts.length > 7) {
      return false;
    }

    // Validate each part
    const hexPartRegex = /^[0-9a-fA-F]{1,4}$/;
    for (const part of [...leftParts, ...rightParts]) {
      if (!hexPartRegex.test(part)) {
        return false;
      }
    }

    return true;
  }

  // Full IPv6 format: 8 groups of 1-4 hex digits separated by colons
  const parts = trimmedIp.split(':');
  if (parts.length !== 8) {
    return false;
  }
  const hexPartRegex = /^[0-9a-fA-F]{1,4}$/;
  for (const part of parts) {
    if (!hexPartRegex.test(part)) {
      return false;
    }
  }

  return true;
}

export function isIP(ip: string) {
  return isIPv6(ip) || isIPv4(ip);
}
