const { contextBridge, ipcRenderer } = require('electron');

// Безопасный API для взаимодействия с рендерером
contextBridge.exposeInMainWorld('electronAPI', {
  // Проверка Ollama
  checkOllama: () => ipcRenderer.invoke('check-ollama'),
  
  // Загрузка модели
  pullModel: () => ipcRenderer.invoke('pull-model', 'qwen2.5-coder:7b'),
  
  // Сигнал о завершении настройки
  setupComplete: () => ipcRenderer.send('setup-complete'),
  
  // Получение URL бэкенда
  getBackendUrl: () => ipcRenderer.invoke('get-backend-url'),
  
  // Проверка статуса настройки
  isSetupComplete: () => ipcRenderer.invoke('is-setup-complete'),
  
  // Показ уведомления
  showNotification: (title, body) => ipcRenderer.invoke('show-notification', title, body),

  // Получение апплогов приложения для баг-репортов
  getLogs: () => ipcRenderer.invoke('get-logs'),

  // Получение системной информации (для баг-репортов)
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),

  // Слушатели событий
  onModelPullProgress: (callback) => {
    ipcRenderer.on('model-pull-progress', (event, data) => callback(event, data));
  },

  onUpdateAvailable: (callback) => {
    ipcRenderer.on('update-available', (event, data) => callback(event, data));
  },

  onUpdateNotAvailable: (callback) => {
    ipcRenderer.on('update-not-available', (event, data) => callback(event, data));
  },

  onUpdateDownloadProgress: (callback) => {
    ipcRenderer.on('update-download-progress', (event, data) => callback(event, data));
  },

  onUpdateDownloaded: (callback) => {
    ipcRenderer.on('update-downloaded', (event, data) => callback(event, data));
  },
});
