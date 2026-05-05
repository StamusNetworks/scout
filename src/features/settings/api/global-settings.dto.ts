/**
 * Wire shape for `/appliances/global_settings/`. Only the few fields
 * that have client consumers are listed here. The endpoint itself
 * returns 100+ fields; this DTO captures the read surface.
 */
export type GlobalSettingsDto = {
  multi_tenancy: boolean;
};
