// Carregar variáveis de ambiente do arquivo .env
require('dotenv').config();

const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const { autoUpdater } = require('electron-updater');

let mainWindow;
let serverProcess;

// Verificar se está em modo desenvolvimento
const isDev = !app.isPackaged || process.env.NODE_ENV === 'development';

// Configurar Content Security Policy via headers HTTP
// Isso resolve os avisos de segurança do Electron
// Configuramos no evento 'ready' para garantir que esteja ativo antes de criar janelas
app.once('ready', () => {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    // CSP mais seguro para produção (sem unsafe-eval)
    const cspProduction = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' http://localhost:* ws://localhost:* wss://localhost:*; frame-ancestors 'none';";
    
    // CSP para desenvolvimento (com unsafe-eval para hot-reload do React)
    const cspDevelopment = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' http://localhost:* ws://localhost:* wss://localhost:*; frame-ancestors 'none';";
    
    const csp = isDev ? cspDevelopment : cspProduction;
    
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [csp]
      }
    });
  });
});

// Configurar auto-updater
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

// Configurar URL do servidor de atualização
// Configure via variável de ambiente UPDATE_SERVER_URL no arquivo .env
// Ou edite o package.json na seção "build.publish.url"
// Veja UPDATE_SERVER_SETUP.md para instruções completas
const updateServerUrl = process.env.UPDATE_SERVER_URL || 'https://seu-servidor.com/updates';
if (!isDev) {
  autoUpdater.setFeedURL({
    provider: 'generic',
    url: updateServerUrl
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      sandbox: true,
      webSecurity: true,
      // Electron 39+ requer explicitamente permitir acesso a recursos locais
      allowRunningInsecureContent: false
    },
    backgroundColor: '#0a0e27',
    icon: path.join(__dirname, 'build', 'icon.png'),
    show: false,
    autoHideMenuBar: true
  });

  // Iniciar servidor backend
  startBackendServer();

  // Carregar aplicação React
  if (isDev) {
    // Modo desenvolvimento - usar servidor React
    // Aguardar servidor React estar pronto
    const checkReactServer = setInterval(() => {
      const http = require('http');
      const req = http.get('http://localhost:3000', (res) => {
        if (res.statusCode === 200) {
          clearInterval(checkReactServer);
          mainWindow.loadURL('http://localhost:3000');
          mainWindow.show();
          // DevTools apenas se necessário (comentar para desabilitar)
          // mainWindow.webContents.openDevTools();
        }
      });
      req.on('error', () => {
        // Servidor ainda não está pronto, continuar tentando
      });
      req.end();
    }, 500);
    
    // Timeout de segurança
    setTimeout(() => {
      clearInterval(checkReactServer);
    }, 30000);
  } else {
    // Modo produção - verificar se build existe
    const buildPath = path.join(__dirname, 'build', 'index.html');
    if (fs.existsSync(buildPath)) {
      mainWindow.loadFile(buildPath);
      mainWindow.show();
    } else {
      console.error('Arquivo build/index.html não encontrado. Execute "npm run build" primeiro.');
      app.quit();
    }
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function startBackendServer() {
  // Verificar se o servidor já está rodando
  const http = require('http');
  const testReq = http.get('http://localhost:3001/api/health', () => {
    // Servidor já está rodando
    console.log('✅ Servidor backend já está rodando');
  });
  
  testReq.on('error', () => {
    // Servidor não está rodando, iniciar novo processo
    console.log('🚀 Iniciando servidor backend...');
    
    // Usar spawn sem shell para evitar CMD extra no Windows
    const isWindows = process.platform === 'win32';
    serverProcess = spawn('node', [path.join(__dirname, 'server.js')], {
      cwd: __dirname,
      stdio: ['ignore', 'pipe', 'pipe'], // stdin, stdout, stderr
      env: { ...process.env, NODE_ENV: 'development' },
      detached: false
    });

    // Capturar logs do servidor (opcional, para debug)
    if (isDev) {
      serverProcess.stdout.on('data', (data) => {
        const output = data.toString().trim();
        if (output) {
          console.log(`[Backend] ${output}`);
        }
      });

      serverProcess.stderr.on('data', (data) => {
        const output = data.toString().trim();
        if (output && !output.includes('DeprecationWarning')) {
          console.error(`[Backend Error] ${output}`);
        }
      });
    }

    serverProcess.on('error', (error) => {
      console.error('❌ Erro ao iniciar servidor backend:', error.message);
      console.error('💡 Verifique se o Node.js está instalado e acessível');
    });

    serverProcess.on('exit', (code) => {
      if (code !== 0 && code !== null) {
        console.error(`❌ Servidor backend encerrado com código ${code}`);
      }
    });
  });
  
  testReq.end();
}

// Prevenir navegação para URLs externas
app.on('web-contents-created', (event, contents) => {
  contents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    
    // Permitir apenas localhost
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001'
    ];
    
    if (!allowedOrigins.includes(parsedUrl.origin)) {
      event.preventDefault();
      console.warn(`⚠️  Navegação bloqueada para: ${navigationUrl}`);
    }
  });

  // Prevenir criação de novas janelas via window.open
  contents.setWindowOpenHandler(({ url }) => {
    // Bloquear abertura automática, será controlado via IPC
    return { action: 'deny' };
  });
});

// Handler IPC para abrir URLs em navegador interno
ipcMain.on('open-url-internal', (event, url) => {
  // Validar URL
  if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
    console.warn('⚠️  URL inválida:', url);
    return;
  }

  // Criar nova janela do navegador interno
  const browserWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false
    },
    backgroundColor: '#ffffff',
    show: false,
    autoHideMenuBar: true
  });

  // Carregar URL
  browserWindow.loadURL(url);

  // Mostrar janela quando pronta
  browserWindow.once('ready-to-show', () => {
    browserWindow.show();
  });

  // Limpar referência quando fechar
  browserWindow.on('closed', () => {
    browserWindow = null;
  });
});

// Prevenir abertura automática do navegador
app.commandLine.appendSwitch('disable-features', 'VizDisplayCompositor');

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  // Verificar atualizações após inicialização (apenas em produção)
  if (!isDev) {
    // Aguardar alguns segundos antes de verificar atualizações
    setTimeout(() => {
      checkForUpdates();
    }, 5000);
  }
});

// Função para verificar atualizações
function checkForUpdates() {
  if (isDev) {
    console.log('⚠️  Modo desenvolvimento: atualizações desabilitadas');
    return;
  }

  console.log('🔍 Verificando atualizações...');
  autoUpdater.checkForUpdates().catch(err => {
    console.error('❌ Erro ao verificar atualizações:', err.message);
    if (mainWindow) {
      mainWindow.webContents.send('update-error', {
        message: 'Erro ao verificar atualizações: ' + err.message
      });
    }
  });
}

// Eventos do auto-updater
autoUpdater.on('checking-for-update', () => {
  console.log('🔍 Verificando atualizações...');
  if (mainWindow) {
    mainWindow.webContents.send('update-checking');
  }
});

autoUpdater.on('update-available', (info) => {
  console.log('✅ Atualização disponível:', info.version);
  if (mainWindow) {
    mainWindow.webContents.send('update-available', {
      version: info.version,
      releaseDate: info.releaseDate,
      releaseNotes: info.releaseNotes
    });
  }
});

autoUpdater.on('update-not-available', (info) => {
  console.log('✅ Aplicativo está atualizado');
  if (mainWindow) {
    mainWindow.webContents.send('update-not-available');
  }
});

autoUpdater.on('error', (err) => {
  console.error('❌ Erro no auto-updater:', err.message);
  if (mainWindow) {
    mainWindow.webContents.send('update-error', {
      message: err.message
    });
  }
});

autoUpdater.on('download-progress', (progressObj) => {
  const percent = Math.round(progressObj.percent);
  console.log(`⬇️  Download: ${percent}%`);
  if (mainWindow) {
    mainWindow.webContents.send('update-download-progress', {
      percent: percent,
      transferred: progressObj.transferred,
      total: progressObj.total
    });
  }
});

autoUpdater.on('update-downloaded', (info) => {
  console.log('✅ Atualização baixada com sucesso');
  if (mainWindow) {
    mainWindow.webContents.send('update-downloaded', {
      version: info.version
    });
  }
});

// IPC handlers para controle de atualização
ipcMain.on('update-check', () => {
  checkForUpdates();
});

ipcMain.on('update-download', () => {
  if (!isDev) {
    console.log('⬇️  Iniciando download da atualização...');
    autoUpdater.downloadUpdate().catch(err => {
      console.error('❌ Erro ao baixar atualização:', err.message);
      if (mainWindow) {
        mainWindow.webContents.send('update-error', {
          message: 'Erro ao baixar atualização: ' + err.message
        });
      }
    });
  }
});

ipcMain.on('update-install', () => {
  if (!isDev) {
    console.log('🔄 Instalando atualização...');
    autoUpdater.quitAndInstall(false, true);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (serverProcess) {
      serverProcess.kill();
    }
    app.quit();
  }
});

app.on('before-quit', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Erro não capturado:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promise rejeitada não tratada:', reason);
});
