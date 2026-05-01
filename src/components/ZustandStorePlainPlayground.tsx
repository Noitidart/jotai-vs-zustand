import { useEffect } from 'react';
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

const useTotalFoodStore = create(() => ({
  totalFood: 0
}));

let computeCount = 0;

const computeAndMaybeSetTotalFood = (state: {
  bears: number;
  foodPerBear: number;
}) => {
  computeCount++;
  const next = state.bears * state.foodPerBear;
  const current = useTotalFoodStore.getState().totalFood;
  console.log(`[zstore-plain] computation #${computeCount}`);
  if (next !== current) {
    useTotalFoodStore.setState({ totalFood: next });
  }
};

computeAndMaybeSetTotalFood(useBearStore.getState());
useBearStore.subscribe(computeAndMaybeSetTotalFood);

function TotalFoodDisplay({ id }: { id: number }) {
  const { totalFood } = useTotalFoodStore();
  console.log(`[zstore-plain] render call site #${id}`);

  return <span>totalFood: {totalFood}</span>;
}

export function ZustandStorePlainPlayground() {
  const { bears, foodPerBear, unrelatedCount } = useBearStore();

  useEffect(() => {
    console.log('[zstore-plain] mounted');
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
      <h2>Zustand Store (plain)</h2>

      <p>
        bears: {bears}{' '}
        <button
          onClick={() => {
            console.log('[zstore-plain] increment bears');
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
            console.log('[zstore-plain] increment foodPerBear');
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
            console.log('[zstore-plain] increment unrelatedCount');
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
