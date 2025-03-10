const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export class ApiClient {
  static async sendMessage(message: string): Promise<ApiResponse<ChatMessage>> {
    return this.post<ChatMessage>('/chat', { message });
  }

  static async post<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      return { data, status: response.status };
    } catch (error) {
      return { error: (error as Error).message, status: 500 };
    }
  }
}