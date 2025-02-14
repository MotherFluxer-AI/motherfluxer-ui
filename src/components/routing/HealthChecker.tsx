import { useEffect, useCallback } from 'react';
import { ModelInstance } from '@/lib/api/types';
import { ApiClient } from '@/lib/api/client';

interface HealthCheckerProps {
  instance: ModelInstance;
  onHealthUpdate: (health: number) => void;
  checkInterval?: number; // in milliseconds
}

export const HealthChecker: React.FC<HealthCheckerProps> = ({
  instance,
  onHealthUpdate,
  checkInterval = 30000 // Default to 30 seconds
}) => {
  const checkHealth = useCallback(async () => {
    try {
      const response = await ApiClient.get<{ health: number }>(
        `/health/${instance.id}`
      );
      
      if (response.data) {
        onHealthUpdate(response.data.health);
      }
    } catch (error) {
      console.error('Health check failed:', error);
      onHealthUpdate(0); // Indicate failure
    }
  }, [instance.id, onHealthUpdate]);

  useEffect(() => {
    checkHealth(); // Initial check
    const interval = setInterval(checkHealth, checkInterval);
    
    return () => clearInterval(interval);
  }, [checkHealth, checkInterval]);

  return null; // This is a logical component, no UI needed
};