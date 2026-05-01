import { type StoreApi, create } from 'zustand';
import { type ReadonlyStoreApi } from './types';

/**
 * Creates a read-only derived store from a source store using a selector.
 *
 * Runs `selector` first, then `equalityFn` compares the selected slice.
 * **The derivation only fires when the slice changes** — making this the
 * most efficient option for expensive computations on stores with frequent
 * unrelated changes.
 *
 * The `equalityFn` defaults to `Object.is`, matching Zustand's
 * `subscribeWithSelector` middleware.
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
 * simply `useDerivedStore(s => s)` with zero per-site cost.
 *
 * @see https://zustand.docs.pmnd.rs/learn/guides/beginner-typescript#multiple-selectors
 * @see https://zustand.docs.pmnd.rs/learn/guides/beginner-typescript#derived-state-with-selectors
 */

type DerivedStoreWithSelectorConfig<State, Slice, Derived> = {
  sourceStore: StoreApi<State>;
  selector: (state: State) => Slice;
  derive: (slice: Slice) => Derived;
};

type DerivedStoreWithSelectorOptions<Slice> = {
  equalityFn?: (a: Slice, b: Slice) => boolean;
};

let selectorCount = 0;
let equalityFnCount = 0;
let computeCount = 0;

export function createDerivedStoreWithSelector<State, Slice, Derived>(
  config: DerivedStoreWithSelectorConfig<State, Slice, Derived>,
  options?: DerivedStoreWithSelectorOptions<Slice>
): ReadonlyStoreApi<Derived> {
  const { sourceStore, selector, derive } = config;
  const equalityFn = options?.equalityFn ?? Object.is;

  selectorCount++;
  console.log(`[derived-sws] selector #${selectorCount}`);
  let currentSlice = selector(sourceStore.getState());

  computeCount++;
  console.log(`[derived-sws] computation #${computeCount}`);
  const initialValue = derive(currentSlice);

  const api = create<Derived>(() => initialValue);
  const { setState } = api;

  sourceStore.subscribe((state) => {
    selectorCount++;
    console.log(`[derived-sws] selector #${selectorCount}`);

    const nextSlice = selector(state);

    equalityFnCount++;
    console.log(`[derived-sws] equalityFn #${equalityFnCount}`);

    if (!equalityFn(nextSlice, currentSlice)) {
      currentSlice = nextSlice;

      computeCount++;
      console.log(`[derived-sws] computation #${computeCount}`);
      setState(derive(nextSlice), true);
    }
  });

  delete (api as unknown as Record<string, unknown>).setState;
  return api as ReadonlyStoreApi<Derived>;
}
