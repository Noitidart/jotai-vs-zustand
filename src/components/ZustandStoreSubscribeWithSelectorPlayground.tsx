import { useEffect } from 'react';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

type BearStore = {
  bears: number;
  foodPerBear: number;
  unrelatedCount: number;
};

const useBearStore = create(
  subscribeWithSelector<BearStore>(() => ({
    bears: 3,
    foodPerBear: 2,
    unrelatedCount: 0
  }))
);

const useTotalFoodStore = create(() => ({
  totalFood: 0
}));

let computeCount = 0;
let selectorCount = 0;
let equalityFnCount = 0;

const listener = (selected: { bears: number; foodPerBear: number }) => {
  computeCount++;
  const next = selected.bears * selected.foodPerBear;
  const current = useTotalFoodStore.getState().totalFood;
  console.log(`[zstore-sws] computation #${computeCount}`);
  if (next !== current) {
    useTotalFoodStore.setState({ totalFood: next });
  }
};

useBearStore.subscribe(
  (s) => {
    selectorCount++;
    console.log(`[zstore-sws] selector #${selectorCount}`);
    return { bears: s.bears, foodPerBear: s.foodPerBear };
  },
  listener,
  {
    equalityFn: (a, b) => {
      equalityFnCount++;
      console.log(`[zstore-sws] equalityFn #${equalityFnCount}`);
      return a.bears === b.bears && a.foodPerBear === b.foodPerBear;
    },
    fireImmediately: true
  }
);

function TotalFoodDisplay({ id }: { id: number }) {
  const { totalFood } = useTotalFoodStore();
  console.log(`[zstore-sws] render call site #${id}`);

  return <span>totalFood: {totalFood}</span>;
}

export function ZustandStoreSubscribeWithSelectorPlayground() {
  const { bears, foodPerBear, unrelatedCount } = useBearStore();

  useEffect(() => {
    console.log('[zstore-sws] mounted');
  }, []);

  return (
    <section
      style={{
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: 24,
        margin: 16
      }}
    >
      <h2>Zustand Store (subscribeWithSelector)</h2>

      <p>
        bears: {bears}{' '}
        <button
          onClick={() => {
            console.log('[zstore-sws] increment bears');
            useBearStore.setState((s) => ({ bears: s.bears + 1 }));
          }}
        >
          +1
        </button>
      </p>

      <p>
        foodPerBear: {foodPerBear}{' '}
        <button
          onClick={() => {
            console.log('[zstore-sws] increment foodPerBear');
            useBearStore.setState((s) => ({ foodPerBear: s.foodPerBear + 1 }));
          }}
        >
          +1
        </button>
      </p>

      <p>
        unrelatedCount: {unrelatedCount}{' '}
        <button
          onClick={() => {
            console.log('[zstore-sws] increment unrelatedCount');
            useBearStore.setState((s) => ({
              unrelatedCount: s.unrelatedCount + 1
            }));
          }}
        >
          +1
        </button>
      </p>

      <p>
        <strong>
          <TotalFoodDisplay id={1} />
        </strong>
      </p>
      <p>
        <strong>
          <TotalFoodDisplay id={2} />
        </strong>
      </p>
    </section>
  );
}
