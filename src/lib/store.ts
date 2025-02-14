import { create } from 'zustand';
import type { ModelInstance } from './api/types';

// Remove unused interfaces or mark them for future use with @ts-expect-error
interface StoreState {
  instances: ModelInstance[];
  selectedInstance: ModelInstance | null;
  setInstances: (newInstances: ModelInstance[]) => void;
  setSelectedInstance: (newInstance: ModelInstance | null) => void;
}

export const useStore = create<StoreState>((set) => ({
  instances: [],
  selectedInstance: null,
  setInstances: (newInstances) => set({ instances: newInstances }),
  setSelectedInstance: (newInstance) => set({ selectedInstance: newInstance }),
})); 