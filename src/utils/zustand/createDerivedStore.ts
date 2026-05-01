import { type StoreApi, create } from 'zustand';
import { type ReadonlyStoreApi } from './types';

/**
 * Creates a read-only derived store from a source store.
 *
 * Prevents unnecessary re-renders — `derive` runs on every source store change,
 * but `setState` is gated by `deriveEqualityFn` (defaults to `Object.is`).
 *
 * **Note:** This runs `derive` on every source store change, even unrelated ones.
 * The `deriveEqualityFn` only gates whether `setState` fires (preventing
 * unnecessary re-renders). If you also need to skip the computation entirely on
 * unrelated changes, use `createDerivedStoreWithSelector` instead.
 *
 * ## When to use
 *
 * Use when the source store is focused (only related keys) — every change
 * is meaningful, so there's no wasted computation. This is the normal/default
 * behavior (same as Jotai's derived atoms).
 *
 * ## Why not merge with `createDerivedStoreWithSelector`?
 *
 * These are separate functions because the logic path is fundamentally different:
 *
 * - **This function** (no selector): gates AFTER computation — derive always runs,
 *   then `deriveEqualityFn` decides whether to setState. One gate, no extra cache.
 *
 * - **`createDerivedStoreWithSelector`**: gates BEFORE computation — selector runs
 *   first, `selectorEqualityFn` compares against cached slice, and derive only
 *   runs if the slice changed. Requires an extra `currentSlice` cache.
 *
 * While the caches wouldn't overlap (each branch has its own), merging would mean
 * two different code paths inside one function. Keeping them separate makes each
 * function's gate and purpose immediately clear at the call site.
 *
 * ## Why store-level derivation?
 *
 * Zustand's `useStore(selector)` runs the selector at **every call site**.
 * If 10 components select the same derived value, the computation runs
 * 10 times. `useShallow` also runs at every call site — it just prevents
 * re-renders via shallow comparison.
 *
 * These utilities move the derivation **to the store level** — computation
 * runs once regardless of how many components read the result. Components
 * simply `useDerivedStore()` with zero per-site cost.
 *
 * @see https://zustand.docs.pmnd.rs/learn/guides/beginner-typescript#multiple-selectors
 * @see https://zustand.docs.pmnd.rs/learn/guides/beginner-typescript#derived-state-with-selectors
 * @see createDerivedStoreWithSelector — also prevents unnecessary re-computation
 */

type DerivedStoreConfig<State, Derived> = {
  sourceStore: StoreApi<State>;
  derive: (state: State) => Derived;
};

type DerivedStoreOptions<Derived> = {
  deriveEqualityFn?: (a: Derived, b: Derived) => boolean;
};

// TODO: delete when copying to prod
let computeCount = 0;

export function createDerivedStore<State, Derived>(
  config: DerivedStoreConfig<State, Derived>,
  options?: DerivedStoreOptions<Derived>
): ReadonlyStoreApi<Derived> {
  const { sourceStore, derive } = config;
  const deriveEqualityFn = options?.deriveEqualityFn ?? Object.is;

  // TODO: delete when copying to prod
  computeCount++;
  // TODO: delete when copying to prod
  console.log(`[derived-plain] computation #${computeCount}`);
  const initialValue = derive(sourceStore.getState());

  const api = create<Derived>(() => initialValue);
  const { setState } = api;

  sourceStore.subscribe((state) => {
    // TODO: delete when copying to prod
    computeCount++;
    // TODO: delete when copying to prod
    console.log(`[derived-plain] computation #${computeCount}`);
    const next = derive(state);
    const current = api.getState();

    if (!deriveEqualityFn(next, current)) {
      setState(next, true);
    }
  });

  // Standard TS pattern to delete a property from typed objects
  delete (api as unknown as Record<string, unknown>).setState;
  return api as ReadonlyStoreApi<Derived>;
}
