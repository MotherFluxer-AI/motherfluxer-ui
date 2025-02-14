/**
 * @ai-context: Monitors instance health and triggers failover when needed
 * @ai-dependencies: ModelInstance, React hooks, Store
 * @ai-critical-points: Must prevent cascading failures and maintain system stability
 *
 * LEARNING POINTS:
 * 1. Uses failure count to prevent premature failover
 * 2. Implements health score threshold checking
 */

import { useState, useEffect, useCallback } from 'react';
import { ModelInstance } from '@/lib/api/types';
import { useStore } from '@/lib/store';

interface FailoverHandlerProps {
  instances: ModelInstance[];
  currentInstance: ModelInstance;
  onFailover: (instance: ModelInstance) => void;
  healthThreshold?: number;
}

export const FailoverHandler: React.FC<FailoverHandlerProps> = ({
  instances,
  currentInstance,
  onFailover,
  healthThreshold = 50
}) => {
  const [failureCount, setFailureCount] = useState(0);
  const { instanceHealth } = useStore();
  const MAX_FAILURES = 3;

  /**
   * @ai-function: Finds the healthiest available instance for failover
   * @ai-requires: Active instances with health scores above threshold
   * @ai-affects: Instance selection during failover process
   */
  const findHealthyInstance = useCallback((): ModelInstance | null => {
    return instances
      .filter(instance => 
        instance.id !== currentInstance.id &&
        instance.isActive &&
        (instanceHealth[instance.id] || instance.healthScore) > healthThreshold
      )
      .sort((a, b) => 
        (instanceHealth[b.id] || b.healthScore) - 
        (instanceHealth[a.id] || a.healthScore)
      )[0] || null;
  }, [instances, currentInstance.id, healthThreshold, instanceHealth]);

  /**
   * @ai-function: Monitors current instance health and manages failure tracking
   * @ai-requires: Valid health threshold and current instance health score
   * @ai-affects: Failure count state and failover triggering
   */
  useEffect(() => {
    const currentHealth = instanceHealth[currentInstance.id] || currentInstance.healthScore;
    
    if (currentHealth < healthThreshold) {
      setFailureCount(prev => prev + 1);
    } else {
      setFailureCount(0);
    }
  }, [currentInstance.id, instanceHealth, healthThreshold, currentInstance.healthScore]);

  /**
   * @ai-function: Triggers failover when failure threshold is reached
   * @ai-requires: Valid failure count and healthy instance availability
   * @ai-affects: System stability through instance failover
   */
  useEffect(() => {
    if (failureCount >= MAX_FAILURES) {
      const healthyInstance = findHealthyInstance();
      if (healthyInstance) {
        onFailover(healthyInstance);
        setFailureCount(0);
      }
    }
  }, [failureCount, findHealthyInstance, onFailover]);

  return null; // This is a logical component, no UI needed
};