/**
 * @ai-context: Global state management for instances and chat functionality
 * @ai-dependencies: Zustand, ModelInstance, Message types
 * @ai-critical-points: Must maintain consistency between instance and chat states
 *
 * LEARNING POINTS:
 * 1. Combines multiple domain states in single store
 * 2. Uses immutable state updates
 */

import { create } from 'zustand';
import type { ModelInstance } from './api/types';
import type { Message } from './types';

// Separate interfaces for better organization
interface InstanceState {
  instances: ModelInstance[];
  selectedInstance: ModelInstance | null;
  instanceHealth: Record<string, number>;  // Track health by instance ID
}

interface ChatState {
  messages: Message[];
  selectedModel: string | null;
}

interface StoreState extends InstanceState, ChatState {
  // Instance Management
  setInstances: (instances: ModelInstance[]) => void;
  setSelectedInstance: (instance: ModelInstance | null) => void;
  updateInstanceHealth: (instanceId: string, health: number) => void;
  getInstancesForModel: (modelId: string) => ModelInstance[];
  
  // Chat Management
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  setSelectedModel: (modelId: string | null) => void;
  selectModelAndInstance: (modelId: string) => void;
}

export const useStore = create<StoreState>((set, get) => ({
  // Instance State
  instances: [],
  selectedInstance: null,
  instanceHealth: {},

  // Chat State
  messages: [],
  selectedModel: null,

  // Instance Management Actions
  setInstances: (instances) => set({ instances }),
  setSelectedInstance: (instance) => set({ selectedInstance: instance }),
  updateInstanceHealth: (instanceId, health) => 
    set((state) => ({
      instanceHealth: {
        ...state.instanceHealth,
        [instanceId]: health
      }
    })),
  getInstancesForModel: (modelId) => 
    get().instances.filter(instance => instance.modelId === modelId),

  // Chat Management Actions
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      ...message
    }]
  })),
  setSelectedModel: (modelId) => set({ selectedModel: modelId }),
  selectModelAndInstance: (modelId) => set((state) => {
    const modelInstances = state.getInstancesForModel(modelId);
    const bestInstance = modelInstances.find(instance => 
      instance.isActive && 
      (state.instanceHealth[instance.id] || instance.healthScore) > 50
    );
    
    return {
      selectedModel: modelId,
      selectedInstance: bestInstance || null
    };
  })
})); 