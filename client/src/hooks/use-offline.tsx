import { useState, useEffect } from 'react';

interface OfflineData {
  vitals: any[];
  syncQueue: any[];
}

export function useOffline() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineData, setOfflineData] = useState<OfflineData>({
    vitals: [],
    syncQueue: []
  });

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineData();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load offline data from localStorage
    const stored = localStorage.getItem('sehatify_offline_data');
    if (stored) {
      try {
        setOfflineData(JSON.parse(stored));
      } catch (error) {
        console.error('Error parsing offline data:', error);
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const saveOfflineData = (data: Partial<OfflineData>) => {
    const newData = { ...offlineData, ...data };
    setOfflineData(newData);
    localStorage.setItem('sehatify_offline_data', JSON.stringify(newData));
  };

  const addToSyncQueue = (action: any) => {
    const newQueue = [...offlineData.syncQueue, action];
    saveOfflineData({ syncQueue: newQueue });
  };

  const syncOfflineData = async () => {
    if (offlineData.syncQueue.length === 0) return;

    try {
      // Process sync queue
      for (const action of offlineData.syncQueue) {
        // TODO: Implement actual sync logic based on action type
        console.log('Syncing action:', action);
      }

      // Clear sync queue after successful sync
      saveOfflineData({ syncQueue: [] });
    } catch (error) {
      console.error('Error syncing offline data:', error);
    }
  };

  const storeVitalsOffline = (vitals: any) => {
    const newVitals = [...offlineData.vitals, vitals];
    saveOfflineData({ vitals: newVitals });
    
    if (!isOnline) {
      addToSyncQueue({ type: 'ADD_VITALS', data: vitals });
    }
  };

  return {
    isOnline,
    offlineData,
    storeVitalsOffline,
    addToSyncQueue,
    syncOfflineData
  };
}
