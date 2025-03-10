# Motherfluxer UI Integration Guide

## Overview
This document outlines how to integrate the motherfluxer-ui component with the private infrastructure component of the MotherFluxer system.

## Authentication Flow
```mermaid
flowchart LR
    A[motherfluxer-ui] -->|1. Register/Login| B[/auth/register or /auth/login]
    B -->|2. Returns JWT| A
    A -->|3. Bearer Token| C[Protected Routes]
    C -->|4. Verified Requests| D[Model Instances]
```

## Connection Details

### 1. Authentication Endpoints

#### Register
```javascript
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password",
  "role": "user"  // or "admin" for admin access
}

Response:
{
  "status": "success",
  "data": {
    "token": "jwt_token_here"
  }
}
```

#### Login
```javascript
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password"
}

Response:
{
  "status": "success",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "role": "user",
      "created_at": "timestamp",
      "last_login": "timestamp",
      "is_active": true,
      "request_limit": 100
    }
  }
}
```

### 2. Making Authenticated Requests
All requests after authentication must include:
```javascript
headers: {
  'Authorization': 'Bearer jwt_token_here'
}
```

### 3. Rate Limiting
- Regular users: 100 requests per 15-minute window
- Admin users: 1000 requests per 15-minute window
- Rate limits are tracked per user in PostgreSQL
- Window duration: 15 minutes (900,000 milliseconds)

### 4. Security Configuration
- Token expiry: 24 hours
- Instance token expiry: 30 days
- Health check interval: 60 seconds
- Health score threshold: 80%

## Implementation Guide

### 1. Authentication Service
```javascript
// services/auth.service.js
class AuthService {
  constructor() {
    this.token = null;
    this.user = null;
  }

  async login(email, password) {
    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (data.status === 'success') {
        this.setAuthData(data.data);
        return data.data;
      }
      throw new Error(data.message);
    } catch (error) {
      throw new Error('Authentication failed: ' + error.message);
    }
  }

  async register(email, password, role) {
    try {
      const response = await fetch('/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, role })
      });

      const data = await response.json();
      if (data.status === 'success') {
        this.setAuthData(data.data);
        return data.data;
      }
      throw new Error(data.message);
    } catch (error) {
      throw new Error('Registration failed: ' + error.message);
    }
  }

  setAuthData(data) {
    this.token = data.token;
    this.user = data.user;
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('user_data', JSON.stringify(data.user));
  }

  getAuthHeaders() {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    };
  }

  isAuthenticated() {
    return !!this.token;
  }

  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  }
}
```

### 2. Model Service
```javascript
// services/model.service.js
class ModelService {
  constructor(authService) {
    this.authService = authService;
    this.baseUrl = '/api/model'; // Adjust based on your API structure
  }

  async sendMessage(message) {
    if (!this.authService.isAuthenticated()) {
      throw new Error('Authentication required');
    }

    try {
      const response = await fetch(`${this.baseUrl}/message`, {
        method: 'POST',
        headers: this.authService.getAuthHeaders(),
        body: JSON.stringify({ message })
      });

      const data = await response.json();
      if (data.status === 'success') {
        return data.data;
      }
      throw new Error(data.message);
    } catch (error) {
      throw new Error('Failed to send message: ' + error.message);
    }
  }

  async getResponse(messageId) {
    if (!this.authService.isAuthenticated()) {
      throw new Error('Authentication required');
    }

    try {
      const response = await fetch(`${this.baseUrl}/response/${messageId}`, {
        headers: this.authService.getAuthHeaders()
      });

      const data = await response.json();
      if (data.status === 'success') {
        return data.data;
      }
      throw new Error(data.message);
    } catch (error) {
      throw new Error('Failed to get response: ' + error.message);
    }
  }
}
```

### 3. WebSocket Connection Handler
```javascript
// services/websocket.service.js
class WebSocketService {
  constructor(authService) {
    this.authService = authService;
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect() {
    if (!this.authService.isAuthenticated()) {
      throw new Error('Authentication required');
    }

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket('ws://your-websocket-url');
        
        this.ws.onopen = () => {
          this.reconnectAttempts = 0;
          this.authenticate();
          resolve();
        };

        this.ws.onclose = () => {
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            setTimeout(() => {
              this.reconnectAttempts++;
              this.connect();
            }, 1000 * Math.pow(2, this.reconnectAttempts));
          }
        };

        this.ws.onerror = (error) => {
          reject(error);
        };

        this.ws.onmessage = this.handleMessage.bind(this);
      } catch (error) {
        reject(error);
      }
    });
  }

  authenticate() {
    this.ws.send(JSON.stringify({
      type: 'auth',
      token: this.authService.token
    }));
  }

  handleMessage(event) {
    const data = JSON.parse(event.data);
    // Handle different message types
    switch (data.type) {
      case 'response':
        this.handleModelResponse(data);
        break;
      case 'error':
        this.handleError(data);
        break;
      // Add other message type handlers as needed
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
```

## Usage Example
```javascript
// Example usage in your application
const authService = new AuthService();
const modelService = new ModelService(authService);
const wsService = new WebSocketService(authService);

// Login flow
async function login() {
  try {
    await authService.login('user@example.com', 'password');
    await wsService.connect();
    // Ready to use model service
  } catch (error) {
    console.error('Login failed:', error);
  }
}

// Sending messages
async function sendMessage(message) {
  try {
    const response = await modelService.sendMessage(message);
    console.log('Message sent:', response);
  } catch (error) {
    console.error('Failed to send message:', error);
  }
}
```

## Security Best Practices

1. **Token Storage**
   - Store tokens in memory during session
   - Use secure storage (e.g., HttpOnly cookies) for persistence
   - Clear tokens on logout

2. **Error Handling**
   - Implement proper error boundaries
   - Never expose sensitive information in error messages
   - Log errors securely

3. **Rate Limit Handling**
   - Track remaining requests
   - Implement backoff strategy when approaching limits
   - Show appropriate user feedback

4. **Connection Security**
   - Use HTTPS for all API calls
   - Implement WebSocket secure protocol (wss://)
   - Validate all server responses

## Testing
Implement comprehensive tests for:
- Authentication flows
- Token management
- WebSocket connections
- Rate limit handling
- Error scenarios

## Deployment Considerations
- Configure CORS appropriately
- Set up proper SSL certificates
- Monitor WebSocket connections
- Implement proper logging
- Set up error tracking
- Monitor rate limits

## Support
For additional support or questions, refer to:
- System documentation
- API documentation
- Security guidelines
- Rate limiting documentation