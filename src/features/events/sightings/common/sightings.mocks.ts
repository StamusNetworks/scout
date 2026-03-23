import { makeSightingEvent } from '@/features/events/common/events.mocks';
import { Event } from '@/features/events/common/events.model';

export const makeSightingApiEvent = (overrides: Partial<Event> = {}): Event =>
  makeSightingEvent({ _id: 'sighting-api-1', ...overrides });
