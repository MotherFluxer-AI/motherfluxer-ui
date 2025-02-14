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
import type { Message, Model } from './types';

// Remove unused interfaces or mark them for future use with @ts-expect-error
interface StoreState {
  /**
   * @ai-function: Instance Management Section
   * @ai-requires: Valid ModelInstance objects
   * @ai-affects: Global instance availability and selection state
   */
  instances: ModelInstance[];
  selectedInstance: ModelInstance | null;
  setInstances: (instances: ModelInstance[]) => void;
  setSelectedInstance: (instance: ModelInstance | null) => void;
  
  /**
   * @ai-function: Chat Management Section
   * @ai-requires: Valid Message objects and model IDs
   * @ai-affects: Chat history and model selection state
   */
  messages: Message[];
  selectedModel: string | null;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  setSelectedModel: (modelId: string | null) => void;
}

export const useStore = create<StoreState>((set) => ({
  // Instance Management
  instances: [],
  selectedInstance: null,
  /**
   * @ai-function: Updates the list of available instances
   * @ai-requires: Array of valid ModelInstance objects
   * @ai-affects: Global instance availability
   */
  setInstances: (instances) => set({ instances }),
  setSelectedInstance: (instance) => set({ selectedInstance: instance }),
  
  // Chat Management
  messages: [],
  selectedModel: null,
  /**
   * @ai-function: Adds a new message to chat history
   * @ai-requires: Message content and sender information
   * @ai-affects: Chat message history with auto-generated id and timestamp
   */
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      ...message
    }]
  })),
  setSelectedModel: (modelId) => set({ selectedModel: modelId })
})); 