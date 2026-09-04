'use client';

import { useState, useEffect } from 'react';

interface ApiStatusProps {
  className?: string;
}

export function ApiStatus({ className = '' }: ApiStatusProps) {
  const [status, setStatus] = useState<'loading' | 'healthy' | 'error'>('loading');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch('/api/health');
        if (response.ok) {
          setStatus('healthy');
        } else {
          setStatus('error');
        }
        setLastChecked(new Date());
      } catch (error) {
        setStatus('error');
        setLastChecked(new Date());
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const statusColors = {
    loading: 'text-yellow-600',
    healthy: 'text-green-600',
    error: 'text-red-600',
  };

  const statusText = {
    loading: 'Checking...',
    healthy: 'Healthy',
    error: 'Error',
  };

  return (
    <div className={`p-4 ${className}`}>
      <div className="flex items-center space-x-2">
        <span className={`font-medium ${statusColors[status]}`}>
          {statusText[status]}
        </span>
        {lastChecked && (
          <span className="text-sm text-gray-500">
            Last checked: {lastChecked.toLocaleTimeString()}
          </span>
        )}
      </div>
      <button
        onClick={() => window.location.reload()}
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Refresh Status
      </button>
    </div>
  );
}
