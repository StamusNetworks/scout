import { describe, expect, it } from 'vitest';

import { ThreatPayload } from '../model/threat';
import { ThreatDto } from './threat.dto';
import { toThreat, toThreatDto, toThreatPayloadDto } from './threat.transforms';

const dto: ThreatDto = {
  pk: 42,
  threat_id: 1024,
  name: 'Living Off The Land',
  description: 'Use of legitimate binaries for malicious ends.',
  additional_info: 'See MITRE T1218.',
  criticity: 7,
  version: 3,
  active: true,
  creation_date: '2026-04-01',
  family: 9,
  family_class: 'doc',
  links: {
    threat: [
      {
        name: 'MITRE',
        link: 'https://attack.mitre.org/T1218',
        reference_type: 'mitre',
      },
    ],
    family: [
      {
        name: 'Family ATT&CK',
        link: 'https://attack.mitre.org/groups/G0001',
        reference_type: 'mitre',
      },
    ],
  },
  user_defined: true,
  nb_methods: 12,
  tenants: [1, 2],
  no_tenant: false,
  all_tenants: false,
};

describe('threat transforms', () => {
  describe('toThreat', () => {
    it('translates server snake_case to domain camelCase', () => {
      const threat = toThreat(dto);
      expect(threat.id).toBe(42);
      expect(threat.threatId).toBe(1024);
      expect(threat.severity).toBe(7);
      expect(threat.additionalInfo).toBe('See MITRE T1218.');
      expect(threat.familyId).toBe(9);
      expect(threat.isUserDefined).toBe(true);
      expect(threat.methodCount).toBe(12);
    });

    it('keeps creation_date as an ISO string (Redux-serializable)', () => {
      expect(toThreat(dto).createdAt).toBe('2026-04-01');
    });

    it('maps family_class to ThreatKind sum type', () => {
      expect(toThreat({ ...dto, family_class: 'doc' }).kind).toBe('compromise');
      expect(toThreat({ ...dto, family_class: 'dopv' }).kind).toBe(
        'policyViolation',
      );
    });

    it('flattens links.threat and links.family into a single array tagged by scope', () => {
      expect(toThreat(dto).links).toEqual([
        {
          name: 'MITRE',
          url: 'https://attack.mitre.org/T1218',
          referenceType: 'mitre',
          scope: 'threat',
        },
        {
          name: 'Family ATT&CK',
          url: 'https://attack.mitre.org/groups/G0001',
          referenceType: 'mitre',
          scope: 'family',
        },
      ]);
    });

    describe('tenant fields are independent', () => {
      it('no_tenant maps to isVisibleWithoutTenant regardless of all_tenants', () => {
        expect(
          toThreat({ ...dto, no_tenant: true, all_tenants: false }),
        ).toMatchObject({ isVisibleWithoutTenant: true });
        expect(
          toThreat({ ...dto, no_tenant: true, all_tenants: true }),
        ).toMatchObject({ isVisibleWithoutTenant: true });
        expect(
          toThreat({ ...dto, no_tenant: false, all_tenants: true }),
        ).toMatchObject({ isVisibleWithoutTenant: false });
        expect(
          toThreat({ ...dto, no_tenant: false, all_tenants: false }),
        ).toMatchObject({ isVisibleWithoutTenant: false });
      });

      it('maps all_tenants=true to tenantScope.mode=all (tenants list ignored)', () => {
        expect(
          toThreat({ ...dto, all_tenants: true, tenants: [1, 2, 3] })
            .tenantScope,
        ).toEqual({ mode: 'all' });
      });

      it('maps all_tenants=false with tenants list to tenantScope.mode=specific', () => {
        expect(
          toThreat({ ...dto, all_tenants: false, tenants: [1, 2] }).tenantScope,
        ).toEqual({ mode: 'specific', tenantIds: [1, 2] });
      });
    });

    it('tolerates missing optional fields on legacy server payloads', () => {
      const incomplete = {
        ...dto,
        links: undefined,
        no_tenant: undefined,
        all_tenants: undefined,
        tenants: undefined,
      } as unknown as ThreatDto;
      expect(toThreat(incomplete)).toMatchObject({
        links: [],
        isVisibleWithoutTenant: false,
        tenantScope: { mode: 'specific', tenantIds: [] },
      });
    });

    it('tolerates malformed links and tenants', () => {
      const malformed = {
        ...dto,
        links: 'oops' as unknown,
        tenants: '' as unknown,
      } as unknown as ThreatDto;
      const result = toThreat(malformed);
      expect(result.links).toEqual([]);
      expect(result.tenantScope).toEqual({ mode: 'specific', tenantIds: [] });
    });

    it('tolerates partial links object (only threat or only family)', () => {
      const onlyThreat = {
        ...dto,
        links: {
          threat: [
            {
              name: 'a',
              link: 'https://a.example',
              reference_type: 'r',
            },
          ],
          family: undefined,
        } as unknown,
      } as unknown as ThreatDto;
      expect(toThreat(onlyThreat).links).toEqual([
        {
          name: 'a',
          url: 'https://a.example',
          referenceType: 'r',
          scope: 'threat',
        },
      ]);
    });
  });

  describe('toThreatDto round-trip', () => {
    const cases: { name: string; overrides: Partial<ThreatDto> }[] = [
      { name: 'specific tenants, hidden globally', overrides: {} },
      {
        name: 'no_tenant=true, specific tenants',
        overrides: { no_tenant: true, all_tenants: false, tenants: [3] },
      },
      {
        name: 'no_tenant=true, all_tenants=true (independent flags both on)',
        overrides: { no_tenant: true, all_tenants: true, tenants: [] },
      },
      {
        name: 'no_tenant=false, all_tenants=true',
        overrides: { no_tenant: false, all_tenants: true, tenants: [] },
      },
      {
        name: 'policyViolation kind',
        overrides: { family_class: 'dopv' },
      },
    ];

    it.each(cases)('round-trips: $name', ({ overrides }) => {
      const subject = { ...dto, ...overrides };
      expect(toThreatDto(toThreat(subject))).toEqual(subject);
    });
  });

  describe('toThreatPayloadDto', () => {
    it('translates a domain payload to the server payload shape', () => {
      const payload: ThreatPayload = {
        kind: 'compromise',
        name: 'Test',
        description: 'A test threat',
        additionalInfo: 'Optional notes',
        isVisibleWithoutTenant: false,
        tenantScope: { mode: 'specific', tenantIds: [3, 7] },
      };
      expect(toThreatPayloadDto(payload)).toEqual({
        family_class: 'doc',
        name: 'Test',
        description: 'A test threat',
        additional_info: 'Optional notes',
        no_tenant: false,
        all_tenants: false,
        tenants: [3, 7],
      });
    });

    it('emits no_tenant and all_tenants independently', () => {
      const payload: ThreatPayload = {
        kind: 'compromise',
        name: 'X',
        description: 'd',
        isVisibleWithoutTenant: true,
        tenantScope: { mode: 'all' },
      };
      const wire = toThreatPayloadDto(payload);
      expect(wire.no_tenant).toBe(true);
      expect(wire.all_tenants).toBe(true);
      expect(wire.tenants).toEqual([]);
    });

    it('emits all_tenants=false with tenant list when scope is specific', () => {
      const payload: ThreatPayload = {
        kind: 'policyViolation',
        name: 'X',
        description: 'd',
        isVisibleWithoutTenant: false,
        tenantScope: { mode: 'specific', tenantIds: [1] },
      };
      const wire = toThreatPayloadDto(payload);
      expect(wire.all_tenants).toBe(false);
      expect(wire.tenants).toEqual([1]);
    });
  });
});
