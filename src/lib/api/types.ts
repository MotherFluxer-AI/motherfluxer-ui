export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}