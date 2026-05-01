import { useEffect, useRef } from 'react';
import { create } from 'zustand';

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

function TotalFoodDisplay({ id }: { id: number }) {
  const computeCountRef = useRef(0);

  const selectAndComputeTotalFood = (s: BearStore) => {
    computeCountRef.current++;
    console.log(
      `[zselector] computation #${computeCountRef.current} at call site #${id}`
    );
    return s.bears * s.foodPerBear;
  };

  const totalFood = useBearStore(selectAndComputeTotalFood);
  console.log(`[zselector] render call site #${id}`);

  return <span>totalFood: {totalFood}</span>;
}

export function ZustandSelectorPlayground() {
  const { bears, foodPerBear, unrelatedCount } = useBearStore();

  useEffect(() => {
    console.log('[zselector] mounted');
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
      <h2>Zustand Selector</h2>

      <p>
        bears: {bears}{' '}
        <button
          onClick={() => {
            console.log('[zselector] increment bears');
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
            console.log('[zselector] increment foodPerBear');
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
            console.log('[zselector] increment unrelatedCount');
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
