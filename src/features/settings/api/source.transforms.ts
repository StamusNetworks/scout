import type { Source } from '../model/source';
import type { SourceDto } from './source.dto';

export const toSource = (dto: SourceDto): Source => ({
  id: dto.pk,
  name: dto.name,
  createdAt: dto.created_date,
  updatedAt: dto.updated_date,
  method: dto.method,
  datatype: dto.datatype,
  uri: dto.uri,
  certVerify: dto.cert_verif,
  useIprepd: dto.use_iprepd,
  version: dto.version,
  useSysProxy: dto.use_sys_proxy,
  untrusted: dto.untrusted,
  authKey: dto.authkey,
  removeOriginalSids: dto.remove_original_sids,
});
