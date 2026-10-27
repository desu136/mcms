import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { LocalSqliteStorage } from '../storage/sqlite-client';

let mainWindow: BrowserWindow | null = null;
let sqliteStorage: LocalSqliteStorage | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: 'MCMS Workstation — Clinic Management System',
    webPreferences: {
      // Secure boundaries: strictly separate Node.js from Renderer
      preload: path.join(__dirname, '../preload/preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173').catch(() => {
      // Fallback if Vite dev server is not active
      mainWindow?.loadFile(path.join(__dirname, '../renderer/index.html'));
    });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }
}

app.whenReady().then(() => {
  try {
    sqliteStorage = new LocalSqliteStorage();
  } catch (err) {
    console.error('Failed to initialize local SQLite:', err);
  }

  // Register secure IPC handlers
  ipcMain.handle('sqlite:getSyncStatus', async () => {
    if (!sqliteStorage) return { ready: false, pendingOperations: 0, cursor: null };
    return {
      ready: true,
      pendingOperations: sqliteStorage.getPendingCount(),
      cursor: sqliteStorage.getCursor(),
    };
  });

  ipcMain.handle('sqlite:enqueueSyncOp', async (_event, op) => {
    if (!sqliteStorage) return false;
    try {
      sqliteStorage.enqueueOperation(op);
      return true;
    } catch (e) {
      console.error('Failed to enqueue sync op:', e);
      return false;
    }
  });

  ipcMain.handle('sqlite:getPendingOps', async () => {
    if (!sqliteStorage) return [];
    return sqliteStorage.getPendingOperations();
  });

  ipcMain.handle('sqlite:triggerSync', async () => {
    if (!sqliteStorage) return { success: false, pushed: 0, message: 'SQLite storage not ready' };
    const pending = sqliteStorage.getPendingOperations();
    if (pending.length === 0) {
      return { success: true, pushed: 0, message: 'Sync queue is already clean (0 pending).' };
    }

    try {
      const cursor = sqliteStorage.getCursor();
      const apiUrl = process.env.DESKTOP_API_URL || 'http://localhost:3001/api/v1';
      const res = await fetch(`${apiUrl}/sync/push`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // If bearer token exists in memory/env, we could pass it or pass sync token
        },
        body: JSON.stringify({
          cursor,
          operations: pending,
        }),
      });

      if (res.ok) {
        const data = await res.json() as any;
        let pushedCount = 0;
        if (Array.isArray(data.acknowledgements)) {
          for (const ack of data.acknowledgements) {
            if (ack.status === 'ACCEPTED' || ack.status === 'DUPLICATE') {
              sqliteStorage.acknowledgeOperation(ack.operationId);
              pushedCount++;
            }
          }
        }
        if (data.newCursor) {
          sqliteStorage.setCursor(data.newCursor);
        }
        return {
          success: true,
          pushed: pushedCount,
          message: `Successfully synchronized ${pushedCount} operations with central clinic server.`,
        };
      } else {
        // Fallback acknowledge simulation for offline dev/test when auth token is required on endpoint
        return {
          success: false,
          pushed: 0,
          message: `Server returned HTTP ${res.status}. Operations remain securely stored in local SQLite queue.`,
        };
      }
    } catch (err: any) {
      return {
        success: false,
        pushed: 0,
        message: `Offline mode: central server unreachable (${err?.message || 'Network error'}). Changes queued locally in SQLite.`,
      };
    }
  });

  ipcMain.handle('app:getVersion', () => app.getVersion());

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (sqliteStorage) sqliteStorage.close();
  if (process.platform !== 'darwin') app.quit();
});
