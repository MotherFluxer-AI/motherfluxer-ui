// src/lib/api/client.ts
import { authService } from '../services/auth.service';
import { ChatMessage, ApiResponse } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://admin.motherfluxer.ai/api';

export class ApiClient {
  static async sendMessage(message: string): Promise<ApiResponse<ChatMessage>> {
    if (!authService.isAuthenticated()) {
      throw new Error('Authentication required');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/model/message`, {
        method: 'POST',
        headers: {
          ...authService.getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message }),
      });

      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      const data = await response.json();
      if (data.status === 'success') {
        return { data: data.data, status: response.status };
      }
      
      throw new Error(data.message || 'Failed to send message');
    } catch (error) {
      return { 
        error: (error as Error).message, 
        status: error instanceof Error && error.message.includes('Rate limit') ? 429 : 500 
      };
    }
  }
}