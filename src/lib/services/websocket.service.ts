// src/lib/services/websocket.service.ts
import { authService } from './auth.service';

export class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private readonly wsUrl = 'wss://admin.motherfluxer.ai/ws';

  constructor() {
    this.handleMessage = this.handleMessage.bind(this);
  }

  connect(onMessage: (message: any) => void) {
    if (!authService.isAuthenticated()) {
      throw new Error('Authentication required');
    }

    return new Promise<void>((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.wsUrl);
        
        this.ws.onopen = () => {
          this.reconnectAttempts = 0;
          this.authenticate();
          resolve();
        };

        this.ws.onclose = () => {
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            setTimeout(() => {
              this.reconnectAttempts++;
              this.connect(onMessage);
            }, 1000 * Math.pow(2, this.reconnectAttempts));
          }
        };

        this.ws.onerror = (error) => {
          reject(error);
        };

        this.ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          onMessage(data);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private authenticate() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'auth',
        token: authService.getToken()
      }));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const wsService = new WebSocketService();