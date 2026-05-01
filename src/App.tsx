import { shallowEqual } from 'fast-equals';
import { atom, useAtom, useAtomValue } from 'jotai';
import { useMemo, useRef } from 'react';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

// ==================== JOTAI ====================

const bearAtom = atom({
  bears: 3,
  foodPerBear: 2,
  unrelatedCount: 0
});

let jotaiDeriveCount = 0;

const totalFoodAtom = atom((get) => {
  jotaiDeriveCount++;
  console.log(`[jotai] computation #${jotaiDeriveCount}`);
  const s = get(bearAtom);
  return s.bears * s.foodPerBear;
});

// ==================== ZUSTAND ====================

const useBearStore = create(
  subscribeWithSelector(() => ({
    bears: 3,
    foodPerBear: 2,
    unrelatedCount: 0
  }))
);

const useTotalFoodStore = create(() => ({
  totalFood: 0
}));

let zustandSubscribeCount = 0;

const computeAndSetTotalFood = (state: {
  bears: number;
  foodPerBear: number;
}) => {
  zustandSubscribeCount++;
  const next = state.bears * state.foodPerBear;
  console.log(
    `[zstore] computation #${zustandSubscribeCount} | next=${next}, current=${useTotalFoodStore.getState().totalFood}, will setState=${next !== useTotalFoodStore.getState().totalFood}`
  );
  if (next !== useTotalFoodStore.getState().totalFood) {
    useTotalFoodStore.setState({ totalFood: next });
  }
};

// computeTotalFood(useBearStore.getState());
// useBearStore.subscribe(computeTotalFood);

let zustandSelectorCount = 0;
let zustandEqualityFnCount = 0;
useBearStore.subscribe(
  function selectStateForTotalFood(s) {
    zustandSelectorCount++;
    console.log(`[zstore] selector called #${zustandSelectorCount}`);
    return { bears: s.bears, foodPerBear: s.foodPerBear };
  },
  computeAndSetTotalFood,
  {
    equalityFn: function isSelectedStateForTotalFoodEqual(a, b) {
      zustandEqualityFnCount++;
      console.log(`[zstore] equalityFn called #${zustandEqualityFnCount}`);
      return shallowEqual(a, b);
    },
    fireImmediately: true
  }
);

function JotaiTotalFoodDisplay({ id }: { id: number }) {
  const totalFood = useAtomValue(totalFoodAtom);
  console.log(`[jotai] rendered call site #${id}`);

  return <span>totalFood: {totalFood}</span>;
}

function ZustandTotalFoodDisplay({ id }: { id: number }) {
  const totalFood = useTotalFoodStore((s) => s.totalFood);
  console.log(`[zstore] rendered call site #${id}`);

  return <span>totalFood: {totalFood}</span>;
}

function JotaiPlayground() {
  const [bear, setBear] = useAtom(bearAtom);

  return (
    <section
      style={{
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: 24,
        margin: 16
      }}
    >
      <h2>Jotai</h2>

      <p>
        bears: {bear.bears}{' '}
        <button onClick={() => setBear((p) => ({ ...p, bears: p.bears + 1 }))}>
          +1
        </button>
        <button onClick={() => setBear((p) => ({ ...p, bears: p.bears - 1 }))}>
          -1
        </button>
      </p>

      <p>
        foodPerBear: {bear.foodPerBear}{' '}
        <button
          onClick={() =>
            setBear((p) => ({ ...p, foodPerBear: p.foodPerBear + 1 }))
          }
        >
          +1
        </button>
        <button
          onClick={() =>
            setBear((p) => ({ ...p, foodPerBear: p.foodPerBear - 1 }))
          }
        >
          -1
        </button>
      </p>

      <p>
        unrelatedCount: {bear.unrelatedCount}{' '}
        <button
          onClick={() =>
            setBear((p) => ({ ...p, unrelatedCount: p.unrelatedCount + 1 }))
          }
        >
          +1
        </button>
      </p>

      <p>
        <strong>
          <JotaiTotalFoodDisplay id={1} />
        </strong>
      </p>
      <p>
        <strong>
          <JotaiTotalFoodDisplay id={2} />
        </strong>
      </p>
    </section>
  );
}

function ZustandPlayground() {
  const { bears, foodPerBear, unrelatedCount } = useBearStore();

  return (
    <section
      style={{
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: 24,
        margin: 16
      }}
    >
      <h2>Zustand Dervied Store</h2>

      <p>
        bears: {bears}{' '}
        <button
          onClick={() => useBearStore.setState((s) => ({ bears: s.bears + 1 }))}
        >
          +1
        </button>
        <button
          onClick={() => useBearStore.setState((s) => ({ bears: s.bears - 1 }))}
        >
          -1
        </button>
      </p>

      <p>
        foodPerBear: {foodPerBear}{' '}
        <button
          onClick={() =>
            useBearStore.setState((s) => ({ foodPerBear: s.foodPerBear + 1 }))
          }
        >
          +1
        </button>
        <button
          onClick={() =>
            useBearStore.setState((s) => ({ foodPerBear: s.foodPerBear - 1 }))
          }
        >
          -1
        </button>
      </p>

      <p>
        unrelatedCount: {unrelatedCount}{' '}
        <button
          onClick={() =>
            useBearStore.setState((s) => ({
              unrelatedCount: s.unrelatedCount + 1
            }))
          }
        >
          +1
        </button>
      </p>

      <p>
        <strong>
          <ZustandTotalFoodDisplay id={1} />
        </strong>
      </p>
      <p>
        <strong>
          <ZustandTotalFoodDisplay id={2} />
        </strong>
      </p>
    </section>
  );
}

// ==================== ZUSTAND SELECTOR WAY ====================

function ZustandSelectorTotalFoodDisplay({ id }: { id: number }) {
  const zustandSelectorCountRef = useRef(0);

  const selectTotalFood = useMemo(
    () => (s: { bears: number; foodPerBear: number }) => {
      zustandSelectorCountRef.current++;
      console.log(
        `[zselector] computation #${zustandSelectorCountRef.current} at call site #${id}`
      );
      return s.bears * s.foodPerBear;
    },
    [id]
  );

  const totalFood = useBearStore(selectTotalFood);
  console.log(`[zselector] rendered call site #${id}`);

  return <span>totalFood: {totalFood}</span>;
}

function ZustandSelectorPlayground() {
  const { bears, foodPerBear, unrelatedCount } = useBearStore();

  return (
    <section
      style={{
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: 24,
        margin: 16
      }}
    >
      <h2>Zustand Selector</h2>

      <p>
        bears: {bears}{' '}
        <button
          onClick={() => useBearStore.setState((s) => ({ bears: s.bears + 1 }))}
        >
          +1
        </button>
        <button
          onClick={() => useBearStore.setState((s) => ({ bears: s.bears - 1 }))}
        >
          -1
        </button>
      </p>

      <p>
        foodPerBear: {foodPerBear}{' '}
        <button
          onClick={() =>
            useBearStore.setState((s) => ({ foodPerBear: s.foodPerBear + 1 }))
          }
        >
          +1
        </button>
        <button
          onClick={() =>
            useBearStore.setState((s) => ({ foodPerBear: s.foodPerBear - 1 }))
          }
        >
          -1
        </button>
      </p>

      <p>
        unrelatedCount: {unrelatedCount}{' '}
        <button
          onClick={() =>
            useBearStore.setState((s) => ({
              unrelatedCount: s.unrelatedCount + 1
            }))
          }
        >
          +1
        </button>
      </p>

      <p>
        <strong>
          <ZustandSelectorTotalFoodDisplay id={1} />
        </strong>
      </p>
      <p>
        <strong>
          <ZustandSelectorTotalFoodDisplay id={2} />
        </strong>
      </p>
    </section>
  );
}

function App() {
  return (
    <div style={{ padding: 32 }}>
      <h1>Bears: Jotai vs Zustand</h1>
      <p style={{ marginBottom: 16 }}>
        Try changing <code>unrelatedCount</code> — watch the console to see when
        derivations fire vs when components actually re-render.
      </p>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
        <JotaiPlayground />
        <ZustandPlayground />
        <ZustandSelectorPlayground />
      </div>
    </div>
  );
}

export default App;
