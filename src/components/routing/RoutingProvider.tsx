/**
 * @ai-context: Manages model instance routing, health checks, and failover
 * @ai-dependencies: LoadBalancer, HealthChecker, FailoverHandler
 * @ai-critical-points: Must coordinate instance selection and health monitoring
 */

import { useCallback, useEffect } from 'react';
import { ModelInstance } from '@/lib/api/types';
import { LoadBalancer } from './LoadBalancer';
import { HealthChecker } from './HealthChecker';
import { FailoverHandler } from './FailoverHandler';
import { useStore } from '@/lib/store';
import { ApiClient } from '@/lib/api/client';

interface Props {
  children: React.ReactNode;
}

export const RoutingProvider: React.FC<Props> = ({ children }) => {
  const { 
    instances, 
    setInstances, 
    selectedInstance,
    setSelectedInstance,
    updateInstanceHealth 
  } = useStore();

  /**
   * @ai-function: Fetches and initializes available instances
   * @ai-affects: Global instance state
   */
  useEffect(() => {
    const fetchInstances = async () => {
      try {
        const response = await ApiClient.get<ModelInstance[]>('/api/instances');
        if (response.data) {
          setInstances(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch instances:', error);
      }
    };
    fetchInstances();
  }, [setInstances]);

  /**
   * @ai-function: Handles instance selection from LoadBalancer
   * @ai-affects: Selected instance state
   */
  const handleInstanceSelect = useCallback((instance: ModelInstance) => {
    setSelectedInstance(instance);
  }, [setSelectedInstance]);

  /**
   * @ai-function: Updates instance health in global state
   * @ai-affects: Instance health tracking
   */
  const handleHealthUpdate = useCallback((healthScore: number) => {
    if (selectedInstance) {
      updateInstanceHealth(selectedInstance.id, healthScore);
    }
  }, [selectedInstance, updateInstanceHealth]);

  /**
   * @ai-function: Handles failover to new instance
   * @ai-affects: Selected instance state
   */
  const handleFailover = useCallback((instance: ModelInstance) => {
    handleInstanceSelect(instance);
  }, [handleInstanceSelect]);

  // Don't render routing components until we have instances
  if (instances.length === 0) return <>{children}</>;

  return (
    <>
      <LoadBalancer
        instances={instances}
        onInstanceSelect={handleInstanceSelect}
      />
      {selectedInstance && (
        <>
          <HealthChecker
            instance={selectedInstance}
            onHealthUpdate={handleHealthUpdate}
          />
          <FailoverHandler
            instances={instances}
            currentInstance={selectedInstance}
            onFailover={handleFailover}
          />
        </>
      )}
      {children}
    </>
  );
}; 