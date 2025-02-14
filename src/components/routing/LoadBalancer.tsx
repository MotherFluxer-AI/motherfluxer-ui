/**
 * @ai-context: Manages instance selection and load distribution across active model instances
 * @ai-dependencies: ModelInstance, useStore, React hooks
 * @ai-critical-points: Must maintain round-robin selection while respecting health thresholds
 *
 * LEARNING POINTS:
 * 1. Uses modulo operation for circular instance selection
 * 2. Integrates with global state while maintaining local state
 */

import { useState, useEffect, useCallback } from 'react';
import { ModelInstance } from '@/lib/api/types';
import { useStore } from '@/lib/store';

interface LoadBalancerProps {
  instances: ModelInstance[];
  onInstanceSelect: (selectedInstance: ModelInstance) => void;
  healthThreshold?: number;
}

export const LoadBalancer: React.FC<LoadBalancerProps> = ({ 
  instances, 
  onInstanceSelect,
  healthThreshold = 50
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { setSelectedInstance } = useStore();

  /**
   * @ai-function: Selects next available instance using round-robin algorithm
   * @ai-requires: Active instances with health scores above threshold
   * @ai-affects: Current index state and instance selection
   */
  const selectNextInstance = useCallback(() => {
    const activeInstances = instances.filter(candidateInstance => 
      candidateInstance.isActive && 
      candidateInstance.healthScore > healthThreshold
    );

    if (activeInstances.length === 0) return null;

    const nextIndex = (currentIndex + 1) % activeInstances.length;
    setCurrentIndex(nextIndex);
    return activeInstances[nextIndex];
  }, [instances, currentIndex, healthThreshold]);

  /**
   * @ai-function: Updates both local and global state with selected instance
   * @ai-requires: Valid instance selection from selectNextInstance
   * @ai-affects: Global store state and parent component state
   */
  useEffect(() => {
    const selectedInstance = selectNextInstance();
    if (selectedInstance) {
      onInstanceSelect(selectedInstance);
      setSelectedInstance(selectedInstance);
    }
  }, [selectNextInstance, onInstanceSelect, setSelectedInstance]);

  return null;
}; 