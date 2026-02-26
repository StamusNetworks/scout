# Shareable Links

## Overview

Allow users to generate a shareable URL that captures their current app state (route, time filters, query filters, tag filters, tenant) and share it with others. Clicking a shared link restores that exact state.

## URL Format

New route: `/share?s=<base64url-encoded JSON>`

### Payload Shape

```typescript
type ShareableState = {
  /** Target route path, e.g. "/hosts/42/incidents" */
  route: string;
  /** Tenant ID — only present when multi-tenancy is enabled */
  tenant?: number;
  /** Time filter state */
  time:
    | { type: 'all' }
    | { type: 'auto' }
    | { type: 'from'; duration: number; unit: TimeUnit }
    | { type: 'range'; start: number; end: number };
  /** Tag filters — event types, alert tags, novelty */
  tags: {
    alert: boolean;
    stamus: boolean;
    discovery: boolean;
    relevant: boolean;
    informational: boolean;
    untagged: boolean;
    novelty: boolean;
  };
  /** Active (non-suspended) query filters with full state */
  filters: Array<{
    key: string;
    value: string | number;
    negated?: boolean;
    wildcarded?: boolean;
  }>;
};
```

- Param name: `s` (compact)
- Encoding: base64url (URL-safe, no percent-encoding)
- `time.type: 'auto'` carries no dates — receiver fetches auto range from API
- `negated`/`wildcarded` omitted when false to reduce payload size
- Only active (non-suspended) filters are exported

## Export (Share Button)

- **Location**: Header toolbar, between Reload button and DatesPicker
- **Icon**: `Link` from lucide-react
- **Behavior**: Click → build ShareableState from Redux + useLocation() → base64url-encode → construct full URL → copy to clipboard → `toast.success('Link copied to clipboard')`
- **Component**: `ShareButton` in the header folder

## Import (Share Page)

- New page at `src/pages/share/index.tsx`
- Registered as `/share` route in `router.tsx`
- On mount:
  1. Decode `s` param → parse JSON → validate shape
  2. Set tenant if multi-tenant and tenant provided
  3. Dispatch `setDates(...)` with the time filter
  4. Dispatch `clearQueryFilters()` then `addQueryFilter()` for each filter with negated/wildcarded options
  5. Dispatch `updateTagFilters(...)` for all tag booleans
  6. `<Navigate to={state.route} replace />` to the target page
- On error: navigate to dashboard with `toast.error`

## Backward Compatibility

- `/deeplink` route stays unchanged
- `/share` is a separate route
- No changes to existing deeplink management (`/deeplinks`)
