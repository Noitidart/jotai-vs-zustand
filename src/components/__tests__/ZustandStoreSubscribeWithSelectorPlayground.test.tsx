import type { ComponentType } from 'react';
import { createPlaygroundTests } from './playgroundTests';

createPlaygroundTests({
  describeName: 'zstore-sws',
  heading: 'Zustand Store (subscribeWithSelector)',
  importComponent: () => import('../ZustandStoreSubscribeWithSelectorPlayground').then(m => m.ZustandStoreSubscribeWithSelectorPlayground as ComponentType),
});
