import { describe, expect, test } from 'vitest';

import { FilterAction, FilterActionPayload } from '../model/filter-action';
import { FilterActionDto, FilterActionPayloadDto } from './filter-action.dto';
import {
  toFilterAction,
  toFilterActionPayloadDto,
  toFilterActionStats,
} from './filter-action.transforms';

const baseDto = {
  pk: 1,
  event_type: 'alert',
  filter_defs: [
    {
      key: 'src_ip',
      value: '10.0.0.1',
      operator: 'equal',
      full_string: true,
    },
  ],
  rulesets: [42],
  index: 0,
  description: '',
  enabled: true,
  imported: false,
  comment: 'note',
  username: 'tester',
  creation_date: '2026-04-29T00:00:00Z',
} satisfies Omit<FilterActionDto, 'action' | 'options'>;

const basePayload = {
  filterDefs: [
    {
      key: 'src_ip',
      value: '10.0.0.1',
      isNegated: false,
      isWildcarded: false,
    },
  ],
  rulesets: [42],
  comment: '',
} satisfies Omit<FilterActionPayload, 'kind' | 'options'>;

describe('toFilterAction', () => {
  test('camelcases base fields and maps creation_date to createdAt', () => {
    const action = toFilterAction({
      ...baseDto,
      action: 'suppress',
    });
    expect(action).toEqual({
      id: 1,
      eventType: 'alert',
      filterDefs: [
        {
          key: 'src_ip',
          value: '10.0.0.1',
          isNegated: false,
          isWildcarded: false,
        },
      ],
      rulesets: [42],
      index: 0,
      description: '',
      enabled: true,
      imported: false,
      comment: 'note',
      username: 'tester',
      createdAt: '2026-04-29T00:00:00Z',
      kind: 'suppress',
    });
  });

  test('passes threshold options through unchanged', () => {
    const action = toFilterAction({
      ...baseDto,
      action: 'threshold',
      options: { type: 'both', count: 5, seconds: 60, track: 'by_src' },
    });
    expect(action).toMatchObject({
      kind: 'threshold',
      options: { type: 'both', count: 5, seconds: 60, track: 'by_src' },
    });
  });

  test('maps tagkeep wire to tagAndKeep domain', () => {
    const action = toFilterAction({
      ...baseDto,
      action: 'tagkeep',
      options: { tag: 'relevant' },
    });
    expect(action.kind).toBe('tagAndKeep');
    expect(
      (action as Extract<FilterAction, { kind: 'tagAndKeep' }>).options,
    ).toEqual({ tag: 'relevant' });
  });

  test('camelcases threat options and preserves kill chain phase keys', () => {
    const action = toFilterAction({
      ...baseDto,
      action: 'threat',
      options: {
        threat: 'My Threat',
        kill_chain: 'reconnaissance',
        source_key: 'src_ip',
        target_key: 'dest_ip',
        track_offender: true,
        track_target: false,
        target_type: 'ip',
        stamus_event: false,
        checkWebhooks: false,
        all_tenants: true,
        no_tenant: false,
        tenants_str: ['1', '2'],
      },
    }) as Extract<FilterAction, { kind: 'threat' }>;

    expect(action.options).toEqual({
      threat: 'My Threat',
      killChain: 'reconnaissance',
      sourceKey: 'src_ip',
      targetKey: 'dest_ip',
      trackOffender: true,
      trackTarget: false,
      targetType: 'ip',
      stamusEvent: false,
      checkWebhooks: false,
      allTenants: true,
      noTenant: false,
      tenantsStr: ['1', '2'],
    });
  });

  test('renames max_mails_per_day for send_mail', () => {
    const action = toFilterAction({
      ...baseDto,
      action: 'send_mail',
      options: { max_mails_per_day: 7 },
    }) as Extract<FilterAction, { kind: 'sendMail' }>;
    expect(action.kind).toBe('sendMail');
    expect(action.options.maxMailsPerDay).toBe(7);
  });

  test('inverts operator and full_string for filter defs', () => {
    const action = toFilterAction({
      ...baseDto,
      filter_defs: [
        {
          key: 'src_ip',
          value: '1.1.1.1',
          operator: 'different',
          full_string: false,
        },
      ],
      action: 'suppress',
    });
    expect(action.filterDefs[0]).toEqual({
      key: 'src_ip',
      value: '1.1.1.1',
      isNegated: true,
      isWildcarded: true,
    });
  });
});

describe('toFilterActionPayloadDto', () => {
  test('round-trips threshold payload', () => {
    const dto = toFilterActionPayloadDto({
      ...basePayload,
      kind: 'threshold',
      options: { type: 'both', count: 5, seconds: 60, track: 'by_src' },
    });
    expect(dto).toEqual({
      action: 'threshold',
      filter_defs: [
        {
          key: 'src_ip',
          value: '10.0.0.1',
          operator: 'equal',
          full_string: true,
        },
      ],
      rulesets: [42],
      comment: '',
      options: { type: 'both', count: 5, seconds: 60, track: 'by_src' },
    });
  });

  test('maps tagAndKeep domain to tagkeep wire', () => {
    const dto = toFilterActionPayloadDto({
      ...basePayload,
      kind: 'tagAndKeep',
      options: { tag: 'informational' },
    });
    expect(dto.action).toBe('tagkeep');
  });

  test('forces wildcard for content/msg keys regardless of isWildcarded', () => {
    const dto = toFilterActionPayloadDto({
      kind: 'suppress',
      filterDefs: [
        { key: 'content', value: 'foo', isNegated: false, isWildcarded: false },
        { key: 'msg', value: 'bar', isNegated: false, isWildcarded: false },
        {
          key: 'src_ip',
          value: '10.0.0.1',
          isNegated: false,
          isWildcarded: false,
        },
      ],
      rulesets: [],
      comment: '',
    });
    expect(dto.filter_defs).toEqual([
      { key: 'content', value: 'foo', operator: 'equal', full_string: false },
      { key: 'msg', value: 'bar', operator: 'equal', full_string: false },
      {
        key: 'src_ip',
        value: '10.0.0.1',
        operator: 'equal',
        full_string: true,
      },
    ]);
  });

  test('snake_cases threat options on the way out', () => {
    const dto = toFilterActionPayloadDto({
      ...basePayload,
      kind: 'threat',
      options: {
        threat: 'X',
        killChain: 'reconnaissance',
        sourceKey: 'src_ip',
        targetKey: 'dest_ip',
        trackOffender: true,
        trackTarget: false,
        targetType: 'ip',
        stamusEvent: true,
        checkWebhooks: true,
        allTenants: true,
        noTenant: false,
        tenantsStr: ['1', '2'],
      },
    });
    const options = (
      dto as Extract<FilterActionPayloadDto, { action: 'threat' }>
    ).options;
    expect(dto.action).toBe('threat');
    expect(options).toEqual({
      threat: 'X',
      kill_chain: 'reconnaissance',
      source_key: 'src_ip',
      target_key: 'dest_ip',
      track_offender: true,
      track_target: false,
      target_type: 'ip',
      stamus_event: true,
      checkWebhooks: true,
      all_tenants: true,
      no_tenant: false,
      tenants_str: ['1', '2'],
    });
  });

  test('renames maxMailsPerDay back for send_mail', () => {
    const dto = toFilterActionPayloadDto({
      ...basePayload,
      kind: 'sendMail',
      options: { maxMailsPerDay: 7 },
    });
    expect(dto.action).toBe('send_mail');
    expect(
      (dto as Extract<FilterActionPayloadDto, { action: 'send_mail' }>).options,
    ).toEqual({ max_mails_per_day: 7 });
  });
});

describe('toFilterActionStats', () => {
  test('flattens drop and seen and camelcases doc_count', () => {
    expect(
      toFilterActionStats({
        key: 'src_ip',
        doc_count: 12,
        drop: { value: 5 },
        seen: { value: 7 },
      }),
    ).toEqual({ key: 'src_ip', docCount: 12, drop: 5, seen: 7 });
  });
});
