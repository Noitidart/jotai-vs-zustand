import { type StoreApi, type UseBoundStore } from 'zustand';

export type ReadonlyStoreApi<T> = Omit<UseBoundStore<StoreApi<T>>, 'setState'>;
