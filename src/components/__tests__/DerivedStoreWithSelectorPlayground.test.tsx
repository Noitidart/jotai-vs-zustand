import type { ComponentType } from 'react';
import { createPlaygroundTests, createEquivalenceTests } from './playgroundTests';

createPlaygroundTests({
  describeName: 'derived-sws',
  heading: 'Derived Store (createDerivedStoreWithSelector)',
  importComponent: () => import('../DerivedStoreWithSelectorPlayground').then(m => m.DerivedStoreWithSelectorPlayground as ComponentType),
});

createEquivalenceTests({
  referencePrefix: 'zstore-sws',
  derivedPrefix: 'derived-sws',
  reference: {
    describeName: 'zstore-sws',
    heading: 'Zustand Store (subscribeWithSelector)',
    importComponent: () => import('../ZustandStoreSubscribeWithSelectorPlayground').then(m => m.ZustandStoreSubscribeWithSelectorPlayground as ComponentType),
  },
  derived: {
    describeName: 'derived-sws',
    heading: 'Derived Store (createDerivedStoreWithSelector)',
    importComponent: () => import('../DerivedStoreWithSelectorPlayground').then(m => m.DerivedStoreWithSelectorPlayground as ComponentType),
  },
});
