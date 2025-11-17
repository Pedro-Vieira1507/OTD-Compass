// main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    icon: path.join(__dirname, 'assets', 'icon.png'), // Ícone para modo dev
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'Dashboard.html'));

  // Abre DevTools apenas se precisar depurar:
  // mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Evento principal
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // No macOS, recria a janela se o ícone for clicado e não houver janelas abertas
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Fecha completamente no Windows/Linux quando todas as janelas forem fechadas
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ===============================
// 📁 Armazenamento local
// ===============================
const userDataDir = app.getPath('userData');
const dataFile = path.join(userDataDir, 'dashboard_data.json');

// Salvar dados no arquivo local
ipcMain.handle('save-data', async (_, payload) => {
  try {
    fs.mkdirSync(userDataDir, { recursive: true });
    fs.writeFileSync(dataFile, JSON.stringify(payload, null, 2), 'utf-8');
    return { ok: true, path: dataFile };
  } catch (err) {
    console.error('Erro ao salvar dados:', err);
    return { ok: false, error: err.message };
  }
});

// Carregar dados salvos
ipcMain.handle('load-data', async () => {
  try {
    if (!fs.existsSync(dataFile)) return { ok: true, data: null };
    const raw = fs.readFileSync(dataFile, 'utf-8');
    return { ok: true, data: JSON.parse(raw) };
  } catch (err) {
    console.error('Erro ao carregar dados:', err);
    return { ok: false, error: err.message };
  }
});
