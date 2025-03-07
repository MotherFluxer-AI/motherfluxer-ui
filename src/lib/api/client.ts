/**
 * @ai-context: Manages API communication with standardized response handling
 * @ai-dependencies: ApiResponse type, environment configuration
 * @ai-critical-points: Must handle network errors and maintain consistent response format
 *
 * LEARNING POINTS:
 * 1. Implements unified error handling across all requests
 * 2. Uses environment-based API configuration
 */

import { ApiResponse, ModelInstance } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export class ApiClient {
  /**
   * @ai-function: Performs GET request with standardized error handling
   * @ai-requires: Valid endpoint path and response type
   * @ai-affects: Network state and response processing
   */
  static async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      const data = await response.json();
      return { data, status: response.status };
    } catch (error) {
      return { error: (error as Error).message, status: 500 };
    }
  }

  /**
   * @ai-function: Performs POST request with JSON payload
   * @ai-requires: Valid endpoint path, request body, and response type
   * @ai-affects: Network state, server resources, and response processing
   */
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

  static async getInstances(modelId: string): Promise<ApiResponse<ModelInstance[]>> {
    return this.get<ModelInstance[]>(`/instances/${modelId}`);
  }

  static async getInstanceHealth(instanceId: string): Promise<ApiResponse<number>> {
    return this.get<number>(`/health/${instanceId}`);
  }
} 