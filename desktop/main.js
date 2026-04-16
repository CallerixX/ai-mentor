const { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain, dialog } = require('electron');
const path = require('path');
const os = require('os');
const { autoUpdater } = require('electron-updater');
const OllamaManager = require('./ollama-manager');
const BackendStarter = require('./backend-starter');

// ───────────── Глобальный буфер логов ─────────────
const MAX_LOGS = 500;
const appLogs = [];

function addLog(source, level, message) {
  const timestamp = new Date().toISOString();
  const entry = `[${timestamp}] [${source}] [${level}] ${message}`;
  appLogs.push(entry);
  if (appLogs.length > MAX_LOGS) appLogs.shift();
  // Дублируем в консоль тоже
  if (level === 'ERROR') {
    console.error(entry);
  } else {
    console.log(entry);
  }
}
// ──────────────────────────────────────────────────

// Глобальные переменные
let mainWindow = null;
let tray = null;
let ollamaManager = null;
let backendStarter = null;
let isQuitting = false;
let isSetupComplete = false;

// Путь к ресурсам приложения
const RESOURCES_PATH = app.isPackaged
  ? path.join(process.resourcesPath, 'resources')
  : path.join(__dirname, 'resources');

const BACKEND_PATH = app.isPackaged
  ? path.join(process.resourcesPath, 'backend')
  : path.join(__dirname, '..', 'backend');

const FRONTEND_PATH = app.isPackaged
  ? path.join(__dirname, 'frontend-dist')
  : path.join(__dirname, '..', 'frontend');

// Проверяем, запущено ли приложение в режиме разработки
const isDev = process.argv.includes('--dev');

// Создаём главное окно приложения
function createMainWindow() {
  // Убираем стандартное меню Electron (File, Edit, View, Window, Help)
  Menu.setApplicationMenu(null);

  mainWindow = new BrowserWindow({
    width: 1600,
    height: 1000,
    minWidth: 1100,
    minHeight: 750,
    title: 'AI Mentor',
    icon: path.join(RESOURCES_PATH, 'icon.png'),
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Загружаем фронтенд
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(FRONTEND_PATH, 'index.html'));
  }

  // Показываем окно после загрузки (максимизируем для отображения всего контента)
  mainWindow.once('ready-to-show', () => {
    mainWindow.maximize();
    mainWindow.show();
  });

  // Обработчик закрытия окна
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
      
      // Показываем уведомление
      if (process.platform === 'win32') {
        mainWindow.flashFrame(true);
      }
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Создаём системный трей
function createTray() {
  try {
    // Ищем иконку в нескольких местах (packaged и dev)
    const fs = require('fs');
    let iconPath = path.join(RESOURCES_PATH, 'icon.png');
    
    // Если иконки нет в resources, пробуем использовать ico
    if (!fs.existsSync(iconPath)) {
      iconPath = path.join(RESOURCES_PATH, 'icon.ico');
    }
    // Пробуем в директории приложения
    if (!fs.existsSync(iconPath)) {
      iconPath = path.join(__dirname, 'resources', 'icon.png');
    }
    if (!fs.existsSync(iconPath)) {
      iconPath = path.join(__dirname, 'resources', 'icon.ico');
    }

    let trayIcon;
    if (fs.existsSync(iconPath)) {
      trayIcon = nativeImage.createFromPath(iconPath);
    } else {
      // Создаём минимальную иконку если файл не найден
      console.warn('Иконка для трея не найдена, используем стандартную');
      trayIcon = nativeImage.createEmpty();
    }
    
    tray = new Tray(trayIcon.resize({ width: 16, height: 16 }));

    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Открыть AI Mentor',
        click: () => {
          if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
          }
        },
      },
      {
        label: 'Перезапустить',
        click: () => {
          app.relaunch();
          app.quit();
        },
      },
      { type: 'separator' },
      {
        label: 'Проверить обновления',
        click: () => {
          checkForUpdates();
        },
      },
      { type: 'separator' },
      {
        label: 'Выход',
        click: () => {
          isQuitting = true;
          cleanup();
          app.quit();
        },
      },
    ]);

    tray.setToolTip('AI Mentor — Ваш локальный AI-наставник');
    tray.setContextMenu(contextMenu);

    // Клик по трею открывает окно
    tray.on('click', () => {
      if (mainWindow) {
        if (mainWindow.isVisible()) {
          mainWindow.hide();
        } else {
          mainWindow.show();
          mainWindow.focus();
        }
      }
    });
  } catch (error) {
    console.error('Ошибка создания трея:', error);
  }
}

// Очистка ресурсов при закрытии
async function cleanup() {
  console.log('Очистка ресурсов...');
  
  if (backendStarter) {
    await backendStarter.stop();
  }
  
  if (ollamaManager) {
    await ollamaManager.cleanup();
  }
}

// Проверка обновлений
function checkForUpdates() {
  if (!isDev) {
    autoUpdater.checkForUpdatesAndNotify();
  }
}

// Настройка автообновлений
function setupAutoUpdater() {
  if (isDev) {
    console.log('Автообновления отключены в режиме разработки');
    return;
  }

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('checking-for-update', () => {
    console.log('Проверка обновлений...');
  });

  autoUpdater.on('update-available', (info) => {
    console.log('Доступно обновление:', info.version);
    if (mainWindow) {
      mainWindow.webContents.send('update-available', info);
    }
  });

  autoUpdater.on('update-not-available', (info) => {
    console.log('Обновлений не найдено');
    if (mainWindow) {
      mainWindow.webContents.send('update-not-available', info);
    }
  });

  autoUpdater.on('download-progress', (progressObj) => {
    const percent = Math.round(progressObj.percent);
    console.log(`Загрузка обновления: ${percent}%`);
    if (mainWindow) {
      mainWindow.webContents.send('update-download-progress', percent);
    }
  });

  autoUpdater.on('update-downloaded', (info) => {
    console.log('Обновление загружено');
    
    if (mainWindow) {
      mainWindow.webContents.send('update-downloaded', info);
      
      // Показываем диалог о доступности обновления
      dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: 'Доступно обновление',
        message: 'Новая версия AI Mentor загружена!',
        detail: 'Перезапустить приложение для установки обновления?',
        buttons: ['Перезапустить', 'Позже'],
        defaultId: 0,
      }).then((result) => {
        if (result.response === 0) {
          isQuitting = true;
          autoUpdater.quitAndInstall();
        }
      });
    }
  });

  autoUpdater.on('error', (error) => {
    console.error('Ошибка обновления:', error);
  });

  // Проверяем обновления каждые 6 часов
  setInterval(() => {
    autoUpdater.checkForUpdates();
  }, 6 * 60 * 60 * 1000);
}

// Инициализация приложения
async function initializeApp() {
  console.log('Инициализация AI Mentor...');

  // Изолируем загрузку моделей в папку данных приложения
  const fs = require('fs');
  const ollamaModelsPath = path.join(app.getPath('userData'), 'ollama_models');
  if (!fs.existsSync(ollamaModelsPath)) {
    fs.mkdirSync(ollamaModelsPath, { recursive: true });
  }
  process.env.OLLAMA_MODELS = ollamaModelsPath;

  // Инициализируем менеджеры
  ollamaManager = new OllamaManager();
  backendStarter = new BackendStarter(BACKEND_PATH);
  // Подключаем глобальный логгер к стартеру бэкенда
  const BackendStarterModule = require('./backend-starter');
  if (BackendStarterModule.setLogger) BackendStarterModule.setLogger(addLog);
  addLog('ELECTRON', 'INFO', 'Приложение запущено, логирование активно');

  // Убеждаемся что Ollama запущен (ждем максимум 3 секунды, чтобы не блокировать UI)
  try {
    await Promise.race([
      ollamaManager.startOllama(),
      new Promise(resolve => setTimeout(resolve, 3000))
    ]);
  } catch (error) {
    console.error('Ошибка запуска Ollama:', error);
  }

  // Проверяем, настроена ли модель
  isSetupComplete = await ollamaManager.isModelReady();

  // Если модель не готова, показываем окно настройки
  if (!isSetupComplete) {
    console.log('Модель не найдена, показываем окно настройки');
    createSetupWindow();
  } else {
    console.log('Модель готова, запускаем главное окно');
    createMainWindow();
  }

  // Запускаем бэкенд асинхронно
  backendStarter.start().then(() => {
    console.log('Бэкенд запущен успешно');
  }).catch((error) => {
    console.error('Ошибка запуска бэкенда:', error);
  });

  // Создаём трей
  createTray();

  // Настраиваем автообновления
  setupAutoUpdater();

  // Проверяем обновления при старте
  setTimeout(() => {
    checkForUpdates();
  }, 10000);
}

// Окно первой настройки
function createSetupWindow() {
  const setupWindow = new BrowserWindow({
    width: 600,
    height: 700,
    resizable: false,
    modal: true,
    icon: path.join(RESOURCES_PATH, 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Загружаем HTML страницу настройки
  const setupHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #fff;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          padding: 20px;
        }
        .container {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 40px;
          max-width: 500px;
          width: 100%;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        h1 {
          font-size: 28px;
          margin-bottom: 10px;
          text-align: center;
        }
        .subtitle {
          font-size: 14px;
          text-align: center;
          opacity: 0.9;
          margin-bottom: 30px;
        }
        .step {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
        }
        .step-title {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .step-number {
          background: #fff;
          color: #764ba2;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }
        .step-description {
          font-size: 14px;
          opacity: 0.9;
          line-height: 1.6;
        }
        .btn {
          background: #fff;
          color: #764ba2;
          border: none;
          padding: 15px 30px;
          border-radius: 10px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          width: 100%;
          margin-top: 20px;
          transition: all 0.3s;
        }
        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        }
        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }
        .progress-bar {
          width: 100%;
          height: 8px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          overflow: hidden;
          margin-top: 10px;
        }
        .progress-fill {
          height: 100%;
          background: #fff;
          width: 0%;
          transition: width 0.3s;
        }
        .status {
          font-size: 12px;
          margin-top: 10px;
          opacity: 0.8;
          text-align: center;
        }
        .hidden { display: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🚀 Добро пожаловать в AI Mentor!</h1>
        <p class="subtitle">Давайте настроим ваше приложение</p>

        <div class="step">
          <div class="step-title">
            <div class="step-number">1</div>
            <span>Проверка Ollama</span>
          </div>
          <p class="step-description" id="ollama-check">
            Проверяем наличие Ollama...
          </p>
        </div>

        <div class="step">
          <div class="step-title">
            <div class="step-number">2</div>
            <span>Загрузка модели AI</span>
          </div>
          <p class="step-description">
            Загружаем qwen2.5-coder:7b (~4 ГБ). Это может занять несколько минут.
          </p>
          <div class="progress-bar hidden" id="download-progress-bar">
            <div class="progress-fill" id="download-progress"></div>
          </div>
          <p class="status hidden" id="download-status"></p>
        </div>

        <div class="step">
          <div class="step-title">
            <div class="step-number">3</div>
            <span>Готово!</span>
          </div>
          <p class="step-description" id="finish-text" class="hidden">
            После завершения настройки AI Mentor будет готов к работе.
          </p>
        </div>

        <button class="btn" id="start-btn" disabled>Начать настройку</button>
      </div>

      <script>
        const startBtn = document.getElementById('start-btn');
        const ollamaCheck = document.getElementById('ollama-check');
        const downloadProgressBar = document.getElementById('download-progress-bar');
        const downloadProgress = document.getElementById('download-progress');
        const downloadStatus = document.getElementById('download-status');
        const finishText = document.getElementById('finish-text');

        startBtn.addEventListener('click', async () => {
          startBtn.disabled = true;
          startBtn.textContent = 'Настройка...';

          // Проверяем Ollama
          ollamaCheck.textContent = 'Проверяем Ollama...';
          const ollamaCheckResult = await window.electronAPI.checkOllama();
          
          if (!ollamaCheckResult.installed) {
            ollamaCheck.innerHTML = '⚠️ Ollama не установлен. Пожалуйста, установите Ollama с сайта <a href="https://ollama.com" target="_blank" style="color: #fff; text-decoration: underline;">ollama.com</a>';
            startBtn.disabled = false;
            startBtn.textContent = 'Повторить проверку';
            startBtn.onclick = () => location.reload();
            return;
          }

          ollamaCheck.textContent = '✓ Ollama найден!';

          // Загружаем модель
          downloadProgressBar.classList.remove('hidden');
          downloadStatus.classList.remove('hidden');
          downloadStatus.textContent = 'Начинаем загрузку модели...';

          try {
            window.electronAPI.onModelPullProgress((event, data) => {
              if (data.status === 'progress') {
                const percent = data.percent || 0;
                downloadProgress.style.width = percent + '%';
                downloadStatus.textContent = data.message || 'Загрузка... ' + percent + '%';
              } else if (data.status === 'complete') {
                downloadProgress.style.width = '100%';
                downloadStatus.textContent = '✓ Модель загружена!';
                finishText.classList.remove('hidden');
                finishText.textContent = '✓ Настройка завершена! Запускаем AI Mentor...';
                
                setTimeout(() => {
                  window.electronAPI.setupComplete();
                }, 2000);
              } else if (data.status === 'error') {
                downloadStatus.textContent = '❌ Ошибка: ' + data.message;
                startBtn.disabled = false;
                startBtn.textContent = 'Повторить попытку';
                startBtn.onclick = () => location.reload();
              }
            });

            const result = await window.electronAPI.pullModel();
            if (result && !result.success) {
              downloadStatus.textContent = '❌ Ошибка: ' + result.error;
              startBtn.disabled = false;
              startBtn.textContent = 'Повторить попытку';
              startBtn.onclick = () => location.reload();
            }
          } catch (error) {
            downloadStatus.textContent = '❌ Ошибка: ' + error.message;
            startBtn.disabled = false;
            startBtn.textContent = 'Повторить попытку';
            startBtn.onclick = () => location.reload();
          }
        });

        // Автоматически запускаем настройку
        setTimeout(() => {
          startBtn.disabled = false;
          startBtn.textContent = 'Начать настройку';
        }, 500);
      </script>
    </body>
    </html>
  `;

  setupWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(setupHTML));

  setupWindow.on('closed', () => {
    // Если настройка завершена, создаём главное окно
    if (isSetupComplete) {
      createMainWindow();
    }
  });
}

// IPC обработчики
ipcMain.handle('check-ollama', async () => {
  return await ollamaManager.checkOllama();
});

ipcMain.handle('pull-model', async (event, modelName) => {
  try {
    await ollamaManager.pullModel(modelName, (progress) => {
      event.sender.send('model-pull-progress', progress);
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.on('setup-complete', () => {
  isSetupComplete = true;
  ollamaManager.setModelReady(true);
  
  // Закрываем окно настройки и создаём главное
  if (BrowserWindow.getAllWindows().length > 0) {
    const setupWindow = BrowserWindow.getAllWindows()[0];
    setupWindow.close();
  }
  
  createMainWindow();
});

ipcMain.handle('get-backend-url', () => {
  return backendStarter ? backendStarter.getUrl() : 'http://localhost:8000';
});

ipcMain.handle('is-setup-complete', () => {
  return isSetupComplete;
});

// Передаём накопленные логи в рендерер при отправке баг-репорта
ipcMain.handle('get-logs', () => {
  return appLogs.join('\n');
});

// Передаём системную информацию (RAM, платформа) для баг-репортов
ipcMain.handle('get-system-info', () => {
  const totalRAM = Math.round(os.totalmem() / 1024 / 1024 / 1024 * 10) / 10;
  const freeRAM  = Math.round(os.freemem()  / 1024 / 1024 / 1024 * 10) / 10;
  return {
    platform: `${os.platform()} ${os.release()}`,
    arch: os.arch(),
    totalRAM: `${totalRAM} GB`,
    freeRAM:  `${freeRAM} GB`,
    cpuModel: os.cpus()[0]?.model || 'unknown',
    appVersion: app.getVersion(),
  };
});

// Обработчики событий приложения
app.whenReady().then(async () => {
  await initializeApp();
});

app.on('window-all-closed', (e) => {
  // Не закрываем приложение на Windows, а сворачиваем в трей
  if (process.platform !== 'darwin') {
    e.preventDefault();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    if (isSetupComplete) {
      createMainWindow();
    } else {
      createSetupWindow();
    }
  }
});

app.on('before-quit', async () => {
  isQuitting = true;
  await cleanup();
});

// Обработка уведомлений
ipcMain.handle('show-notification', async (event, title, body) => {
  if (mainWindow) {
    mainWindow.webContents.send('show-notification', { title, body });
  }
});
