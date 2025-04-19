import { create } from 'zustand';
import { format, formatDistanceToNow } from 'date-fns';

interface Activity {
  action: string;
  time: string;
  status: 'success' | 'warning' | 'error';
  timestamp: Date;
}

interface Key {
  id: string;
  key: string;
  hwid?: string;
  expiryDate: Date;
  status: 'active' | 'expired';
  createdAt: Date;
}

interface KeyStore {
  keys: Key[];
  selectedKeys: string[];
  recentActivity: Activity[];
  addKey: (hwid: string | undefined, expiryDate: Date) => void;
  addMultipleKeys: (count: number, hwid: string | undefined, expiryDate: Date) => void;
  deleteKeys: (ids: string[]) => void;
  toggleKeySelection: (id: string) => void;
  clearSelection: () => void;
  setSelectedKeys: (selectedKeys: string[]) => void;
  selectAllKeys: () => void;
  extendKeyExpiration: (id: string, newExpiryDate: Date) => void;
  addActivity: (activity: Omit<Activity, 'time' | 'timestamp'>) => void;
}

const generateKey = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const segments = 4;
  const segmentLength = 4;
  let key = '';
  
  for (let i = 0; i < segments; i++) {
    for (let j = 0; j < segmentLength; j++) {
      key += chars[Math.floor(Math.random() * chars.length)];
    }
    if (i < segments - 1) key += '-';
  }
  
  return key;
};

// Load saved data from localStorage
const loadFromLocalStorage = () => {
  try {
    const savedKeys = localStorage.getItem('keySystem_keys');
    const savedActivity = localStorage.getItem('keySystem_activity');
    
    let keys: Key[] = [];
    let recentActivity: Activity[] = [];
    
    if (savedKeys) {
      keys = JSON.parse(savedKeys);
      // Convert date strings back to Date objects
      keys.forEach((key: Key) => {
        key.expiryDate = new Date(key.expiryDate);
        key.createdAt = new Date(key.createdAt);
      });
    }
    
    if (savedActivity) {
      recentActivity = JSON.parse(savedActivity);
      // Convert date strings back to Date objects
      recentActivity.forEach((activity: Activity) => {
        activity.timestamp = new Date(activity.timestamp);
      });
    }
    
    return { keys, recentActivity };
  } catch (error) {
    console.error("Error loading data from localStorage:", error);
    return { keys: [], recentActivity: [] };
  }
};

// Save data to localStorage
const saveToLocalStorage = (keys: Key[], recentActivity: Activity[]) => {
  try {
    localStorage.setItem('keySystem_keys', JSON.stringify(keys));
    localStorage.setItem('keySystem_activity', JSON.stringify(recentActivity));
  } catch (error) {
    console.error("Error saving data to localStorage:", error);
  }
};

// Initialize with saved data
const { keys: initialKeys, recentActivity: initialActivity } = loadFromLocalStorage();

export const useKeyStore = create<KeyStore>((set) => ({
  keys: initialKeys,
  selectedKeys: [],
  recentActivity: initialActivity,
  addKey: (hwid, expiryDate) => set((state): Partial<KeyStore> => {
    const newKey = {
      id: crypto.randomUUID(),
      key: generateKey(),
      hwid,
      expiryDate,
      status: new Date() < expiryDate ? 'active' : 'expired',
      createdAt: new Date(),
    };

    const newActivity = {
      action: `New key generated${hwid ? ' with HWID' : ''}`,
      status: 'success' as const,
      time: formatDistanceToNow(new Date(), { addSuffix: true }),
      timestamp: new Date(),
    };

    const updatedKeys = [...state.keys, newKey as Key];
    const updatedActivity = [newActivity, ...state.recentActivity].slice(0, 50);
    
    // Save to localStorage
    saveToLocalStorage(updatedKeys, updatedActivity);

    return {
      keys: updatedKeys,
      recentActivity: updatedActivity,
    };
  }),
  addMultipleKeys: (count, hwid, expiryDate) => set((state): Partial<KeyStore> => {
    const newKeys: Key[] = [];
    
    for (let i = 0; i < count; i++) {
      newKeys.push({
        id: crypto.randomUUID(),
        key: generateKey(),
        hwid,
        expiryDate,
        status: new Date() < expiryDate ? 'active' : 'expired',
        createdAt: new Date(),
      });
    }

    const newActivity = {
      action: `${count} keys generated${hwid ? ' with HWID' : ''}`,
      status: 'success' as const,
      time: formatDistanceToNow(new Date(), { addSuffix: true }),
      timestamp: new Date(),
    };

    const updatedKeys = [...state.keys, ...newKeys];
    const updatedActivity = [newActivity, ...state.recentActivity].slice(0, 50);
    
    // Save to localStorage
    saveToLocalStorage(updatedKeys, updatedActivity);

    return {
      keys: updatedKeys,
      recentActivity: updatedActivity,
    };
  }),
  deleteKeys: (ids) => set((state) => {
    const deletedCount = ids.length;
    const newActivity = {
      action: `${deletedCount} key${deletedCount > 1 ? 's' : ''} deleted`,
      status: 'warning' as const,
      time: formatDistanceToNow(new Date(), { addSuffix: true }),
      timestamp: new Date(),
    };

    // Yeni durumları hesapla
    const updatedKeys = state.keys.filter((key) => !ids.includes(key.id));
    const updatedSelectedKeys = state.selectedKeys.filter((id) => !ids.includes(id));
    const updatedActivity = [newActivity, ...state.recentActivity].slice(0, 50);
    
    // Save to localStorage
    saveToLocalStorage(updatedKeys, updatedActivity);

    // Basit durum güncellemesi
    return {
      keys: updatedKeys,
      selectedKeys: updatedSelectedKeys,
      recentActivity: updatedActivity,
    };
  }),
  toggleKeySelection: (id) => set((state) => ({
    selectedKeys: state.selectedKeys.includes(id)
      ? state.selectedKeys.filter((keyId) => keyId !== id)
      : [...state.selectedKeys, id],
  })),
  clearSelection: () => set({ selectedKeys: [] }),
  setSelectedKeys: (selectedKeys: string[]) => set((state) => ({ 
    selectedKeys, 
  })),
  selectAllKeys: () => set((state) => ({ 
    selectedKeys: state.keys.map((key: Key) => key.id) 
  })),
  extendKeyExpiration: (id, newExpiryDate) => set((state) => {
    const updatedKeys = state.keys.map((key: Key) =>
      key.id === id ? { ...key, expiryDate: newExpiryDate } : key
    );

    const newActivity = {
      action: `Key expiration extended`,
      status: 'success' as const,
      time: formatDistanceToNow(new Date(), { addSuffix: true }),
      timestamp: new Date(),
    };

    const updatedActivity = [newActivity, ...state.recentActivity].slice(0, 50);
    
    // Save to localStorage
    saveToLocalStorage(updatedKeys, updatedActivity);

    return {
      keys: updatedKeys,
      recentActivity: updatedActivity,
    };
  }),
  addActivity: (activity) => set((state) => {
    const newActivity = {
      ...activity,
      time: formatDistanceToNow(new Date(), { addSuffix: true }),
      timestamp: new Date(),
    };
    
    const updatedActivity = [newActivity, ...state.recentActivity].slice(0, 50);
    
    // Save to localStorage
    saveToLocalStorage(state.keys, updatedActivity);
    
    return {
      recentActivity: updatedActivity,
    };
  }),
}));