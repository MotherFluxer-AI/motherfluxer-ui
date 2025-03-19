// src/lib/services/websocket.service.ts
import { authService } from './auth.service';
import { ModelInstance } from './model.service';

type WebSocketResponse = {
  type: 'response';
  content: string;
};

type WebSocketError = {
  type: 'error';
  message: string;
};

type WebSocketMessage = WebSocketResponse | WebSocketError;

export class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private messageHandler: ((message: WebSocketMessage) => void) | null = null;
  private readonly baseWsUrl = process.env.NEXT_PUBLIC_WS_URL || 'wss://service.motherfluxer.ai/ws';

  async connect(model: ModelInstance, onMessage: (message: WebSocketMessage) => void) {
    if (!authService.isAuthenticated()) {
      throw new Error('Authentication required');
    }

    this.messageHandler = onMessage;

    try {
      // Connect to the service backend's WebSocket proxy
      const wsUrl = `${this.baseWsUrl}/model?token=${authService.getToken()}&modelId=${model.id}`;
      
      return new Promise<void>((resolve, reject) => {
        try {
          this.ws = new WebSocket(wsUrl);
          
          this.ws.onopen = () => {
            this.reconnectAttempts = 0;
            resolve();
          };

          this.ws.onclose = () => {
            if (this.reconnectAttempts < this.maxReconnectAttempts) {
              setTimeout(() => {
                this.reconnectAttempts++;
                this.connect(model, onMessage);
              }, 1000 * Math.pow(2, this.reconnectAttempts));
            }
          };

          this.ws.onerror = (error) => {
            reject(error);
          };

          this.ws.onmessage = (event) => {
            try {
              const data = JSON.parse(event.data) as WebSocketMessage;
              if (this.messageHandler) {
                this.messageHandler(data);
              }
            } catch (error) {
              console.error('Error parsing WebSocket message:', error);
            }
          };
        } catch (error) {
          reject(error);
        }
      });
    } catch (error) {
      throw new Error(`Failed to connect to model: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  sendMessage(message: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }

    this.ws.send(JSON.stringify({
      type: 'chat',
      message
    }));
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.messageHandler = null;
    }
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

export const wsService = new WebSocketService();