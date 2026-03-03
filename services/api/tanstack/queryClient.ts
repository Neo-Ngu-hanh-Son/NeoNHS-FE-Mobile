import { QueryClient } from '@tanstack/react-query';
import { createMMKV } from 'react-native-mmkv';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { logger } from '@/utils/logger';

const storage = createMMKV({
  id: 'queryCache',
  encryptionKey: 'your-encryption-key', // Optional: Add encryption for security
  mode: 'single-process', // Use single process mode for better performance
});
const clientPersister = createAsyncStoragePersister({
  storage: {
    setItem: (key, value) => {
      // logger.debug(`[QueryClient] Persisting key: ${key}`);
      return storage.set(key, value);
    },
    getItem: (key) => {
      logger.debug(`[QueryClient] Retrieving key: ${key}`);
      return storage.getString(key) ?? null;
    },
    removeItem: (key) => {
      logger.debug(`[QueryClient] Removing key: ${key}`);
      storage.remove(key);
    },
  },
});

// 2. Create the Query Client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // How long data is considered "fresh" (5 mins)
      staleTime: 1000 * 60 * 3,
      // How long data stays in cache before being deleted (6 hours)
      gcTime: 1000 * 60 * 60 * 6,
      // Background refetching settings
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 1,
    },
  },
});

// 3. Link them together
persistQueryClient({
  queryClient,
  persister: clientPersister,
  maxAge: 1000 * 60 * 60 * 6, // Keep persisted data for 6h
});
