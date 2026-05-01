import type { ComponentType } from 'react';
import { createPlaygroundTests } from './playgroundTests';

createPlaygroundTests({
  describeName: 'zselector',
  heading: 'Zustand Selector',
  importComponent: () => import('../ZustandSelectorPlayground').then(m => m.ZustandSelectorPlayground as ComponentType),
});
