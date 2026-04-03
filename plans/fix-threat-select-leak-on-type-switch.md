# Plan: Fix threat select option leaking across DoC/DoPV type switch

**Created**: 2026-04-03
**Branch**: leaking-threats
**Status**: implemented

## Goal

When a user creates a custom threat inside the Declaration filter action form, the newly created threat should immediately appear in the Select dropdown (via optimistic cache update) and be auto-selected — without a hacky `threatResult` state that leaks across DoC/DoPV type switches.

Currently, `threatResult` stores the created threat name and renders a temporary `SelectItem` that bypasses the `family_class` filtering. Switching from DoC to DoPV (or vice versa) keeps the stale option visible until the modal is reopened.

## Acceptance Criteria

- [x] Creating a custom threat immediately shows it in the Select dropdown and auto-selects it
- [x] Switching between DoC and DoPV never shows threats from the other family
- [x] Editing a custom threat reflects the updated name in the Select dropdown immediately
- [x] The `threatResult` state hack and its temporary `SelectItem` are removed
- [x] Existing behavior is preserved: cancel, submit, error handling all work as before

## Steps

### Step 1: Add optimistic cache update to `createThreat` mutation

**Complexity**: standard
**RED**: Write test that verifies `createThreat` mutation's `onQueryStarted` inserts the new threat entity into the `getCustomThreats` cache, and undoes it on failure.
**GREEN**: Add `onQueryStarted` handler to `createThreat` in `threats.api.ts` that uses `applyOptimisticUpdateToAllCacheEntries` to insert the response entity into the `customThreatsAdapter` cache. The mutation response already returns the full `Threat` object.
**REFACTOR**: None needed
**Files**: `src/features/threats/common/threats.api.ts`, `src/features/threats/common/threats.api.test.ts`
**Commit**: `feat(threats): add optimistic cache update to createThreat mutation`

### Step 2: Add optimistic cache update to `updateThreat` mutation

**Complexity**: standard
**RED**: Write test that verifies `updateThreat` mutation's `onQueryStarted` updates the existing threat entity in the `getCustomThreats` cache, and undoes it on failure.
**GREEN**: Add `onQueryStarted` handler to `updateThreat` in `threats.api.ts` using the same `applyOptimisticUpdateToAllCacheEntries` pattern, updating the matching entity by `pk`.
**REFACTOR**: None needed
**Files**: `src/features/threats/common/threats.api.ts`, `src/features/threats/common/threats.api.test.ts`
**Commit**: `feat(threats): add optimistic cache update to updateThreat mutation`

### Step 3: Remove `threatResult` hack and use optimistic data in the declaration form

**Complexity**: standard
**RED**: Write test for `CreateEditDeclarationFilterActionForm` that creates a custom threat, verifies the Select immediately contains the new option (from cache, not from local state), and verifies switching DoC/DoPV does not show the previously created threat.
**GREEN**: In `create-edit-declaration.form.tsx`:
- Remove `threatResult` state and its `useEffect`
- Remove the conditional temporary `SelectItem` block (lines 349-356)
- Simplify `handleCustomThreatMutationSuccess` to just close the modal and set `form.setValue('threat', threatName)` — the option will already exist in the Select via the optimistic cache update
- Clear the `threat` field value in the existing `useUpdateEffect` for `isDoc` (already done on line 158-159)
**REFACTOR**: Simplify `threatModal` state — consider if the create/edit dialog pattern can be cleaned up now that the workaround is gone.
**Files**: `src/features/filter-actions/components/filter-actions/create-edit-declaration-events/create-edit-declaration.form.tsx`, `src/features/filter-actions/components/filter-actions/create-edit-declaration-events/create-edit-declaration.form.test.tsx`
**Commit**: `fix(filter-actions): remove threat select leak across DoC/DoPV switch`

### Step 4: Verify end-to-end and run quality checks

**Complexity**: trivial
**RED**: N/A (integration verification)
**GREEN**: Run `pnpm run fmt && pnpm run lint --fix && pnpm run check` and fix any issues.
**REFACTOR**: None needed
**Files**: N/A
**Commit**: `chore: quality check fixes` (if needed)

## Complexity Classification

| Rating | Criteria | Review depth |
|--------|----------|--------------|
| `trivial` | Single-file rename, config change, typo fix, documentation-only | Skip inline review; covered by final `/code-review --changed` |
| `standard` | New function, test, module, or behavioral change within existing patterns | Spec-compliance + relevant quality agents |
| `complex` | Architectural change, security-sensitive, cross-cutting concern, new abstraction | Full agent suite including opus-tier agents |

## Pre-PR Quality Gate

- [ ] All tests pass
- [ ] Type check passes (`pnpm run check`)
- [ ] Linter passes (`pnpm run lint --fix`)
- [ ] `/code-review --changed` passes
- [ ] No regressions in filter action create/edit flow

## Risks & Open Questions

- **Optimistic insert timing**: The `onQueryStarted` handler fires before `queryFulfilled`. For `createThreat`, we need the server response to get the `pk` and full entity. We should await `queryFulfilled` and then insert (pessimistic update), rather than a true optimistic insert — since we don't have the `pk` before the server responds. The existing `applyOptimisticUpdateToAllCacheEntries` utility handles this pattern (it patches immediately then undoes on failure), but for create we may want to insert *after* fulfillment. Check if the existing utility pattern is sufficient or if we need a simpler `queryFulfilled.then(insert)` approach.
- **Entity adapter**: The `getCustomThreats` query uses `customThreatsAdapter.setAll` in `transformResponse`, so the cache shape is `EntityState<Threat, number>`. The optimistic update must use `customThreatsAdapter.upsertOne(draft, newThreat)` rather than plain object mutation.
- **Adapter not exported**: `customThreatsAdapter` is local to `threats.api.ts`. The `onQueryStarted` handler is defined in the same file, so this is fine — no export needed.
