import { atom, useAtom, useAtomValue } from 'jotai';
import { useEffect } from 'react';

const bearAtom = atom({
  bears: 3,
  foodPerBear: 2,
  unrelatedCount: 0,
});

let computeCount = 0;

const totalFoodAtom = atom((get) => {
  computeCount++;
  console.log(`[jotai] computation #${computeCount}`);
  const s = get(bearAtom);
  return s.bears * s.foodPerBear;
});

function TotalFoodDisplay({ id }: { id: number }) {
  const totalFood = useAtomValue(totalFoodAtom);
  console.log(`[jotai] render call site #${id}`);

  return <span>totalFood: {totalFood}</span>;
}

export function JotaiPlayground() {
  const [bear, setBear] = useAtom(bearAtom);

  useEffect(() => {
    console.log('[jotai] mounted');
  }, []);

  return (
    <section style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 24, margin: 16 }}>
      <h2>Jotai</h2>

      <p>
        bears: {bear.bears}{' '}
        <button onClick={() => { console.log('[jotai] increment bears'); setBear((p) => ({ ...p, bears: p.bears + 1 })); }}>+1</button>
      </p>

      <p>
        foodPerBear: {bear.foodPerBear}{' '}
        <button onClick={() => { console.log('[jotai] increment foodPerBear'); setBear((p) => ({ ...p, foodPerBear: p.foodPerBear + 1 })); }}>+1</button>
      </p>

      <p>
        unrelatedCount: {bear.unrelatedCount}{' '}
        <button onClick={() => { console.log('[jotai] increment unrelatedCount'); setBear((p) => ({ ...p, unrelatedCount: p.unrelatedCount + 1 })); }}>+1</button>
      </p>

      <p><strong><TotalFoodDisplay id={1} /></strong></p>
      <p><strong><TotalFoodDisplay id={2} /></strong></p>
    </section>
  );
}
