import { contextBridge, ipcRenderer } from 'electron';

export interface McmsDesktopAPI {
  getSyncStatus: () => Promise<{
    ready: boolean;
    pendingOperations: number;
    cursor: string | null;
  }>;
  getVersion: () => Promise<string>;
}

const api: McmsDesktopAPI = {
  getSyncStatus: () => ipcRenderer.invoke('sqlite:getSyncStatus'),
  getVersion: () => ipcRenderer.invoke('app:getVersion'),
};

contextBridge.exposeInMainWorld('mcmsDesktop', api);
