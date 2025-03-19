import { authService } from './auth.service';
import { ApiResponse } from '../api/types';

export interface ModelInstance {
  id: string;
  instance_name: string;
  is_active: boolean;
  health_score: number;
  registered_at: string;
  last_health_check?: string;
  version?: string;
  container_version?: string;
  model_provider?: string;
  model_name?: string;
  model_parameters?: Record<string, any>;
}

export interface ModelsResponse {
  instances: ModelInstance[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class ModelService {
  private readonly baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://service.motherfluxer.ai';

  async getAvailableModels(): Promise<ApiResponse<ModelsResponse>> {
    if (!authService.isAuthenticated()) {
      throw new Error('Authentication required');
    }

    try {
      const url = `${this.baseUrl}/auth/models/available`;
      const response = await fetch(url, {
        headers: {
          ...authService.getAuthHeaders(),
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch models with status ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      
      if (data.status === 'success' && data.data.instances) {
        return { data: data.data, status: response.status };
      }
      
      throw new Error(data.message || 'Failed to fetch models');
    } catch (error) {
      return { 
        error: (error as Error).message, 
        status: 500 
      };
    }
  }
}

export const modelService = new ModelService(); 