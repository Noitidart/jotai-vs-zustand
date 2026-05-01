import type { ComponentType } from 'react';
import { createPlaygroundTests, createEquivalenceTests } from './playgroundTests';

createPlaygroundTests({
  describeName: 'derived-plain',
  heading: 'Derived Store (createDerivedStore)',
  importComponent: () => import('../DerivedStorePlainPlayground').then(m => m.DerivedStorePlainPlayground as ComponentType),
});

createEquivalenceTests({
  referencePrefix: 'zstore-plain',
  derivedPrefix: 'derived-plain',
  reference: {
    describeName: 'zstore-plain',
    heading: 'Zustand Store (plain)',
    importComponent: () => import('../ZustandStorePlainPlayground').then(m => m.ZustandStorePlainPlayground as ComponentType),
  },
  derived: {
    describeName: 'derived-plain',
    heading: 'Derived Store (createDerivedStore)',
    importComponent: () => import('../DerivedStorePlainPlayground').then(m => m.DerivedStorePlainPlayground as ComponentType),
  },
});
