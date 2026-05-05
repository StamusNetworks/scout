export type SourceDto = {
  pk: number;
  name: string;
  created_date: string;
  updated_date: string;
  method: string;
  datatype: string;
  uri: string;
  cert_verif: boolean;
  use_iprepd: boolean;
  version: string;
  use_sys_proxy: boolean;
  untrusted: boolean;
  authkey: string;
  remove_original_sids: boolean;
};
