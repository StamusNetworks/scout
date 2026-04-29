import { describe, expect, test } from 'vitest';

import { filterActionPayloadSchema } from './filter-action.schema';

const baseFields = {
  filter_defs: [
    {
      key: 'src_ip',
      value: '10.0.0.1',
      operator: 'equal',
      full_string: true,
    },
  ],
  rulesets: [1],
  comment: '',
};

describe('filterActionPayloadSchema — send_mail', () => {
  test('parses a valid send_mail payload', () => {
    const result = filterActionPayloadSchema.safeParse({
      ...baseFields,
      action: 'send_mail',
      options: { max_mails_per_day: 5 },
    });
    expect(result.success).toBe(true);
  });

  test('rejects send_mail payload missing options.max_mails_per_day', () => {
    const result = filterActionPayloadSchema.safeParse({
      ...baseFields,
      action: 'send_mail',
      options: {},
    });
    expect(result.success).toBe(false);
  });

  test('rejects send_mail payload with non-positive max_mails_per_day', () => {
    const result = filterActionPayloadSchema.safeParse({
      ...baseFields,
      action: 'send_mail',
      options: { max_mails_per_day: 0 },
    });
    expect(result.success).toBe(false);
  });

  test('rejects send_mail payload with non-integer max_mails_per_day', () => {
    const result = filterActionPayloadSchema.safeParse({
      ...baseFields,
      action: 'send_mail',
      options: { max_mails_per_day: 1.5 },
    });
    expect(result.success).toBe(false);
  });
});
