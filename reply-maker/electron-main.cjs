const { app, BrowserWindow } = require('electron');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: 'Reply Maker',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false
    }
  });

  // Try to load from Vite dev server (ports 5173, 5174, 5175)
  let ports = [5173, 5174, 5175];
  let currentPortIndex = 0;
  
  const tryLoad = () => {
    const port = ports[currentPortIndex];
    console.log(`Trying to load from http://localhost:${port}`);
    
    mainWindow.loadURL(`http://localhost:${port}`).catch(() => {
      currentPortIndex++;
      if (currentPortIndex < ports.length) {
        setTimeout(tryLoad, 1000);
      } else {
        console.log('Could not connect to Vite dev server');
      }
    });
  };

  // Start trying after a short delay
  setTimeout(tryLoad, 2000);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();
});

app.on('window-all-closed', () => {
  app.quit();
});
