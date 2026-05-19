import { describe, expect, it } from 'vitest';

import { HUNTING_TRAIL_CONFIG } from './hunting-trail.config';

const allQueries = HUNTING_TRAIL_CONFIG.groups.flatMap((g) => g.queries);

describe('HUNTING_TRAIL_CONFIG', () => {
  it('declares 9 groups matching the PurposeSlug union', () => {
    const slugs = HUNTING_TRAIL_CONFIG.groups.map((g) => g.slug);
    expect(slugs).toEqual([
      'lateral-movement',
      'exploitation',
      'file-activity',
      'network-anomalies',
      'dns-domains',
      'sightings-discovery',
      'hunting-signals',
      'network-sessions',
      'network-services',
    ]);
  });

  it('declares 41 queries total', () => {
    expect(allQueries).toHaveLength(41);
  });

  it('every query has a unique id', () => {
    const ids = allQueries.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('declares exactly 3 static queries: sightings, file, dynamicDns', () => {
    const staticIds = allQueries
      .filter((q) => q.kind === 'static')
      .map((q) => q.id)
      .toSorted();
    expect(staticIds).toEqual(['dynamicDns', 'file', 'sightings']);
  });

  it('declares 38 filterset queries with integer filtersetIds', () => {
    const filtersetQueries = allQueries.filter((q) => q.kind === 'filterset');
    expect(filtersetQueries).toHaveLength(38);
    for (const q of filtersetQueries) {
      if (q.kind !== 'filterset') throw new Error('type narrowing');
      expect(Number.isInteger(q.filtersetId)).toBe(true);
    }
  });

  it('maps each filterset query id to its expected filtersetId', () => {
    const expected: Record<string, number> = {
      lateral: -149,
      remoteAdmin: -151,
      remoteRegistry: -152,
      userEnum: -81,
      postExploit: -85,
      powershell: -82,
      base64Encoding: -47,
      base64Decoding: -39,
      maliciousFilenames: -34,
      suspiciousFilenames: -37,
      smtpExe: -78,
      exeSightings: -73,
      ipDownload: -84,
      rawProtocol: -83,
      torrent: -79,
      tor: -70,
      smtpUnencrypted: -127,
      nrd: -88,
      longDomains: -67,
      shortDomains: -68,
      publicDns: -76,
      newServers: -90,
      smbSightings: -89,
      hunting: -77,
      ssh: -107,
      longerSsh: -105,
      rdp: -108,
      rfbVnc: -106,
      biggerTcp: -103,
      longerTcp: -104,
      biggerUdp: -102,
      longerUdp: -101,
      biggerIcmp: -99,
      longerIcmp: -100,
      unencryptedSmtpService: -86,
      unencryptedSmtpUsage: -87,
      ftpApplication: -74,
      ftpNetworkServices: -75,
    };
    for (const q of allQueries) {
      if (q.kind !== 'filterset') continue;
      expect(q.filtersetId).toBe(expected[q.id]);
    }
    expect(Object.keys(expected)).toHaveLength(38);
  });

  it('static entries carry endpoint, qfilter, name, description', () => {
    const statics = allQueries.filter((q) => q.kind === 'static');
    for (const q of statics) {
      if (q.kind !== 'static') throw new Error('type narrowing');
      expect(['alerts_tail', 'events_tail']).toContain(q.endpoint);
      expect(typeof q.qfilter).toBe('string');
      expect(q.qfilter.length).toBeGreaterThan(0);
      expect(typeof q.name).toBe('string');
      expect(q.name.length).toBeGreaterThan(0);
      expect(typeof q.description).toBe('string');
      expect(q.description.length).toBeGreaterThan(0);
    }
  });

  it('sightings is in sightings-discovery, file in file-activity, dynamicDns in dns-domains', () => {
    const placement = Object.fromEntries(
      HUNTING_TRAIL_CONFIG.groups.flatMap((g) =>
        g.queries.map((q) => [q.id, g.slug]),
      ),
    );
    expect(placement.sightings).toBe('sightings-discovery');
    expect(placement.file).toBe('file-activity');
    expect(placement.dynamicDns).toBe('dns-domains');
  });

  it('Sightings static entry uses alerts_tail with the discovery qfilter', () => {
    const sightings = allQueries.find((q) => q.id === 'sightings');
    expect(sightings).toBeDefined();
    if (sightings?.kind !== 'static') throw new Error('expected static');
    expect(sightings.endpoint).toBe('alerts_tail');
    // Event-type filtering (alert=true) is now passed as a separate query
    // param via eventTypeFlags, so the qfilter is just `discovery:*`.
    expect(sightings.qfilter).toBe('discovery:*');
  });

  it('Fileinfo static entry uses events_tail', () => {
    const file = allQueries.find((q) => q.id === 'file');
    if (file?.kind !== 'static') throw new Error('expected static');
    expect(file.endpoint).toBe('events_tail');
  });
});
