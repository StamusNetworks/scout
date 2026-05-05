import type { SciriusContext } from '../model/scirius-context';
import type { SciriusContextDto } from './scirius-context.dto';

export const toSciriusContext = (dto: SciriusContextDto): SciriusContext => ({
  title: dto.title,
  shortTitle: dto.short_title,
  commonLongName: dto.common_long_name,
  productLongName: dto.product_long_name,
  contentLead: dto.content_lead,
  contentMinor1: dto.content_minor1,
  contentMinor2: dto.content_minor2,
  contentMinor3: dto.content_minor3,
  adminTitle: dto.admin_title,
  version: dto.version,
  icon: dto.icon,
  probesCount: dto.nb_probes,
});
