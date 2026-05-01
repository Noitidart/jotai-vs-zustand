import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createStore } from 'zustand';
import { createDerivedStore } from '../createDerivedStore';

describe('createDerivedStore', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('initializes with derived value from source', () => {
    const source = createStore(() => ({ bears: 3, unrelatedCount: 0 }));
    const useTotalFood = createDerivedStore({
      sourceStore: source,
      derive: (s) => s.bears * 2
    });

    expect(useTotalFood.getState()).toBe(6);
  });

  it('updates when derived value changes', () => {
    const source = createStore(() => ({ bears: 3, unrelatedCount: 0 }));
    const useTotalFood = createDerivedStore({
      sourceStore: source,
      derive: (s) => s.bears * 2
    });

    source.setState({ bears: 4 });
    expect(useTotalFood.getState()).toBe(8);
  });

  it('runs derive on every source change including unrelated', () => {
    let deriveCount = 0;

    const source = createStore(() => ({ bears: 3, unrelatedCount: 0 }));
    createDerivedStore({
      sourceStore: source,
      derive: (s) => {
        deriveCount++;
        return s.bears * 2;
      }
    });

    expect(deriveCount).toBe(1);

    source.setState({ unrelatedCount: 1 });
    expect(deriveCount).toBe(2);

    source.setState({ bears: 4 });
    expect(deriveCount).toBe(3);
  });

  it('skips setState when output is unchanged (default Object.is)', () => {
    const source = createStore(() => ({ bears: 3, unrelatedCount: 0 }));
    const useTotalFood = createDerivedStore({
      sourceStore: source,
      derive: (s) => s.bears * 2
    });

    source.setState({ unrelatedCount: 1 });
    expect(useTotalFood.getState()).toBe(6);
  });

  it('supports custom equalityFn on output', () => {
    const source = createStore(() => ({ items: ['a', 'b'] as string[] }));
    const useItems = createDerivedStore(
      {
        sourceStore: source,
        derive: (s) => s.items
      },
      {
        equalityFn: (a, b) => a.length === b.length
      }
    );

    expect(useItems.getState()).toEqual(['a', 'b']);

    source.setState({ items: ['c', 'd'] });
    expect(useItems.getState()).toEqual(['a', 'b']);

    source.setState({ items: ['c', 'd', 'e'] });
    expect(useItems.getState()).toEqual(['c', 'd', 'e']);
  });

  it('returns read-only store (no setState)', () => {
    const source = createStore(() => ({ count: 1 }));
    const useDerived = createDerivedStore({
      sourceStore: source,
      derive: (s) => s.count * 2
    });

    expect(typeof useDerived.getState).toBe('function');
    expect(typeof useDerived.subscribe).toBe('function');
    expect(typeof useDerived.getInitialState).toBe('function');
    expect(
      typeof (useDerived as unknown as Record<string, unknown>).setState
    ).toBe('undefined');
  });

  it('works with object-derived state', () => {
    const source = createStore(() => ({ bears: 3, foodPerBear: 2 }));
    const useTotalFood = createDerivedStore({
      sourceStore: source,
      derive: (s) => ({ total: s.bears * s.foodPerBear })
    });

    expect(useTotalFood.getState()).toEqual({ total: 6 });

    source.setState({ bears: 5 });
    expect(useTotalFood.getState()).toEqual({ total: 10 });
  });
});
