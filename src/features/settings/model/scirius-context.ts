/**
 * Branding / product identity served by the appliance. Used to render
 * product names, version, and probe count on the help menu and chrome.
 */
export type SciriusContext = {
  title: string;
  shortTitle: string;
  commonLongName: string;
  productLongName: string;
  contentLead: string;
  contentMinor1: string;
  contentMinor2: string;
  contentMinor3: string;
  adminTitle: string;
  version: string;
  icon: boolean;
  probesCount: number;
};
