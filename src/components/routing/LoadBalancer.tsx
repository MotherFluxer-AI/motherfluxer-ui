import { useState, useEffect, useCallback } from 'react';
import { ModelInstance } from '@/lib/api/types';

interface LoadBalancerProps {
  instances: ModelInstance[];
  onInstanceSelect: (instance: ModelInstance) => void;
}

export const LoadBalancer: React.FC<LoadBalancerProps> = ({ 
  instances, 
  onInstanceSelect 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const selectNextInstance = useCallback(() => {
    const activeInstances = instances.filter(inst => 
      inst.isActive && inst.healthScore > 50
    );

    if (activeInstances.length === 0) return null;

    const nextIndex = (currentIndex + 1) % activeInstances.length;
    setCurrentIndex(nextIndex);
    return activeInstances[nextIndex];
  }, [instances, currentIndex]);

  useEffect(() => {
    const instance = selectNextInstance();
    if (instance) {
      onInstanceSelect(instance);
    }
  }, [selectNextInstance, onInstanceSelect]);

  return null;
}; 