import { contextBridge, ipcRenderer } from 'electron';

export interface McmsDesktopAPI {
  getSyncStatus: () => Promise<{
    ready: boolean;
    pendingOperations: number;
    cursor: string | null;
  }>;
  getVersion: () => Promise<string>;
  enqueueSyncOp: (op: any) => Promise<boolean>;
  getPendingSyncOps: () => Promise<any[]>;
  triggerSync: () => Promise<{ success: boolean; pushed: number; message: string }>;
}

const api: McmsDesktopAPI = {
  getSyncStatus: () => ipcRenderer.invoke('sqlite:getSyncStatus'),
  getVersion: () => ipcRenderer.invoke('app:getVersion'),
  enqueueSyncOp: (op: any) => ipcRenderer.invoke('sqlite:enqueueSyncOp', op),
  getPendingSyncOps: () => ipcRenderer.invoke('sqlite:getPendingOps'),
  triggerSync: () => ipcRenderer.invoke('sqlite:triggerSync'),
};

contextBridge.exposeInMainWorld('mcmsDesktop', api);
