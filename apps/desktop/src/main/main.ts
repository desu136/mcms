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
