// src/lib/services/auth.service.ts

interface User {
  id: string;
  email: string;
  role: 'user' | 'admin';
}

interface AuthResponse {
  token: string;
  user: User;
}

export class AuthService {
  private token: string | null = null;
  private user: User | null = null;
  private readonly baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://service.motherfluxer.ai';

  constructor() {
    // Initialize from localStorage if available
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('auth_token');
      const storedUser = localStorage.getItem('user_data');
      
      if (storedToken) {
        this.token = storedToken;
      }
      
      if (storedUser) {
        try {
          this.user = JSON.parse(storedUser) as User;
        } catch (e) {
          console.error('Failed to parse stored user data', e);
        }
      }
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const loginUrl = `${this.baseUrl}/auth/login`;
      
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Login failed with status ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      if (data.status === 'success') {
        this.setAuthData(data.data.token, data.data.user);
        return data.data;
      }
      throw new Error(data.message || 'Login failed');
    } catch (error) {
      throw new Error('Login failed: ' + (error instanceof Error ? error.message : String(error)));
    }
  }
  
  async register(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email, password, role: 'user' })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Registration failed with status ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      if (data.status === 'success') {
        this.setAuthData(data.data.token, data.data.user);
        return data.data;
      }
      throw new Error(data.message || 'Registration failed');
    } catch (error) {
      throw new Error('Registration failed: ' + (error instanceof Error ? error.message : String(error)));
    }
  }

  private setAuthData(token: string, user?: User) {
    this.token = token;
    this.user = user || null;
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
      if (user) {
        localStorage.setItem('user_data', JSON.stringify(user));
      }

      // Set cookie for middleware
      document.cookie = `auth_token=${token}; path=/; max-age=86400; SameSite=Strict`;
    }
  }

  getAuthHeaders() {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  getToken(): string | null {
    return this.token;
  }

  getUser(): User | null {
    return this.user;
  }

  logout(): void {
    this.token = null;
    this.user = null;
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      
      // Remove cookie
      document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
  }
}

export const authService = new AuthService();