import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { ChatMessage } from './api/types';

interface StoreState {
  messages: ChatMessage[];
  addMessage: (userMessage: string, aiResponse: string) => void;
}

export const useStore = create<StoreState>((set) => ({
  messages: [],
  addMessage: (userMessage: string, aiResponse: string) => 
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: uuidv4(),
          content: userMessage,
          sender: 'user',
          timestamp: new Date()
        },
        {
          id: uuidv4(),
          content: aiResponse,
          sender: 'assistant',
          timestamp: new Date()
        }
      ]
    }))
}));