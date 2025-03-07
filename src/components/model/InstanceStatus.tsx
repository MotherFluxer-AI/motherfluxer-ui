import React from 'react';
import { ModelInstance } from '@/lib/api/types';

interface InstanceStatusProps {
  instance: ModelInstance;
}

export const InstanceStatus: React.FC<InstanceStatusProps> = ({ instance }) => {
  const getHealthColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="p-4 border rounded">
      <h4 className="font-semibold">{instance.instanceName}</h4>
      <div className="mt-2 flex items-center">
        <div className="flex-1">
          <div className="h-2 bg-gray-200 rounded">
            <div
              className={`h-2 rounded ${getHealthColor(instance.healthScore)}`}
              style={{ width: `${instance.healthScore}%` }}
            />
          </div>
        </div>
        <span className="ml-2 text-sm">{instance.healthScore}%</span>
      </div>
      <div className="mt-2 text-sm text-gray-600">
        <p>Version: {instance.version}</p>
        <p>Status: {instance.isActive ? 'Active' : 'Inactive'}</p>
      </div>
    </div>
  );
}; 