import { create } from 'zustand';
import { Message, Model } from './types';

interface AppState {
  messages: Message[];
  selectedModel: string | null;
  
  // Actions
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  setSelectedModel: (modelId: string) => void;
}

export const useStore = create<AppState>((set) => ({
  messages: [],
  selectedModel: null,

  addMessage: (message) => set((state) => ({
    messages: [...state.messages, {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      ...message,
    }],
  })),

  setSelectedModel: (modelId) => set({ selectedModel: modelId }),
})); 