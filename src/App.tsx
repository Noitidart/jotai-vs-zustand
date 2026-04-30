import { atom, useAtom, useAtomValue } from 'jotai'
import { create } from 'zustand'

// ==================== JOTAI ====================

const bearAtom = atom({
  bears: 3,
  foodPerBear: 2,
  unrelatedCount: 0,
})

let jotaiDeriveCount = 0

const totalFoodAtom = atom((get) => {
  jotaiDeriveCount++
  console.log(`[jotai] computation #${jotaiDeriveCount}`)
  const s = get(bearAtom)
  return s.bears * s.foodPerBear
})

// ==================== ZUSTAND ====================

const useBearStore = create(() => ({
  bears: 3,
  foodPerBear: 2,
  unrelatedCount: 0,
}))

const useTotalFoodStore = create(() => ({
  totalFood: 0,
}))

let zustandSubscribeCount = 0

const computeTotalFood = (state: { bears: number; foodPerBear: number }) => {
  zustandSubscribeCount++
  const next = state.bears * state.foodPerBear
  console.log(
    `[zustand] computation #${zustandSubscribeCount} | next=${next}, current=${useTotalFoodStore.getState().totalFood}, will setState=${next !== useTotalFoodStore.getState().totalFood}`,
  )
  if (next !== useTotalFoodStore.getState().totalFood) {
    useTotalFoodStore.setState({ totalFood: next })
  }
}

computeTotalFood(useBearStore.getState())

useBearStore.subscribe(computeTotalFood)

function JotaiTotalFoodDisplay({ id }: { id: number }) {
  const totalFood = useAtomValue(totalFoodAtom)
  console.log(`[jotai] render call site #${id}`)

  return <span>jotai totalFood: {totalFood}</span>
}

function ZustandTotalFoodDisplay({ id }: { id: number }) {
  const totalFood = useTotalFoodStore((s) => s.totalFood)
  console.log(`[zustand] render call site #${id}`)

  return <span>zustand totalFood: {totalFood}</span>
}

function JotaiPlayground() {
  const [bear, setBear] = useAtom(bearAtom)

  return (
    <section style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 24, margin: 16 }}>
      <h2>Jotai</h2>

      <p>
        bears: {bear.bears}{' '}
        <button onClick={() => setBear((p) => ({ ...p, bears: p.bears + 1 }))}>+1</button>
        <button onClick={() => setBear((p) => ({ ...p, bears: p.bears - 1 }))}>-1</button>
      </p>

      <p>
        foodPerBear: {bear.foodPerBear}{' '}
        <button onClick={() => setBear((p) => ({ ...p, foodPerBear: p.foodPerBear + 1 }))}>
          +1
        </button>
        <button onClick={() => setBear((p) => ({ ...p, foodPerBear: p.foodPerBear - 1 }))}>
          -1
        </button>
      </p>

      <p>
        unrelatedCount: {bear.unrelatedCount}{' '}
        <button onClick={() => setBear((p) => ({ ...p, unrelatedCount: p.unrelatedCount + 1 }))}>
          +1
        </button>
      </p>

      <p>
        <strong><JotaiTotalFoodDisplay id={1} /></strong>
      </p>
      <p>
        <strong><JotaiTotalFoodDisplay id={2} /></strong>
      </p>

    </section>
  )
}

function ZustandPlayground() {
  const { bears, foodPerBear, unrelatedCount } = useBearStore()

  return (
    <section style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 24, margin: 16 }}>
      <h2>Zustand</h2>

      <p>
        bears: {bears}{' '}
        <button onClick={() => useBearStore.setState((s) => ({ bears: s.bears + 1 }))}>+1</button>
        <button onClick={() => useBearStore.setState((s) => ({ bears: s.bears - 1 }))}>-1</button>
      </p>

      <p>
        foodPerBear: {foodPerBear}{' '}
        <button onClick={() => useBearStore.setState((s) => ({ foodPerBear: s.foodPerBear + 1 }))}>
          +1
        </button>
        <button onClick={() => useBearStore.setState((s) => ({ foodPerBear: s.foodPerBear - 1 }))}>
          -1
        </button>
      </p>

      <p>
        unrelatedCount: {unrelatedCount}{' '}
        <button
          onClick={() => useBearStore.setState((s) => ({ unrelatedCount: s.unrelatedCount + 1 }))}
        >
          +1
        </button>
      </p>

      <p>
        <strong><ZustandTotalFoodDisplay id={1} /></strong>
      </p>
      <p>
        <strong><ZustandTotalFoodDisplay id={2} /></strong>
      </p>

    </section>
  )
}

function App() {
  return (
    <div style={{ padding: 32 }}>
      <h1>Bears: Jotai vs Zustand</h1>
      <p style={{ marginBottom: 16 }}>
        Try changing <code>unrelatedCount</code> — watch the console to see
        when derivations fire vs when components actually re-render.
      </p>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
        <JotaiPlayground />
        <ZustandPlayground />
      </div>
    </div>
  )
}

export default App
