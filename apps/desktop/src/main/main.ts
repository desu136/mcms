import { app, BrowserWindow, ipcMain, net } from 'electron';
import * as path from 'path';
import { LocalSqliteStorage } from '../storage/sqlite-client';

let mainWindow: BrowserWindow | null = null;
let sqliteStorage: LocalSqliteStorage | null = null;

async function waitForVite(url: string, retries = 30, delayMs = 500): Promise<boolean> {
  for (let i = 0; i < retries; i++) {
    try {
      await new Promise<void>((resolve, reject) => {
        const req = net.request(url);
        req.on('response', () => resolve());
        req.on('error', reject);
        req.end();
      });
      return true;
    } catch {
      console.log(`[MCMS] Waiting for Vite dev server... (${i + 1}/${retries})`);
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
  return false;
}

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
    // Open DevTools so we can see renderer errors
    mainWindow.webContents.openDevTools();

    // Wait for Vite to be ready, then load
    waitForVite('http://localhost:5173').then((ready) => {
      if (ready) {
        console.log('[MCMS] Vite ready — loading http://localhost:5173');
        mainWindow?.loadURL('http://localhost:5173');
      } else {
        console.error('[MCMS] Vite dev server not reachable. Is `pnpm dev` running?');
        mainWindow?.loadFile(path.join(__dirname, '../renderer/index.html'));
      }
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
