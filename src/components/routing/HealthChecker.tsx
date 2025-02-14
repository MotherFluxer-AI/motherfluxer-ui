/**
 * @ai-context: Performs periodic health checks on model instances
 * @ai-dependencies: ApiClient, ModelInstance interface
 * @ai-critical-points: Must clean up intervals and handle failed checks gracefully
 *
 * LEARNING POINTS:
 * 1. Implements interval-based health monitoring
 * 2. Uses callback pattern for health updates
 */

import { useEffect, useCallback } from 'react';
import { ModelInstance } from '@/lib/api/types';
import { ApiClient } from '@/lib/api/client';

interface HealthCheckerProps {
  instance: ModelInstance;
  onHealthUpdate: (healthScore: number) => void;
  checkInterval?: number; // in milliseconds
}

interface HealthResponse {
  health: number;
  timestamp?: string;
  metrics?: {
    latency: number;
    errorRate: number;
    successRate: number;
  };
}

export const HealthChecker: React.FC<HealthCheckerProps> = ({
  instance,
  onHealthUpdate,
  checkInterval = 30000 // Default to 30 seconds
}) => {
  /**
   * @ai-function: Performs health check for a specific instance
   * @ai-requires: Valid instance ID and API endpoint availability
   * @ai-affects: Instance health score through callback
   */
  const checkHealth = useCallback(async () => {
    try {
      const response = await ApiClient.get<HealthResponse>(
        `/health/${instance.id}`
      );
      
      if (response.data) {
        const healthScore = response.data.health;
        onHealthUpdate(healthScore);
        
        if (response.data.metrics) {
          console.debug('Health metrics:', response.data.metrics);
        }
      }
    } catch (error) {
      console.error('Health check failed:', error);
      onHealthUpdate(0);
    }
  }, [instance.id, onHealthUpdate]);

  /**
   * @ai-function: Sets up and manages periodic health check interval
   * @ai-requires: Valid checkHealth callback and interval duration
   * @ai-affects: Instance health monitoring lifecycle
   */
  useEffect(() => {
    // Perform initial health check
    checkHealth();
    
    // Set up periodic health checks
    const interval = setInterval(checkHealth, checkInterval);
    
    // Cleanup on unmount or when dependencies change
    return () => clearInterval(interval);
  }, [checkHealth, checkInterval]);

  // This is a logical component, no UI needed
  return null;
};