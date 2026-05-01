import { useEffect } from 'react';
import { create } from 'zustand';
import { createDerivedStoreWithSelector } from '../utils/zustand/createDerivedStoreWithSelector';

type BearStore = {
  bears: number;
  foodPerBear: number;
  unrelatedCount: number;
};

const useBearStore = create<BearStore>(() => ({
  bears: 3,
  foodPerBear: 2,
  unrelatedCount: 0
}));

const useTotalFoodStore = createDerivedStoreWithSelector(
  {
    sourceStore: useBearStore,
    selector: (s) => ({ bears: s.bears, foodPerBear: s.foodPerBear }),
    derive: (slice) => ({ totalFood: slice.bears * slice.foodPerBear })
  },
  {
    equalityFn: (a, b) => a.bears === b.bears && a.foodPerBear === b.foodPerBear
  }
);

function TotalFoodDisplay({ id }: { id: number }) {
  const { totalFood } = useTotalFoodStore();
  console.log(`[derived-sws] render call site #${id}`);

  return <span>totalFood: {totalFood}</span>;
}

export function DerivedStoreWithSelectorPlayground() {
  const { bears, foodPerBear, unrelatedCount } = useBearStore();

  useEffect(() => {
    console.log('[derived-sws] mounted');
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
      <h2>Derived Store (createDerivedStoreWithSelector)</h2>

      <p>
        bears: {bears}{' '}
        <button
          onClick={() => {
            console.log('[derived-sws] increment bears');
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
            console.log('[derived-sws] increment foodPerBear');
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
            console.log('[derived-sws] increment unrelatedCount');
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
