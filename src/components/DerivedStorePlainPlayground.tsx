import { useEffect } from 'react';
import { create } from 'zustand';
import { createDerivedStore } from '../utils/zustand/createDerivedStore';

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

const useTotalFoodStore = createDerivedStore(
  {
    sourceStore: useBearStore,
    derive: (s) => ({ totalFood: s.bears * s.foodPerBear })
  },
  {
    equalityFn: (a, b) => a.totalFood === b.totalFood
  }
);

function TotalFoodDisplay({ id }: { id: number }) {
  const { totalFood } = useTotalFoodStore();
  console.log(`[derived-plain] render call site #${id}`);

  return <span>totalFood: {totalFood}</span>;
}

export function DerivedStorePlainPlayground() {
  const { bears, foodPerBear, unrelatedCount } = useBearStore();

  useEffect(() => {
    console.log('[derived-plain] mounted');
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
      <h2>Derived Store (createDerivedStore)</h2>

      <p>
        bears: {bears}{' '}
        <button
          onClick={() => {
            console.log('[derived-plain] increment bears');
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
            console.log('[derived-plain] increment foodPerBear');
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
            console.log('[derived-plain] increment unrelatedCount');
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
