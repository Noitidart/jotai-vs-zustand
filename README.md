# Bears: Jotai vs Zustand

A playground comparing 4 approaches to derived state across Jotai and Zustand.

## Running

```bash
npm install
npm dev       # start the app
npm test      # run automated tests (vitest)
```

## The 4 Approaches

| Approach | How derivation works |
|---|---|
| **Jotai** | `atom((get) => ...)` — derived atom reads parent on every change |
| **Zustand store (plain)** | `subscribe(callback)` — runs computation on every store change, writes to a second store |
| **Zustand store (subscribeWithSelector)** | `subscribe(selector, listener, { equalityFn })` — selector+equalityFn pipeline gates the listener |
| **Zustand selector** | `useStore(selector)` — runs computation at each call site via `useSyncExternalStore` |

## Manual Testing

1. Open DevTools console
2. Reload the page — note the mount logs
3. Click **unrelatedCount +1** — did the computation fire? did the display re-render?
4. Reload the page, then click **bears +1** — computation fires, display re-renders
5. Repeat for each playground and compare

## Automated Tests

3 scenarios per playground (12 tests total), each capturing `console.log` output:

- **Mount only** — observe mount-phase behavior
- **Mount + click unrelatedCount** — does unrelated state change trigger unnecessary work?
- **Mount + click bears** — does related state change correctly propagate?

## Results

### Mount Only

| Metric | Jotai | zstore-plain | zstore-sws | zselector |
|---|---|---|---|---|
| Computations | 1 | 1 | 1 | 6 (3/site) |
| Selector calls | — | — | 1 | — |
| EqualityFn calls | — | — | 0 | — |
| Renders per site | 2 | 1 | 1 | 1 |
| Post-mount re-renders | Yes (+2) | No | No | No |

### +1 Unrelated Click (on top of mount)

| Metric | Jotai | zstore-plain | zstore-sws | zselector |
|---|---|---|---|---|
| Extra computations | +1 | +1 | **+0** | +2 (1/site) |
| Extra selector calls | — | — | +1 | — |
| Extra equalityFn calls | — | — | +1 | — |
| Extra renders | 0 | 0 | 0 | 0 |
| **Computation skipped?** | **No** | **No** | **Yes** | **No** |

### +1 Related Click (bears, on top of mount)

| Metric | Jotai | zstore-plain | zstore-sws | zselector |
|---|---|---|---|---|
| Extra computations | +1 | +1 | +1 | +8 (4/site) |
| Extra selector calls | — | — | +1 | — |
| Extra equalityFn calls | — | — | +1 | — |
| Extra renders per site | +1 | +1 | +1 | +1 |

## Key Learnings

1. **subscribeWithSelector is the only approach that skips the computation entirely on unrelated changes.** Jotai, zstore-plain, and zselector all run the computation — they just gate the re-render afterward.

2. **Jotai has extra post-mount renders.** It renders each site twice after `mounted` (total 2 per site vs 1 for all others). This is Jotai's `useAtom`/`useAtomValue` triggering additional subscription verification.

3. **zselector multiplies work by N call sites.** Every computation runs independently at each `useStore(selector)` call site. With 2 sites and `useSyncExternalStore` verification passes, a single related click causes 14 computations (7 per site).

4. **zstore-plain and zstore-sws share the computation, making both optimal for expensive computations with many consumers.** The subscribe pattern runs once regardless of how many consumers read the derived store.

5. **All 4 approaches correctly skip re-renders on unrelated changes.** The difference is *how much work they do before deciding to skip*:
   - zstore-sws: selector + equalityFn → computation skipped entirely
   - Jotai/zstore-plain: computation runs → result unchanged → re-render skipped
   - zselector: computation runs at every call site → `Object.is` comparison → re-render skipped

6. **Use zstore-sws over zstore-plain only when you have a complex store and only need a subset of its keys.** This allows subscribeWithSelector to skip the computation entirely on unrelated changes. Otherwise, zstore-plain is simpler and equally performant.
