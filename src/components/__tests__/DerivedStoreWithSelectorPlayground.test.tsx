import type { ComponentType } from 'react';
import { createPlaygroundTests } from './playgroundTests';

createPlaygroundTests({
  describeName: 'derived-sws',
  heading: 'Derived Store (createDerivedStoreWithSelector)',
  importComponent: () => import('../DerivedStoreWithSelectorPlayground').then(m => m.DerivedStoreWithSelectorPlayground as ComponentType),
});
