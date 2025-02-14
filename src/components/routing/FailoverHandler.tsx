import { useState, useEffect } from 'react';
import { ModelInstance } from '@/lib/api/types';

interface FailoverHandlerProps {
  instances: ModelInstance[];
  currentInstance: ModelInstance;
  onFailover: (newInstance: ModelInstance) => void;
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

  const findHealthyInstance = (): ModelInstance | null => {
    return instances
      .filter(instance => 
        instance.id !== currentInstance.id &&
        instance.isActive &&
        instance.healthScore > healthThreshold
      )
      .sort((a, b) => b.healthScore - a.healthScore)[0] || null;
  };

  const handleFailure = () => {
    setFailureCount(prev => prev + 1);
  };

  useEffect(() => {
    if (failureCount >= MAX_FAILURES) {
      const newInstance = findHealthyInstance();
      if (newInstance) {
        onFailover(newInstance);
        setFailureCount(0);
      }
    }
  }, [failureCount]);

  useEffect(() => {
    if (currentInstance.healthScore < healthThreshold) {
      handleFailure();
    } else {
      setFailureCount(0);
    }
  }, [currentInstance.healthScore]);

  return null; // This is a logical component, no UI needed
};