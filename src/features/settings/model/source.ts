/**
 * A Suricata rule source the appliance fetches signatures from.
 */
export type Source = {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  method: string;
  datatype: string;
  uri: string;
  certVerify: boolean;
  useIprepd: boolean;
  version: string;
  useSysProxy: boolean;
  untrusted: boolean;
  authKey: string;
  removeOriginalSids: boolean;
};
