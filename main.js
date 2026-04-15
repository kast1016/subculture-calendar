const { app, BrowserWindow } = require('electron');
const path = require('path');

const defaultUrl = `file://${path.join(__dirname, 'index.html')}`;
const startUrl = process.env.WEB_URL && process.env.WEB_URL.trim().length > 0 ? process.env.WEB_URL : defaultUrl;
const isKiosk = process.env.APP_KIOSK === 'true';

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 1024,
    minHeight: 768,
    show: false,
    kiosk: isKiosk,
    fullscreen: isKiosk,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      enableRemoteModule: false,
    },
  });

  mainWindow.loadURL(startUrl);
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
