const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  
  // Abrir URL em navegador interno
  openUrl: (url) => ipcRenderer.send('open-url-internal', url),
  
  // APIs de atualização
  update: {
    // Verificar atualizações
    check: () => ipcRenderer.send('update-check'),
    
    // Baixar atualização
    download: () => ipcRenderer.send('update-download'),
    
    // Instalar atualização
    install: () => ipcRenderer.send('update-install'),
    
    // Listeners de eventos
    onChecking: (callback) => ipcRenderer.on('update-checking', callback),
    onAvailable: (callback) => ipcRenderer.on('update-available', (event, data) => callback(data)),
    onNotAvailable: (callback) => ipcRenderer.on('update-not-available', callback),
    onDownloadProgress: (callback) => ipcRenderer.on('update-download-progress', (event, data) => callback(data)),
    onDownloaded: (callback) => ipcRenderer.on('update-downloaded', (event, data) => callback(data)),
    onError: (callback) => ipcRenderer.on('update-error', (event, data) => callback(data)),
    
    // Remover listeners
    removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
  }
});

