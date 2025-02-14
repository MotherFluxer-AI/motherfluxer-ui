/**
 * @ai-context: Manages model instance routing, health checks, and failover
 * @ai-dependencies: LoadBalancer, HealthChecker, FailoverHandler
 * @ai-critical-points: Must coordinate instance selection and health monitoring
 */

import { useState, useCallback, useEffect } from 'react';
import { ModelInstance } from '@/lib/api/types';
import { LoadBalancer } from './LoadBalancer';
import { HealthChecker } from './HealthChecker';
import { FailoverHandler } from './FailoverHandler';
import { useStore } from '@/lib/store';

export const RoutingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [instances, setInstances] = useState<ModelInstance[]>([]);
  const [currentInstance, setCurrentInstance] = useState<ModelInstance | null>(null);
  const { setSelectedInstance } = useStore();

  useEffect(() => {
    // Fetch instances from API
    const fetchInstances = async () => {
      try {
        const response = await fetch('/api/instances');
        const data = await response.json();
        setInstances(data);
      } catch (error) {
        console.error('Failed to fetch instances:', error);
      }
    };
    fetchInstances();
  }, []);

  const handleInstanceSelect = useCallback((instance: ModelInstance) => {
    setCurrentInstance(instance);
    setSelectedInstance(instance);
  }, [setSelectedInstance]);

  const handleHealthUpdate = useCallback((healthScore: number) => {
    if (currentInstance) {
      // Update instance health
    }
  }, [currentInstance]);

  const handleFailover = useCallback((instance: ModelInstance) => {
    handleInstanceSelect(instance);
  }, [handleInstanceSelect]);

  if (!currentInstance) return <>{children}</>;

  return (
    <>
      <LoadBalancer
        instances={instances}
        onInstanceSelect={handleInstanceSelect}
      />
      <HealthChecker
        instance={currentInstance}
        onHealthUpdate={handleHealthUpdate}
      />
      <FailoverHandler
        instances={instances}
        currentInstance={currentInstance}
        onFailover={handleFailover}
      />
      {children}
    </>
  );
}; 