import {
  createStore,
  type StoreApi,
  type UseBoundStore,
  useStore
} from 'zustand';

type ReadonlyStoreApi<T> = Pick<
  StoreApi<T>,
  'getState' | 'getInitialState' | 'subscribe'
>;

/**
 * Creates a read-only derived store from a source store.
 *
 * Runs `derive` on every source store change. The `equalityFn` compares
 * the new and previous derived output — if equal, setState is skipped.
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

type DerivedStoreConfig<State, Derived> = {
  sourceStore: StoreApi<State>;
  derive: (state: State) => Derived;
};

type DerivedStoreOptions<Derived> = {
  equalityFn?: (a: Derived, b: Derived) => boolean;
};

function bindUseStore<T>(
  api: ReadonlyStoreApi<T>
): UseBoundStore<ReadonlyStoreApi<T>> {
  const bound = ((selector?: (state: T) => unknown) =>
    selector ? useStore(api, selector) : useStore(api)) as UseBoundStore<
    ReadonlyStoreApi<T>
  >;

  return Object.assign(bound, {
    getState: api.getState,
    getInitialState: api.getInitialState,
    subscribe: api.subscribe
  });
}

export function createDerivedStore<State, Derived>(
  config: DerivedStoreConfig<State, Derived>,
  options?: DerivedStoreOptions<Derived>
): UseBoundStore<ReadonlyStoreApi<Derived>> {
  const { sourceStore, derive } = config;
  const equalityFn = options?.equalityFn ?? Object.is;

  const initialValue = derive(sourceStore.getState());

  const api = createStore<Derived>(() => initialValue);

  sourceStore.subscribe((state) => {
    const next = derive(state);
    const current = api.getState();

    if (!equalityFn(next, current)) {
      api.setState(next, true);
    }
  });

  return bindUseStore(api);
}
