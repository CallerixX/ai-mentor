import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Определяем, работает ли приложение в Electron
const isElectron = window.electronAPI !== undefined;

// Получаем URL бэкенда из Electron API или используем по умолчанию
async function getBackendUrl() {
  if (isElectron) {
    try {
      const url = await window.electronAPI.getBackendUrl();
      return url;
    } catch (e) {
      console.warn('Не удалось получить URL бэкенда из Electron API, используем default');
    }
  }
  // По умолчанию для веб-версии
  return import.meta.env.VITE_API_URL || 'http://localhost:8000';
}

// Инициализируем приложение
getBackendUrl().then((backendUrl) => {
  // Сохраняем URL в global state для использования в приложении
  window.BACKEND_URL = backendUrl;
  
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
})

