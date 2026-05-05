import type { PersistedFilter } from '@/features/query-filters/query-filter.model';

import type {
  FilterSet,
  FilterSetCreateInput,
  FilterSetTags,
} from '../model/filter-set';
import type {
  FilterSetCreatePayloadDto,
  FilterSetDto,
  FilterSetTagsDto,
} from './filter-set.dto';

/**
 * Wire `alerts/sightings` ↔ domain `alert/discovery`. Filter-sets do
 * not persist `novelty`, so it is not part of these tags.
 */
const wireTagsToDomain = (wire: FilterSetTagsDto): FilterSetTags => ({
  stamus: wire.stamus ?? true,
  alert: wire.alerts,
  discovery: wire.sightings,
  informational: wire.informational,
  relevant: wire.relevant,
  untagged: wire.untagged,
});

const domainTagsToWire = (domain: FilterSetTags): FilterSetTagsDto => ({
  stamus: domain.stamus,
  alerts: domain.alert,
  sightings: domain.discovery,
  informational: domain.informational,
  relevant: domain.relevant,
  untagged: domain.untagged,
});

const isTagsEntry = (
  item: FilterSetDto['content'][number],
): item is { id: 'alert.tag'; value: FilterSetTagsDto } =>
  item.id === 'alert.tag';

export const toFilterSet = (dto: FilterSetDto): FilterSet => {
  const tagsEntry = dto.content.find(isTagsEntry);
  const filters = dto.content.filter(
    (item): item is PersistedFilter => !isTagsEntry(item),
  );
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description,
    page: dto.page,
    imported: dto.imported,
    share: dto.share,
    filters,
    tags: tagsEntry ? wireTagsToDomain(tagsEntry.value) : undefined,
  };
};

export const toCreatePayloadDto = (
  input: FilterSetCreateInput,
): FilterSetCreatePayloadDto => ({
  name: input.name,
  page: input.page,
  share: input.share,
  description: input.description,
  filters: input.filters,
  tags: input.tags ? domainTagsToWire(input.tags) : undefined,
});
