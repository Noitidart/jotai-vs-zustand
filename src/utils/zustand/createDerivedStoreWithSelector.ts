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

export function createDerivedStoreWithSelector<State, Slice, Derived>(
  config: DerivedStoreWithSelectorConfig<State, Slice, Derived>,
  options?: DerivedStoreWithSelectorOptions<Slice>
): UseBoundStore<ReadonlyStoreApi<Derived>> {
  const { sourceStore, selector, derive } = config;
  const equalityFn = options?.equalityFn ?? Object.is;

  let currentSlice = selector(sourceStore.getState());
  const initialValue = derive(currentSlice);

  const api = createStore<Derived>(() => initialValue);

  sourceStore.subscribe((state) => {
    const nextSlice = selector(state);

    if (!equalityFn(nextSlice, currentSlice)) {
      currentSlice = nextSlice;
      api.setState(derive(nextSlice), true);
    }
  });

  return bindUseStore(api);
}
