const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// Variável global para manter a referência da janela
let mainWindow;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 768,
    title: "PizzaAI PDV",
    // Tenta usar o ícone se existir, senão usa padrão
    icon: path.join(__dirname, 'public/favicon.ico'), 
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // Permite usar window.require('electron') no React
      devTools: false 
    },
    autoHideMenuBar: true, 
  });

  mainWindow.maximize(); // Abrir maximizado

  // Load the app
  const isDev = !app.isPackaged;
  
  if (isDev) {
    // Modo Desenvolvimento
    mainWindow.loadURL('http://localhost:5173');
    // mainWindow.webContents.openDevTools(); 
  } else {
    // Modo Produção (dentro do .exe)
    mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// --- SISTEMA DE IMPRESSÃO E HARDWARE (IPC) ---

// 1. Listar Impressoras conectadas ao Windows
ipcMain.handle('get-printers', async (event) => {
  try {
    // Retorna array de objetos { name, displayName, isDefault, ... }
    return await mainWindow.webContents.getPrintersAsync();
  } catch (error) {
    console.error("Erro ao listar impressoras:", error);
    return [];
  }
});

// 2. Imprimir (Silencioso se configurado)
ipcMain.on('print-silent', (event, options) => {
  // options espera: { printerName: string, silent: boolean }
  const printerName = options.printerName || '';
  
  const printOptions = {
    silent: options.silent !== false, // Default true (silencioso)
    printBackground: true,
    deviceName: printerName 
  };

  // Se o nome da impressora não for válido ou vazio, o Electron tenta usar a padrão
  mainWindow.webContents.print(printOptions, (success, errorType) => {
    if (!success) {
      console.log(`Falha na impressão para ${printerName}:`, errorType);
    } else {
      console.log(`Sucesso na impressão para ${printerName}`);
    }
  });
});