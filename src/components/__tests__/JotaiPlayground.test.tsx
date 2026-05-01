import type { ComponentType } from 'react';
import { createPlaygroundTests } from './playgroundTests';

createPlaygroundTests({
  describeName: 'jotai',
  heading: 'Jotai',
  importComponent: () => import('../JotaiPlayground').then(m => m.JotaiPlayground as ComponentType),
});
