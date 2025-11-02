import { useContext } from 'react';
import { HealthContext } from '@/context/health-context';

export function useHealthData() {
  const context = useContext(HealthContext);
  if (context === undefined) {
    throw new Error('useHealthData must be used within a HealthProvider');
  }
  return context;
}
