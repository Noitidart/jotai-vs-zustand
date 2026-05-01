import { type StoreApi } from 'zustand';

export type ReadonlyStoreApi<T> = {
  (): T;
  getState: StoreApi<T>['getState'];
  getInitialState: StoreApi<T>['getInitialState'];
  subscribe: StoreApi<T>['subscribe'];
};
