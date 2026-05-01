import type { ComponentType } from 'react';
import { createPlaygroundTests } from './playgroundTests';

createPlaygroundTests({
  describeName: 'zstore-plain',
  heading: 'Zustand Store (plain)',
  importComponent: () => import('../ZustandStorePlainPlayground').then(m => m.ZustandStorePlainPlayground as ComponentType),
});
