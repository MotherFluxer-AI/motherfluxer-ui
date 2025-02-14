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

  const findHealthyInstance = useCallback((): ModelInstance | null => {
    return instances
      .filter(instance => 
        instance.id !== currentInstance.id &&
        instance.isActive &&
        instance.healthScore > healthThreshold
      )
      .sort((a, b) => b.healthScore - a.healthScore)[0] || null;
  }, [instances, currentInstance.id, healthThreshold]);

  const handleFailure = useCallback(() => {
    setFailureCount(prev => prev + 1);
  }, []);

  useEffect(() => {
    if (failureCount >= MAX_FAILURES) {
      const instance = findHealthyInstance();
      if (instance) {
        onFailover(instance);
        setFailureCount(0);
      }
    }
  }, [failureCount, findHealthyInstance, onFailover, MAX_FAILURES]);

  useEffect(() => {
    if (currentInstance.healthScore < healthThreshold) {
      handleFailure();
    } else {
      setFailureCount(0);
    }
  }, [currentInstance.healthScore, healthThreshold, handleFailure]);

  return null; // This is a logical component, no UI needed
};