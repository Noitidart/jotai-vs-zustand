import { type StoreApi, create } from 'zustand';
import { type ReadonlyStoreApi } from './types';

/**
 * Creates a read-only derived store from a source store using a selector.
 *
 * Prevents unnecessary re-renders AND unnecessary re-computation — `derive`
 * only fires when the selected slice changes (as determined by
 * `selectorEqualityFn`, defaults to `Object.is`).
 *
 * **Note:** Unlike `createDerivedStore`, this skips the computation entirely
 * when the selected slice hasn't changed. Use this when the computation is
 * expensive or the source store has frequent unrelated changes.
 *
 * ## When to use
 *
 * Use when the source store is broad (many unrelated keys that change
 * frequently) and the computation is expensive. The selector gate skips
 * both the computation and the setState call when only unrelated keys change.
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
 * @see createDerivedStore — simpler variant that prevents re-renders but not re-computation
 */

type DerivedStoreWithSelectorConfig<State, Slice, Derived> = {
  sourceStore: StoreApi<State>;
  selector: (state: State) => Slice;
  derive: (slice: Slice) => Derived;
};

type DerivedStoreWithSelectorOptions<Slice> = {
  selectorEqualityFn?: (a: Slice, b: Slice) => boolean;
};

// TODO: delete when copying to prod
let selectorCount = 0;
// TODO: delete when copying to prod
let equalityFnCount = 0;
// TODO: delete when copying to prod
let computeCount = 0;

export function createDerivedStoreWithSelector<State, Slice, Derived>(
  config: DerivedStoreWithSelectorConfig<State, Slice, Derived>,
  options?: DerivedStoreWithSelectorOptions<Slice>
): ReadonlyStoreApi<Derived> {
  const { sourceStore, selector, derive } = config;
  const selectorEqualityFn = options?.selectorEqualityFn ?? Object.is;

  // TODO: delete when copying to prod
  selectorCount++;
  // TODO: delete when copying to prod
  console.log(`[derived-sws] selector #${selectorCount}`);
  let currentSlice = selector(sourceStore.getState());

  // TODO: delete when copying to prod
  computeCount++;
  // TODO: delete when copying to prod
  console.log(`[derived-sws] computation #${computeCount}`);
  const initialValue = derive(currentSlice);

  const api = create<Derived>(() => initialValue);
  const { setState } = api;

  sourceStore.subscribe((state) => {
    // TODO: delete when copying to prod
    selectorCount++;
    // TODO: delete when copying to prod
    console.log(`[derived-sws] selector #${selectorCount}`);

    const nextSlice = selector(state);

    // TODO: delete when copying to prod
    equalityFnCount++;
    // TODO: delete when copying to prod
    console.log(`[derived-sws] equalityFn #${equalityFnCount}`);

    if (!selectorEqualityFn(nextSlice, currentSlice)) {
      currentSlice = nextSlice;

      // TODO: delete when copying to prod
      computeCount++;
      // TODO: delete when copying to prod
      console.log(`[derived-sws] computation #${computeCount}`);
      setState(derive(nextSlice), true);
    }
  });

  // Standard TS pattern to delete a property from typed objects
  delete (api as unknown as Record<string, unknown>).setState;
  return api as ReadonlyStoreApi<Derived>;
}
