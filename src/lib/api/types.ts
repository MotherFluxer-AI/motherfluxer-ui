export interface ModelInstance {
  id: string;
  instanceName: string;
  hostAddress: string;
  healthScore: number;
  isActive: boolean;
  version: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
} 