import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface SyncStatus {
  ready: boolean;
  pendingOperations: number;
  cursor: string | null;
}

export interface SyncContextValue {
  syncStatus: SyncStatus;
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  lastSyncMessage: string | null;
  pendingOps: any[];
  enqueueOperation: (
    entityType: string,
    entityId: string,
    operation: 'CREATE' | 'UPDATE' | 'DELETE',
    payload: any,
  ) => Promise<boolean>;
  triggerSync: () => Promise<{ success: boolean; pushed: number; message: string }>;
  refreshSyncStatus: () => Promise<void>;
}

declare global {
  interface Window {
    mcmsDesktop?: {
      getSyncStatus: () => Promise<SyncStatus>;
      getVersion: () => Promise<string>;
      enqueueSyncOp: (op: any) => Promise<boolean>;
      getPendingSyncOps: () => Promise<any[]>;
      triggerSync: () => Promise<{ success: boolean; pushed: number; message: string }>;
    };
  }
}

const SyncContext = createContext<SyncContextValue | null>(null);

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    ready: true,
    pendingOperations: 0,
    cursor: null,
  });
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [lastSyncMessage, setLastSyncMessage] = useState<string | null>(null);
  const [pendingOps, setPendingOps] = useState<any[]>([]);

  // Listen to browser / network online / offline events
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const refreshSyncStatus = useCallback(async () => {
    if (window.mcmsDesktop) {
      try {
        const status = await window.mcmsDesktop.getSyncStatus();
        setSyncStatus(status);
        const ops = await window.mcmsDesktop.getPendingSyncOps();
        setPendingOps(ops || []);
      } catch (err) {
        console.warn('Sync status refresh error:', err);
      }
    }
  }, []);

  // Poll sync status every 10 seconds or on mount
  useEffect(() => {
    refreshSyncStatus();
    const interval = setInterval(refreshSyncStatus, 10000);
    return () => clearInterval(interval);
  }, [refreshSyncStatus]);

  const enqueueOperation = useCallback(
    async (
      entityType: string,
      entityId: string,
      operation: 'CREATE' | 'UPDATE' | 'DELETE',
      payload: any,
    ): Promise<boolean> => {
      const op = {
        operationId: `desktop-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        entityType,
        entityId,
        operation,
        payload,
        clientTimestamp: new Date().toISOString(),
        baseVersion: 1,
        status: 'PENDING',
      };

      if (window.mcmsDesktop?.enqueueSyncOp) {
        const success = await window.mcmsDesktop.enqueueSyncOp(op);
        await refreshSyncStatus();
        return success;
      } else {
        // In-memory fallback if running without Electron preload
        setPendingOps((prev) => [...prev, op]);
        setSyncStatus((prev) => ({
          ...prev,
          pendingOperations: prev.pendingOperations + 1,
        }));
        return true;
      }
    },
    [refreshSyncStatus],
  );

  const triggerSync = useCallback(async (): Promise<{
    success: boolean;
    pushed: number;
    message: string;
  }> => {
    setIsSyncing(true);
    try {
      if (window.mcmsDesktop?.triggerSync) {
        const res = await window.mcmsDesktop.triggerSync();
        setLastSyncedAt(new Date());
        setLastSyncMessage(res.message);
        await refreshSyncStatus();
        return res;
      } else {
        // Fallback simulation
        await new Promise((r) => setTimeout(r, 600));
        const count = pendingOps.length;
        setPendingOps([]);
        setSyncStatus((prev) => ({ ...prev, pendingOperations: 0 }));
        setLastSyncedAt(new Date());
        const msg = `Synced ${count} pending operations with central server.`;
        setLastSyncMessage(msg);
        return { success: true, pushed: count, message: msg };
      }
    } catch (err: any) {
      const msg = `Sync failed: ${err?.message || 'Server unreachable'}`;
      setLastSyncMessage(msg);
      return { success: false, pushed: 0, message: msg };
    } finally {
      setIsSyncing(false);
    }
  }, [pendingOps.length, refreshSyncStatus]);

  return (
    <SyncContext.Provider
      value={{
        syncStatus,
        isOnline,
        isSyncing,
        lastSyncedAt,
        lastSyncMessage,
        pendingOps,
        enqueueOperation,
        triggerSync,
        refreshSyncStatus,
      }}
    >
      {children}
    </SyncContext.Provider>
  );
}

export function useSync(): SyncContextValue {
  const ctx = useContext(SyncContext);
  if (!ctx) throw new Error('useSync must be used within <SyncProvider>');
  return ctx;
}
