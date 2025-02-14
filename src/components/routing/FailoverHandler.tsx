/**
 * @ai-context: Monitors instance health and triggers failover when needed
 * @ai-dependencies: ModelInstance, React hooks
 * @ai-critical-points: Must prevent cascading failures and maintain system stability
 *
 * LEARNING POINTS:
 * 1. Uses failure count to prevent premature failover
 * 2. Implements health score threshold checking
 */

import { useState, useEffect, useCallback } from 'react';
import { ModelInstance } from '@/lib/api/types';

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
  const MAX_FAILURES = 3;

  /**
   * @ai-function: Finds the healthiest available instance for failover
   * @ai-requires: Active instances with health scores above threshold
   * @ai-affects: Instance selection during failover process
   */
  const findHealthyInstance = useCallback((): ModelInstance | null => {
    return instances
      .filter(candidateInstance => 
        candidateInstance.id !== currentInstance.id &&
        candidateInstance.isActive &&
        candidateInstance.healthScore > healthThreshold
      )
      .sort((a, b) => b.healthScore - a.healthScore)[0] || null;
  }, [instances, currentInstance.id, healthThreshold]);

  /**
   * @ai-function: Increments failure counter for tracking instance health
   * @ai-requires: None
   * @ai-affects: Failure count state which triggers failover
   */
  const handleFailure = useCallback(() => {
    setFailureCount(prev => prev + 1);
  }, []);

  /**
   * @ai-function: Monitors failure count and triggers failover when threshold reached
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

  /**
   * @ai-function: Monitors instance health and manages failure tracking
   * @ai-requires: Valid health threshold and current instance health score
   * @ai-affects: Failure count state and failover triggering
   */
  useEffect(() => {
    if (currentInstance.healthScore < healthThreshold) {
      handleFailure();
    } else {
      setFailureCount(0);
    }
  }, [currentInstance.healthScore, healthThreshold, handleFailure]);

  return null; // This is a logical component, no UI needed
};