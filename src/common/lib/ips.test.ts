import { describe, expect, it } from 'vitest';

import { compressIPv6, isIPv4, isIPv6 } from './ips';

describe('isIPv4', () => {
  describe('valid IPv4 addresses', () => {
    it.each([
      ['0.0.0.0'],
      ['127.0.0.1'],
      ['192.168.1.1'],
      ['10.0.0.1'],
      ['255.255.255.255'],
      ['1.1.1.1'],
      ['8.8.8.8'],
      ['172.16.0.1'],
      ['192.0.2.1'],
      ['203.0.113.1'],
      ['198.51.100.1'],
      ['233.252.0.1'],
    ])('should return true for valid IPv4: %s', (ip) => {
      expect(isIPv4(ip)).toBe(true);
    });
  });

  describe('valid IPv4 with whitespace', () => {
    it.each([['  192.168.1.1  '], ['\t10.0.0.1\n'], [' 127.0.0.1 ']])(
      'should return true for valid IPv4 with whitespace: %s',
      (ip) => {
        expect(isIPv4(ip)).toBe(true);
      },
    );
  });

  describe('invalid IPv4 addresses - boundary values', () => {
    it.each([
      ['256.0.0.1'], // > 255
      ['0.256.0.1'],
      ['0.0.256.1'],
      ['0.0.0.256'],
      ['999.999.999.999'],
      ['-1.0.0.1'], // negative
      ['0.-1.0.1'],
      ['0.0.-1.1'],
      ['0.0.0.-1'],
    ])('should return false for out of range octet: %s', (ip) => {
      expect(isIPv4(ip)).toBe(false);
    });
  });

  describe('invalid IPv4 addresses - wrong format', () => {
    it.each([
      ['192.168.1'], // missing octet
      ['192.168.1.1.1'], // too many octets
      ['192.168.1.'], // trailing dot
      ['.192.168.1.1'], // leading dot
      ['192..168.1.1'], // double dot
      ['192.168.1'], // only 3 octets
      ['192.168'], // only 2 octets
      ['192'], // only 1 octet
      ['192.168.1.1.1.1'], // 6 octets
    ])('should return false for wrong format: %s', (ip) => {
      expect(isIPv4(ip)).toBe(false);
    });
  });

  describe('invalid IPv4 addresses - non-numeric', () => {
    it.each([
      ['a.b.c.d'],
      ['192.168.1.a'],
      ['192.168.a.1'],
      ['192.a.1.1'],
      ['a.168.1.1'],
      ['192.168.1.1a'], // trailing letter
      ['a192.168.1.1'], // leading letter
      ['192.168.1.1.1a'],
      ['0x0.0.0.1'], // hex
      ['0o0.0.0.1'], // octal
    ])('should return false for non-numeric: %s', (ip) => {
      expect(isIPv4(ip)).toBe(false);
    });
  });

  describe('invalid IPv4 addresses - special characters and injection attempts', () => {
    it.each([
      ['192.168.1.1; rm -rf /'], // command injection
      ["192.168.1.1'; DROP TABLE--"], // SQL injection
      ['<script>alert(1)</script>'], // XSS
      ['192.168.1.1<script>'], // XSS in IP
      ['192.168.1.1"'], // quote injection
      ["192.168.1.1'"], // single quote
      ['192.168.1.1`'], // backtick
      ['192.168.1.1\\'], // backslash
      ['192.168.1.1/24'], // CIDR notation
      ['192.168.1.1:80'], // with port
      ['192.168.1.1:'], // trailing colon
    ])('should return false for special characters: %s', (ip) => {
      expect(isIPv4(ip)).toBe(false);
    });
  });

  describe('invalid IPv4 addresses - empty and null', () => {
    it.each([[''], [' '], ['\t'], ['\n'], ['\r\n']])(
      'should return false for empty/whitespace: %s',
      (ip) => {
        expect(isIPv4(ip)).toBe(false);
      },
    );
  });

  describe('invalid IPv4 addresses - leading zeros (should be invalid per strict interpretation)', () => {
    it.each([
      ['01.0.0.1'], // leading zero
      ['192.01.1.1'],
      ['192.168.01.1'],
      ['192.168.1.01'],
      ['001.001.001.001'],
    ])('should return false for leading zeros: %s', (ip) => {
      // Note: Leading zeros are technically invalid in IPv4, but some parsers accept them
      // This test assumes strict validation
      expect(isIPv4(ip)).toBe(false);
    });
  });

  describe('valid IPv4 addresses - with whitespace (trimmed)', () => {
    it.each([
      ['192.168.1.1 '], // trailing space
      [' 192.168.1.1'], // leading space
      [' 192.168.1.1 '], // both
      ['\t192.168.1.1\n'], // tabs and newlines
    ])(
      'should return true for valid IPv4 with whitespace (trimmed): %s',
      (ip) => {
        expect(isIPv4(ip)).toBe(true);
      },
    );
  });

  describe('invalid IPv4 addresses - IPv6 format', () => {
    it.each([
      ['2001:0db8:85a3:0000:0000:8a2e:0370:7334'],
      ['::1'],
      ['2001:db8::1'],
    ])('should return false for IPv6 format: %s', (ip) => {
      expect(isIPv4(ip)).toBe(false);
    });
  });
});

describe('isIPv6', () => {
  describe('valid IPv6 addresses - full format', () => {
    it.each([
      ['2001:0db8:85a3:0000:0000:8a2e:0370:7334'],
      ['2001:db8:85a3:0:0:8a2e:370:7334'],
      ['2001:db8:85a3::8a2e:370:7334'],
      ['0000:0000:0000:0000:0000:0000:0000:0001'], // ::1
      ['2001:0db8:0000:0000:0000:0000:0000:0001'],
      ['fe80:0000:0000:0000:0202:b3ff:fe1e:8329'],
      ['ff01:0000:0000:0000:0000:0000:0000:0001'],
      ['ff02:0000:0000:0000:0000:0000:0000:0001'],
    ])('should return true for full format: %s', (ip) => {
      expect(isIPv6(ip)).toBe(true);
    });
  });

  describe('valid IPv6 addresses - compressed format', () => {
    it.each([
      ['::1'], // localhost
      ['::'], // all zeros
      ['2001:db8::1'],
      ['2001:db8:85a3::8a2e:370:7334'],
      ['2001:db8::8a2e:370:7334'],
      ['::8a2e:370:7334'],
      ['2001:db8:85a3::'],
      ['::ffff:192.168.1.1'], // IPv4-mapped (will be caught by mixed format)
      ['2001:db8::1:2:3:4'],
      ['fe80::1'],
      ['ff01::1'],
      ['ff02::1'],
    ])('should return true for compressed format: %s', (ip) => {
      expect(isIPv6(ip)).toBe(true);
    });
  });

  describe('valid IPv6 addresses - mixed IPv4/IPv6 format', () => {
    it.each([
      ['::ffff:192.168.1.1'],
      ['::ffff:0:192.168.1.1'],
      ['::ffff:0:0:192.168.1.1'],
      ['2001:db8:85a3::8a2e:192.168.1.1'],
      ['::192.168.1.1'],
      ['2001:db8::192.168.1.1'],
      ['::ffff:10.0.0.1'],
      ['::ffff:255.255.255.255'],
    ])('should return true for mixed format: %s', (ip) => {
      expect(isIPv6(ip)).toBe(true);
    });
  });

  describe('valid IPv6 addresses - with whitespace', () => {
    it.each([
      ['  2001:db8::1  '],
      ['\t::1\n'],
      [' 2001:db8:85a3::8a2e:370:7334 '],
    ])('should return true for valid IPv6 with whitespace: %s', (ip) => {
      expect(isIPv6(ip)).toBe(true);
    });
  });

  describe('invalid IPv6 addresses - wrong number of groups', () => {
    it.each([
      ['2001:db8:85a3:0000:0000:8a2e:0370'], // 7 groups
      ['2001:db8:85a3:0000:0000:8a2e:0370:7334:1234'], // 9 groups
      ['2001:db8:85a3'], // 3 groups
      ['2001'], // 1 group
    ])('should return false for wrong number of groups: %s', (ip) => {
      expect(isIPv6(ip)).toBe(false);
    });
  });

  describe('invalid IPv6 addresses - invalid hex characters', () => {
    it.each([
      ['2001:db8:85a3:0000:0000:8a2e:0370:733g'], // 'g' is invalid hex
      ['2001:db8:85a3:0000:0000:8a2e:0370:733G'], // 'G' is invalid hex
      ['2001:db8:85a3:0000:0000:8a2e:0370:733h'],
      ['2001:db8:85a3:0000:0000:8a2e:0370:733z'],
      ['gggg:gggg:gggg:gggg:gggg:gggg:gggg:gggg'],
    ])('should return false for invalid hex: %s', (ip) => {
      expect(isIPv6(ip)).toBe(false);
    });
  });

  describe('invalid IPv6 addresses - groups too long', () => {
    it.each([
      ['2001:db8:85a3:0000:0000:8a2e:0370:12345'], // 5 digits
      ['2001:db8:85a3:0000:0000:8a2e:0370:123456'], // 6 digits
      ['12345:db8:85a3:0000:0000:8a2e:0370:7334'],
    ])('should return false for group too long: %s', (ip) => {
      expect(isIPv6(ip)).toBe(false);
    });
  });

  describe('invalid IPv6 addresses - multiple compression markers', () => {
    it.each([
      ['2001::db8::1'], // double ::
      ['::db8::1'],
      ['2001::db8::'],
      ['::1::'],
      ['2001::db8:85a3::1'],
    ])('should return false for multiple :: : %s', (ip) => {
      expect(isIPv6(ip)).toBe(false);
    });
  });

  describe('invalid IPv6 addresses - too many groups with compression', () => {
    it.each([
      ['2001:db8:85a3:0000:0000:8a2e:0370::7334'], // 7 groups + :: = 8, but invalid
      ['2001:db8:85a3:0000:0000:8a2e:0370:7334::'], // 8 groups + ::
      ['::2001:db8:85a3:0000:0000:8a2e:0370:7334'], // 8 groups + ::
      ['2001:db8:85a3:0000:0000:8a2e:0370:7334:1234::'], // 9 groups
    ])('should return false for too many groups with compression: %s', (ip) => {
      expect(isIPv6(ip)).toBe(false);
    });
  });

  describe('invalid IPv6 addresses - invalid mixed format', () => {
    it.each([
      ['::ffff:256.168.1.1'], // invalid IPv4 part
      ['::ffff:192.168.1'], // incomplete IPv4
      ['::ffff:192.168.1.1.1'], // too many IPv4 octets
      ['::ffff:192.168.1.a'], // non-numeric IPv4
      ['2001:db8::192.256.1.1'], // invalid IPv4 octet
      ['::ffff:999.999.999.999'], // out of range IPv4
    ])('should return false for invalid mixed format: %s', (ip) => {
      expect(isIPv6(ip)).toBe(false);
    });
  });

  describe('invalid IPv6 addresses - special characters and injection attempts', () => {
    it.each([
      ['2001:db8::1; rm -rf /'], // command injection
      ["2001:db8::1'; DROP TABLE--"], // SQL injection
      ['<script>alert(1)</script>'], // XSS
      ['2001:db8::1<script>'], // XSS in IP
      ['2001:db8::1"'], // quote injection
      ["2001:db8::1'"], // single quote
      ['2001:db8::1`'], // backtick
      ['2001:db8::1\\'], // backslash
      ['2001:db8::1/64'], // CIDR notation
      ['[2001:db8::1]:80'], // with brackets and port
      ['2001:db8::1:'], // trailing single colon
    ])('should return false for special characters: %s', (ip) => {
      expect(isIPv6(ip)).toBe(false);
    });
  });

  describe('invalid IPv6 addresses - empty and null', () => {
    it.each([[''], [' '], ['\t'], ['\n'], ['\r\n']])(
      'should return false for empty/whitespace: %s',
      (ip) => {
        expect(isIPv6(ip)).toBe(false);
      },
    );
  });

  describe('valid IPv6 addresses - with whitespace (trimmed)', () => {
    it.each([
      ['2001:db8::1 '], // trailing space
      [' 2001:db8::1'], // leading space
      [' 2001:db8::1 '], // both
      ['\t2001:db8::1\n'], // tabs and newlines
    ])(
      'should return true for valid IPv6 with whitespace (trimmed): %s',
      (ip) => {
        expect(isIPv6(ip)).toBe(true);
      },
    );
  });

  describe('invalid IPv6 addresses - IPv4 format', () => {
    it.each([['192.168.1.1'], ['127.0.0.1'], ['10.0.0.1']])(
      'should return false for IPv4 format: %s',
      (ip) => {
        expect(isIPv6(ip)).toBe(false);
      },
    );
  });

  describe('invalid IPv6 addresses - malformed compression', () => {
    it.each([
      [':2001:db8::1'], // leading single colon
      ['2001:db8::1:'], // trailing single colon
      [':2001:db8:1'], // leading colon without compression
      ['2001:db8:1:'], // trailing colon without compression
      [':::1'], // triple colon
      ['2001:::db8:1'], // triple colon in middle
    ])('should return false for malformed compression: %s', (ip) => {
      expect(isIPv6(ip)).toBe(false);
    });
  });

  describe('invalid IPv6 addresses - edge cases with compression', () => {
    it.each([
      ['::'], // all zeros (this is actually valid)
      ['2001::'], // valid
      ['::2001'], // valid
      ['2001:db8::'], // valid
      ['::2001:db8'], // valid
    ])('should handle edge compression cases: %s', (ip) => {
      // These are actually valid, so we expect true
      expect(isIPv6(ip)).toBe(true);
    });
  });
});

describe('compressIPv6', () => {
  describe('compression of zero sequences with leading zero removal', () => {
    it.each([
      {
        input: '2001:0db8:0000:0000:0000:8a2e:0370:7334',
        expected: '2001:db8::8a2e:370:7334',
      },
      {
        input: '2001:db8:0:0:0:8a2e:370:7334',
        expected: '2001:db8::8a2e:370:7334',
      },
      {
        input: '0000:0000:0000:0000:0000:0000:0000:0001',
        expected: '::1',
      },
      {
        input: '0000:0000:0000:0000:0000:0000:0000:0000',
        expected: '::',
      },
      {
        input: '2001:0000:0000:0000:0000:0000:0000:0001',
        expected: '2001::1',
      },
      {
        input: '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
        expected: '2001:db8:85a3::8a2e:370:7334',
      },
      {
        input: 'fe80:0000:0000:0000:0202:b3ff:fe1e:8329',
        expected: 'fe80::202:b3ff:fe1e:8329',
      },
      {
        input: '2001:0db8:0000:0000:0000:0000:8a2e:0370',
        expected: '2001:db8::8a2e:370',
      },
    ])(
      'should compress zero sequences and remove leading zeros: $input -> $expected',
      ({ input, expected }) => {
        expect(compressIPv6(input)).toBe(expected);
      },
    );
  });

  describe('removal of leading zeros within groups', () => {
    it.each([
      {
        input: '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
        expected: '2001:db8:85a3::8a2e:370:7334',
      },
      {
        input: '0001:0002:0003:0004:0005:0006:0007:0008',
        expected: '1:2:3:4:5:6:7:8',
      },
      {
        input: '0abc:0def:0123:0456:0789:0abc:0def:0123',
        expected: 'abc:def:123:456:789:abc:def:123',
      },
      {
        input: '000a:000b:000c:000d:000e:000f:0000:0001',
        expected: 'a:b:c:d:e:f:0:1',
      },
      {
        input: '2001:0db8:0000:0000:0000:0000:0000:0001',
        expected: '2001:db8::1',
      },
      {
        input: 'fe80:0000:0000:0000:0202:b3ff:fe1e:8329',
        expected: 'fe80::202:b3ff:fe1e:8329',
      },
      {
        input: 'ff01:0000:0000:0000:0000:0000:0000:0001',
        expected: 'ff01::1',
      },
      {
        input: '2001:0db8:0001:0002:0003:0004:0005:0006',
        expected: '2001:db8:1:2:3:4:5:6',
      },
    ])(
      'should remove leading zeros from each group: $input -> $expected',
      ({ input, expected }) => {
        expect(compressIPv6(input)).toBe(expected);
      },
    );
  });

  describe('no compression needed', () => {
    it.each([
      {
        input: '2001:db8:85a3:1234:5678:8a2e:370:7334',
        expected: '2001:db8:85a3:1234:5678:8a2e:370:7334',
      },
      {
        input: '2001:db8:85a3:1:2:8a2e:370:7334',
        expected: '2001:db8:85a3:1:2:8a2e:370:7334',
      },
      {
        input: '::1',
        expected: '::1',
      },
      {
        input: '2001:db8::1',
        expected: '2001:db8::1',
      },
    ])(
      'should not compress when no zeros: $input -> $expected',
      ({ input, expected }) => {
        expect(compressIPv6(input)).toBe(expected);
      },
    );
  });

  describe('compression of single zero groups', () => {
    it.each([
      {
        input: '2001:0:0:0:0:0:0:1',
        expected: '2001::1',
      },
      {
        input: '2001:db8:0:0:0:0:0:1',
        expected: '2001:db8::1',
      },
      {
        input: 'fe80:0:0:0:202:b3ff:fe1e:8329',
        expected: 'fe80::202:b3ff:fe1e:8329',
      },
      {
        input: '2001:0000:0000:0000:0000:0000:0000:0001',
        expected: '2001::1',
      },
    ])(
      'should compress single zero groups: $input -> $expected',
      ({ input, expected }) => {
        expect(compressIPv6(input)).toBe(expected);
      },
    );
  });

  describe('compression of partial zero sequences', () => {
    it.each([
      {
        input: '2001:db8:0:0:8a2e:370:7334',
        expected: '2001:db8::8a2e:370:7334',
      },
      {
        input: '2001:0:0:8a2e:370:7334',
        expected: '2001::8a2e:370:7334',
      },
      {
        input: '2001:db8:85a3:0:0:8a2e:370:7334',
        expected: '2001:db8:85a3::8a2e:370:7334',
      },
    ])(
      'should compress partial zero sequences: $input -> $expected',
      ({ input, expected }) => {
        expect(compressIPv6(input)).toBe(expected);
      },
    );
  });

  describe('edge cases', () => {
    it.each([
      {
        input: '::',
        expected: '::',
      },
      {
        input: '::1',
        expected: '::1',
      },
      {
        input: '1::',
        expected: '1::',
      },
      {
        input: '2001:db8::1',
        expected: '2001:db8::1',
      },
    ])(
      'should handle edge cases: $input -> $expected',
      ({ input, expected }) => {
        expect(compressIPv6(input)).toBe(expected);
      },
    );
  });

  describe('already compressed addresses', () => {
    it.each([
      {
        input: '2001:db8::8a2e:370:7334',
        expected: '2001:db8::8a2e:370:7334',
      },
      {
        input: '::1',
        expected: '::1',
      },
      {
        input: '2001::1',
        expected: '2001::1',
      },
    ])(
      'should handle already compressed: $input -> $expected',
      ({ input, expected }) => {
        expect(compressIPv6(input)).toBe(expected);
      },
    );
  });

  describe('mixed IPv4/IPv6 format compression', () => {
    it.each([
      {
        input: '2001:0db8:0000:0000:0000:0000:192.168.1.1',
        expected: '2001:db8::192.168.1.1',
      },
      {
        input: '::ffff:192.168.1.1',
        expected: '::ffff:192.168.1.1',
      },
      {
        input: '2001:0db8:85a3:0000:0000:8a2e:192.168.1.1',
        expected: '2001:db8:85a3::8a2e:192.168.1.1',
      },
      {
        input: '2001:0db8:0000:0000:0000:0000:10.0.0.1',
        expected: '2001:db8::10.0.0.1',
      },
    ])(
      'should compress mixed format and remove leading zeros from IPv6 part: $input -> $expected',
      ({ input, expected }) => {
        expect(compressIPv6(input)).toBe(expected);
      },
    );
  });

  describe('edge cases with leading zeros', () => {
    it.each([
      {
        input: '0000:0000:0000:0000:0000:0000:0000:0000',
        expected: '::',
      },
      {
        input: '0001:0000:0000:0000:0000:0000:0000:0000',
        expected: '1::',
      },
      {
        input: '0000:0000:0000:0000:0000:0000:0000:0001',
        expected: '::1',
      },
      {
        input: '000a:0000:0000:0000:0000:0000:0000:000b',
        expected: 'a::b',
      },
    ])(
      'should handle edge cases with leading zeros: $input -> $expected',
      ({ input, expected }) => {
        expect(compressIPv6(input)).toBe(expected);
      },
    );
  });
});
