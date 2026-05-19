import { describe, expect, test } from 'vitest';

import { buildEventsFlowQfilter } from './build-events-flow-qfilter';

describe('buildEventsFlowQfilter', () => {
  test('returns undefined when nothing is passed', () => {
    expect(buildEventsFlowQfilter()).toBeUndefined();
  });

  test('passes through qfilter when no event types are provided', () => {
    expect(buildEventsFlowQfilter('app_proto:smb')).toBe('app_proto:smb');
  });

  test('omits the event-type restriction when eventTypes is null', () => {
    expect(buildEventsFlowQfilter('app_proto:smb', null)).toBe('app_proto:smb');
  });

  test('omits the event-type restriction when all flags are false', () => {
    expect(
      buildEventsFlowQfilter('app_proto:smb', {
        alert: false,
        stamus: false,
        discovery: false,
      }),
    ).toBe('app_proto:smb');
  });

  test('encodes discovery as alert+discovery, not as event_type:discovery', () => {
    const out = buildEventsFlowQfilter(undefined, {
      alert: false,
      stamus: false,
      discovery: true,
    });
    expect(out).toContain('event_type:alert AND discovery:*');
    expect(out).not.toMatch(/event_type:discovery/);
  });

  test('keeps the discovery clause parenthesised when joined with other flags', () => {
    const out = buildEventsFlowQfilter(undefined, {
      alert: false,
      stamus: true,
      discovery: true,
    });
    expect(out).toBe(
      '(event_type:stamus OR (event_type:alert AND discovery:*))',
    );
  });

  test('joins active flags with OR and wraps them in parens', () => {
    expect(
      buildEventsFlowQfilter(undefined, {
        alert: true,
        stamus: true,
        discovery: false,
      }),
    ).toBe('(event_type:alert OR event_type:stamus)');
  });

  test('combines an existing qfilter with the event-type restriction via AND', () => {
    expect(
      buildEventsFlowQfilter('app_proto:smb', {
        alert: false,
        stamus: false,
        discovery: true,
      }),
    ).toBe('app_proto:smb AND ((event_type:alert AND discovery:*))');
  });
});
