import { useState, useEffect } from 'react';
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

  // Simple round-robin implementation
  const selectNextInstance = () => {
    const activeInstances = instances.filter(instance => 
      instance.isActive && instance.healthScore > 50
    );

    if (activeInstances.length === 0) return null;

    const nextIndex = (currentIndex + 1) % activeInstances.length;
    setCurrentIndex(nextIndex);
    return activeInstances[nextIndex];
  };

  useEffect(() => {
    const selectedInstance = selectNextInstance();
    if (selectedInstance) {
      onInstanceSelect(selectedInstance);
    }
  }, [instances]); // Re-run when instances list changes

  return null; // This is a logical component, no UI needed
}; 