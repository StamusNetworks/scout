import { CreateDeeplink, Deeplink } from '../model/deep-link';
import {
  CreateDeeplinkDto,
  DeeplinkDto,
  UpdateDeeplinkDto,
} from './deeplink.dto';

export const toDeeplink = (dto: DeeplinkDto): Deeplink => ({
  id: dto.pk,
  name: dto.name,
  template: dto.template,
  entities: dto.entities.map((e) => e.name),
  all: dto.all,
  userDefined: dto.user_defined,
  enabled: dto.enabled,
});

export const toCreateDeeplinkPayload = (
  domain: CreateDeeplink,
): CreateDeeplinkDto => ({
  name: domain.name,
  template: domain.template,
  entities: domain.entities.map((name) => ({ name })),
  all: domain.all,
});

export const toUpdateDeeplinkPayload = (
  domain: Partial<CreateDeeplink> & { id: number; enabled?: boolean },
): UpdateDeeplinkDto => ({
  pk: domain.id,
  ...(domain.name !== undefined ? { name: domain.name } : {}),
  ...(domain.template !== undefined ? { template: domain.template } : {}),
  ...(domain.entities !== undefined
    ? { entities: domain.entities.map((name) => ({ name })) }
    : {}),
  ...(domain.all !== undefined ? { all: domain.all } : {}),
  ...(domain.enabled !== undefined ? { enabled: domain.enabled } : {}),
});
