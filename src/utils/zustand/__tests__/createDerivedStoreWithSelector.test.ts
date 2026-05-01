import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createStore } from 'zustand'
import { createDerivedStoreWithSelector } from '../createDerivedStoreWithSelector'

describe('createDerivedStoreWithSelector', () => {
  beforeEach(() => { vi.resetModules() })

  it('initializes with derived value from source', () => {
    const source = createStore(() => ({ bears: 3, unrelatedCount: 0 }))
    const useTotalFood = createDerivedStoreWithSelector({
      sourceStore: source,
      selector: (s) => s.bears,
      derive: (bears) => bears * 2,
    })

    expect(useTotalFood.getState()).toBe(6)
  })

  it('updates when selected slice changes', () => {
    const source = createStore(() => ({ bears: 3, unrelatedCount: 0 }))
    const useTotalFood = createDerivedStoreWithSelector({
      sourceStore: source,
      selector: (s) => s.bears,
      derive: (bears) => bears * 2,
    })

    source.setState({ bears: 4 })
    expect(useTotalFood.getState()).toBe(8)
  })

  it('skips derive when selected slice is unchanged (default Object.is)', () => {
    let deriveCount = 0

    const source = createStore(() => ({ bears: 3, unrelatedCount: 0 }))
    createDerivedStoreWithSelector({
      sourceStore: source,
      selector: (s) => s.bears,
      derive: (bears) => {
        deriveCount++
        return bears * 2
      },
    })

    expect(deriveCount).toBe(1)

    source.setState({ unrelatedCount: 1 })
    expect(deriveCount).toBe(1)

    source.setState({ bears: 4 })
    expect(deriveCount).toBe(2)
  })

  it('supports custom selectorEqualityFn on slice', () => {
    let deriveCount = 0

    const source = createStore(() => ({
      bears: 3,
      foodPerBear: 2,
      unrelatedCount: 0,
    }))

    createDerivedStoreWithSelector(
      {
        sourceStore: source,
        selector: (s) => ({ bears: s.bears, foodPerBear: s.foodPerBear }),
        derive: (slice) => {
          deriveCount++
          return slice.bears * slice.foodPerBear
        },
      },
      {
        selectorEqualityFn: (a, b) => a.bears === b.bears && a.foodPerBear === b.foodPerBear,
      },
    )

    expect(deriveCount).toBe(1)

    source.setState({ unrelatedCount: 1 })
    expect(deriveCount).toBe(1)

    source.setState({ bears: 4 })
    expect(deriveCount).toBe(2)
  })

  it('returns read-only store (no setState)', () => {
    const source = createStore(() => ({ count: 1 }))
    const useDerived = createDerivedStoreWithSelector({
      sourceStore: source,
      selector: (s) => s.count,
      derive: (count) => count * 2,
    })

    expect(typeof useDerived.getState).toBe('function')
    expect(typeof useDerived.subscribe).toBe('function')
    expect(typeof useDerived.getInitialState).toBe('function')
    expect(typeof (useDerived as unknown as Record<string, unknown>).setState).toBe('undefined')
  })

  it('works with object-derived state', () => {
    const source = createStore(() => ({ bears: 3, foodPerBear: 2 }))
    const useTotalFood = createDerivedStoreWithSelector({
      sourceStore: source,
      selector: (s) => s.bears,
      derive: (bears) => ({ total: bears * 2 }),
    })

    expect(useTotalFood.getState()).toEqual({ total: 6 })

    source.setState({ bears: 5 })
    expect(useTotalFood.getState()).toEqual({ total: 10 })
  })
})
