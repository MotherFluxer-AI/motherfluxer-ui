export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export interface Model {
  id: string;
  name: string;
  description: string;
  isAvailable: boolean;
}