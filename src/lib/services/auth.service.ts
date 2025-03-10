// src/lib/services/auth.service.ts
export class AuthService {
  private token: string | null = null;
  private user: any | null = null;
  private baseUrl = 'https://user.motherfluxer.ai';

  async login(email: string, password: string) {
    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
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
      throw new Error('Authentication failed: ' + (error as Error).message);
    }
  }
  
    async register(email: string, password: string, role: 'user' | 'admin') {
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
        throw new Error('Registration failed: ' + (error as Error).message);
      }
    }
  
    private setAuthData(data: { token: string; user: any }) {
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
  
  export const authService = new AuthService();