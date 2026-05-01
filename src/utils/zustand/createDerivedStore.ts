import { type StoreApi, create } from 'zustand';
import { type ReadonlyStoreApi } from './types';

/**
 * Creates a read-only derived store from a source store.
 *
 * Runs `derive` on every source store change. The `deriveEqualityFn` compares
 * the new and previous derived output — if equal, setState is skipped.
 *
 * The `deriveEqualityFn` defaults to `Object.is`, matching Zustand's
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
