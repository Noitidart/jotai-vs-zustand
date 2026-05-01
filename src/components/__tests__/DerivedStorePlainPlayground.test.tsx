import type { ComponentType } from 'react';
import { createPlaygroundTests } from './playgroundTests';

createPlaygroundTests({
  describeName: 'derived-plain',
  heading: 'Derived Store (createDerivedStore)',
  importComponent: () => import('../DerivedStorePlainPlayground').then(m => m.DerivedStorePlainPlayground as ComponentType),
});
