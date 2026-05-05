import {
  Threat,
  ThreatKind,
  ThreatPayload,
  ThreatTenantScope,
} from '../model/threat';
import { ThreatDto, ThreatPayloadDto } from './threat.dto';

const KIND_BY_FAMILY_CLASS: Record<ThreatDto['family_class'], ThreatKind> = {
  doc: 'compromise',
  dopv: 'policyViolation',
};

const FAMILY_CLASS_BY_KIND: Record<ThreatKind, ThreatDto['family_class']> = {
  compromise: 'doc',
  policyViolation: 'dopv',
};

const toTenantScope = (dto: {
  all_tenants?: boolean;
  tenants?: number[];
}): ThreatTenantScope =>
  dto.all_tenants
    ? { mode: 'all' }
    : {
        mode: 'specific',
        tenantIds: Array.isArray(dto.tenants) ? dto.tenants : [],
      };

const fromTenantScope = (
  scope: ThreatTenantScope,
): Pick<ThreatDto, 'all_tenants' | 'tenants'> =>
  scope.mode === 'all'
    ? { all_tenants: true, tenants: [] }
    : { all_tenants: false, tenants: scope.tenantIds };

export const toThreat = (dto: ThreatDto): Threat => ({
  id: dto.pk,
  threatId: dto.threat_id,
  kind: KIND_BY_FAMILY_CLASS[dto.family_class],
  name: dto.name,
  description: dto.description,
  additionalInfo: dto.additional_info,
  severity: dto.criticity,
  version: dto.version,
  isActive: dto.active,
  createdAt: dto.creation_date,
  familyId: dto.family,
  links: [
    ...(Array.isArray(dto.links?.threat) ? dto.links.threat : []).map((l) => ({
      name: l.name,
      url: l.link,
      referenceType: l.reference_type,
      scope: 'threat' as const,
    })),
    ...(Array.isArray(dto.links?.family) ? dto.links.family : []).map((l) => ({
      name: l.name,
      url: l.link,
      referenceType: l.reference_type,
      scope: 'family' as const,
    })),
  ],
  isUserDefined: dto.user_defined,
  methodCount: dto.nb_methods,
  isVisibleWithoutTenant: dto.no_tenant ?? false,
  tenantScope: toTenantScope(dto),
});

export const toThreatDto = (threat: Threat): ThreatDto => ({
  pk: threat.id,
  threat_id: threat.threatId,
  name: threat.name,
  description: threat.description,
  additional_info: threat.additionalInfo,
  criticity: threat.severity,
  version: threat.version,
  active: threat.isActive,
  creation_date: threat.createdAt.slice(0, 10),
  family: threat.familyId,
  family_class: FAMILY_CLASS_BY_KIND[threat.kind],
  links: {
    threat: threat.links
      .filter((l) => l.scope === 'threat')
      .map((l) => ({
        name: l.name,
        link: l.url,
        reference_type: l.referenceType,
      })),
    family: threat.links
      .filter((l) => l.scope === 'family')
      .map((l) => ({
        name: l.name,
        link: l.url,
        reference_type: l.referenceType,
      })),
  },
  user_defined: threat.isUserDefined,
  nb_methods: threat.methodCount,
  no_tenant: threat.isVisibleWithoutTenant,
  ...fromTenantScope(threat.tenantScope),
});

export const toThreatPayloadDto = (
  payload: ThreatPayload,
): ThreatPayloadDto => ({
  family_class: FAMILY_CLASS_BY_KIND[payload.kind],
  name: payload.name,
  description: payload.description,
  additional_info: payload.additionalInfo,
  no_tenant: payload.isVisibleWithoutTenant,
  ...fromTenantScope(payload.tenantScope),
});
