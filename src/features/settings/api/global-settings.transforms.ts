import type { GlobalSettings } from '../model/global-settings';
import type { GlobalSettingsDto } from './global-settings.dto';

export const toGlobalSettings = (dto: GlobalSettingsDto): GlobalSettings => ({
  multiTenancy: dto.multi_tenancy,
});
