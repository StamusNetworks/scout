import { describe, expect, it } from 'vitest';

import { formatThreatHistory, getOffenders } from './format-threat-history';
import { OffendersData } from './offenders';
import { ThreatHistory } from './threat-history';

// --- Mock data factories ---

const makeThreatHistory = (
  overrides: Partial<ThreatHistory> & { asset: string },
): ThreatHistory => ({
  asset_type: 'ip',
  first_seen: '2024-01-01T00:00:00Z',
  last_seen: '2024-01-02T00:00:00Z',
  history: [],
  kc_change_history: [
    { first_seen: '2024-01-01T00:00:00Z' },
    { last_seen: '2024-01-02T00:00:00Z' },
  ],
  tenant: 1,
  is_offender: false,
  ...overrides,
});

const victimEntry: ThreatHistory = makeThreatHistory({
  asset: '10.0.0.1',
  is_offender: false,
  history: [
    {
      history_type: 'first_seen',
      timestamp: '2024-01-01T01:00:00Z',
      threat_id: 'threat-1',
      is_offender: false,
      params: {
        step_kill_chain: 'exploitation',
        step_kill_chain_offender: null,
      },
    },
    {
      history_type: 'last_seen',
      timestamp: '2024-01-01T12:00:00Z',
      threat_id: 'threat-1',
      is_offender: false,
      params: { count: 5 },
    },
  ],
  kc_change_history: [
    {
      timestamp: '2024-01-01T01:00:00Z',
      threat_id: 'threat-1',
      is_offender: false,
      kc_step: 'exploitation',
      kc_step_offender: null,
    },
    { first_seen: '2024-01-01T00:00:00Z' },
    { last_seen: '2024-01-02T00:00:00Z' },
  ],
});

const offenderEntry: ThreatHistory = makeThreatHistory({
  asset: '10.0.0.2',
  is_offender: true,
  history: [
    {
      history_type: 'first_seen',
      timestamp: '2024-01-01T02:00:00Z',
      threat_id: 'threat-2',
      is_offender: true,
      params: {
        step_kill_chain: 'exploitation',
        step_kill_chain_offender: 'command_and_control',
      },
    },
    {
      history_type: 'last_seen',
      timestamp: '2024-01-01T18:00:00Z',
      threat_id: 'threat-2',
      is_offender: true,
      params: { count: 3 },
    },
  ],
  kc_change_history: [
    {
      timestamp: '2024-01-01T02:00:00Z',
      threat_id: 'threat-2',
      is_offender: true,
      kc_step: 'exploitation',
      kc_step_offender: 'command_and_control',
    },
    { first_seen: '2024-01-01T00:00:00Z' },
    { last_seen: '2024-01-02T00:00:00Z' },
  ],
});

// Same asset as victim + offender (for merge testing)
const dualVictimEntry: ThreatHistory = makeThreatHistory({
  asset: '10.0.0.3',
  is_offender: false,
  history: [
    {
      history_type: 'first_seen',
      timestamp: '2024-01-01T01:00:00Z',
      threat_id: 'threat-3',
      is_offender: false,
      params: {
        step_kill_chain: 'delivery',
        step_kill_chain_offender: null,
      },
    },
    {
      history_type: 'last_seen',
      timestamp: '2024-01-01T10:00:00Z',
      threat_id: 'threat-3',
      is_offender: false,
      params: { count: 2 },
    },
  ],
  kc_change_history: [
    {
      timestamp: '2024-01-01T01:00:00Z',
      threat_id: 'threat-3',
      is_offender: false,
      kc_step: 'delivery',
      kc_step_offender: null,
    },
    { first_seen: '2024-01-01T00:00:00Z' },
    { last_seen: '2024-01-02T00:00:00Z' },
  ],
});

const dualOffenderEntry: ThreatHistory = makeThreatHistory({
  asset: '10.0.0.3',
  is_offender: true,
  history: [
    {
      history_type: 'first_seen',
      timestamp: '2024-01-01T03:00:00Z',
      threat_id: 'threat-4',
      is_offender: true,
      params: {
        step_kill_chain: 'delivery',
        step_kill_chain_offender: 'actions_on_objectives',
      },
    },
    {
      history_type: 'last_seen',
      timestamp: '2024-01-01T20:00:00Z',
      threat_id: 'threat-4',
      is_offender: true,
      params: { count: 1 },
    },
  ],
  kc_change_history: [
    {
      timestamp: '2024-01-01T03:00:00Z',
      threat_id: 'threat-4',
      is_offender: true,
      kc_step: 'delivery',
      kc_step_offender: 'actions_on_objectives',
    },
    { first_seen: '2024-01-01T00:00:00Z' },
    { last_seen: '2024-01-02T00:00:00Z' },
  ],
});

describe('formatThreatHistory', () => {
  it('formats victim-only entities with doc threats', () => {
    const result = formatThreatHistory([victimEntry]);
    expect(result.entities).toHaveLength(1);
    expect(result.entities[0].entity).toBe('10.0.0.1');
    expect(result.entities[0].threats).toHaveLength(1);
    expect(result.entities[0].threats[0].type).toBe('doc');
    expect(result.entities[0].kc_phases).toHaveLength(1);
    expect(result.entities[0].kc_phases[0].kc_phase).toBe('exploitation');
  });

  it('formats offender-only entities with offender threats and offender KC phases', () => {
    const result = formatThreatHistory([offenderEntry]);
    expect(result.entities).toHaveLength(1);
    expect(result.entities[0].entity).toBe('10.0.0.2');
    expect(result.entities[0].threats).toHaveLength(1);
    expect(result.entities[0].threats[0].type).toBe('offender');
    expect(result.entities[0].kc_phases).toHaveLength(1);
    expect(result.entities[0].kc_phases[0].kc_phase).toBe(
      'command_and_control',
    );
  });

  it('merges same-asset victim and offender: keeps victim KC, adds offender threats', () => {
    const result = formatThreatHistory([dualVictimEntry, dualOffenderEntry]);
    expect(result.entities).toHaveLength(1);
    const entity = result.entities[0];
    expect(entity.entity).toBe('10.0.0.3');

    // Should have both victim and offender threats, sorted by start_date ascending
    expect(entity.threats).toHaveLength(2);
    expect(entity.threats[0].type).toBe('doc'); // 01:00 < 03:00
    expect(entity.threats[1].type).toBe('offender');
    expect(entity.threats[0].start_date).toBeLessThan(
      entity.threats[1].start_date,
    );

    // KC phases should come from victim only
    expect(entity.kc_phases).toHaveLength(1);
    expect(entity.kc_phases[0].kc_phase).toBe('delivery');
  });

  it('assigns dopv type when step_kill_chain is pre_condition', () => {
    const dopvEntry: ThreatHistory = makeThreatHistory({
      asset: '10.0.0.5',
      is_offender: false,
      history: [
        {
          history_type: 'first_seen',
          timestamp: '2024-01-01T01:00:00Z',
          threat_id: 'threat-dopv',
          is_offender: false,
          params: {
            step_kill_chain: 'pre_condition',
            step_kill_chain_offender: null,
          },
        },
      ],
      kc_change_history: [
        { first_seen: '2024-01-01T00:00:00Z' },
        { last_seen: '2024-01-02T00:00:00Z' },
      ],
    });

    const result = formatThreatHistory([dopvEntry]);
    expect(result.entities[0].threats).toHaveLength(1);
    expect(result.entities[0].threats[0].type).toBe('dopv');
  });

  it('assigns correct start_date and end_date on individual threats', () => {
    const result = formatThreatHistory([victimEntry]);
    const threat = result.entities[0].threats.find(
      (t) => t.threat_id === 'threat-1',
    );
    expect(threat).toBeDefined();
    expect(threat!.start_date).toBe(new Date('2024-01-01T01:00:00Z').getTime());
    expect(threat!.end_date).toBe(new Date('2024-01-01T12:00:00Z').getTime());
  });

  it('computes correct start_date and end_date across all entries', () => {
    const result = formatThreatHistory([victimEntry, offenderEntry]);
    // start_date should be min of first_seen minus 5% gap
    // end_date should be max of last_seen plus 5% gap
    expect(result.start_date).toBeLessThan(
      new Date('2024-01-01T00:00:00Z').getTime(),
    );
    expect(result.end_date).toBeGreaterThan(
      new Date('2024-01-02T00:00:00Z').getTime(),
    );
  });
});

// --- getOffenders tests ---

const makeOffendersData = (
  buckets: OffendersData['res']['assets']['buckets'],
): OffendersData => ({
  res: {
    assets: {
      doc_count_error_upper_bound: 0,
      sum_other_doc_count: 0,
      buckets,
    },
  },
});

const makeAssetBucket = (
  victim: string,
  offenders: { key: string; threat_id: string }[],
): OffendersData['res']['assets']['buckets'][number] => ({
  key: victim,
  doc_count: 1,
  min_timestamp: { value: 0, value_as_string: '' },
  max_timestamp: { value: 0, value_as_string: '' },
  offenders: {
    doc_count_error_upper_bound: 0,
    sum_other_doc_count: 0,
    buckets: offenders.map((o) => ({
      key: o.key,
      doc_count: 1,
      threat_id: {
        doc_count_error_upper_bound: 0,
        sum_other_doc_count: 0,
        buckets: [
          {
            key: o.threat_id,
            doc_count: 1,
            min_timestamp: { value: 0, value_as_string: '' },
            max_timestamp: { value: 0, value_as_string: '' },
          },
        ],
      },
      min_timestamp: { value: 0, value_as_string: '' },
      max_timestamp: { value: 0, value_as_string: '' },
    })),
  },
});

describe('getOffenders', () => {
  it('returns lateral movements when both victim and offender are in entities', () => {
    const data = makeOffendersData([
      makeAssetBucket('10.0.0.1', [{ key: '10.0.0.2', threat_id: '42' }]),
    ]);
    const result = getOffenders(data, ['10.0.0.1', '10.0.0.2']);
    expect(result['10.0.0.1']).toHaveLength(1);
    expect(result['10.0.0.1'][0]).toEqual({
      threat_id: '42',
      offender_ip: '10.0.0.2',
    });
  });

  it('excludes lateral movements when victim is not in entities (e.g. Lateral Scanning)', () => {
    const data = makeOffendersData([
      makeAssetBucket('unknown-victim', [{ key: '10.0.0.2', threat_id: '99' }]),
    ]);
    const result = getOffenders(data, ['10.0.0.2']);
    expect(result['unknown-victim']).toBeUndefined();
  });

  it('excludes lateral movements when offender is not in entities', () => {
    const data = makeOffendersData([
      makeAssetBucket('10.0.0.1', [
        { key: 'unknown-offender', threat_id: '99' },
      ]),
    ]);
    const result = getOffenders(data, ['10.0.0.1']);
    expect(result['10.0.0.1']).toHaveLength(0);
  });
});
