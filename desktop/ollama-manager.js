const { exec, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const util = require('util');

const execPromise = util.promisify(exec);

class OllamaManager {
  constructor() {
    this.modelName = 'qwen2.5-coder:7b';
    this.ollamaProcess = null;
    this.isModelReadyFlag = false;
    this.ollamaPath = null;
  }

  // Проверяем, установлен ли Ollama
  async checkOllama() {
    try {
      // Проверяем системный Ollama
      await execPromise('ollama --version');
      
      // Проверяем, запущен ли сервер Ollama
      try {
        const response = await fetch('http://127.0.0.1:11434/api/version');
        if (response.ok) {
          return { installed: true, version: await response.text(), isRunning: true };
        }
      } catch (e) {
        // Ollama не запущен, но установлен
        return { installed: true, isRunning: false };
      }
      
      return { installed: true, isRunning: false };
    } catch (error) {
      // Ollama не установлен
      return { installed: false, error: error.message };
    }
  }

  // Проверяем, загружена ли модель
  async isModelReady() {
    try {
      const result = await execPromise(`ollama list`);
      return result.stdout.includes(this.modelName);
    } catch (error) {
      return false;
    }
  }

  // Загружаем модель
  async pullModel(modelName, progressCallback) {
    this.modelName = modelName || this.modelName;
    
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch('http://127.0.0.1:11434/api/pull', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: this.modelName, stream: true })
        });
        
        if (!response.ok) {
          throw new Error('Failed to pull model: ' + response.statusText);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let lastPercent = 0;

        while(true) {
          const {done, value} = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, {stream: true});
          const lines = chunk.split('\n').filter(line => line.trim());
          
          for (const line of lines) {
            try {
              const progress = JSON.parse(line);
              if (progress.total && progress.completed) {
                const percent = Math.round((progress.completed / progress.total) * 100);
                if (percent !== lastPercent) {
                  lastPercent = percent;
                  if (progressCallback) {
                    progressCallback({
                      status: 'progress',
                      percent: percent,
                      message: `Загрузка: ${percent}% (${this.formatBytes(progress.completed)} / ${this.formatBytes(progress.total)})`
                    });
                  }
                }
              } else if (progress.status) {
                if (progressCallback) {
                    progressCallback({
                      status: 'progress',
                      percent: lastPercent, 
                      message: progress.status
                    });
                }
              }
            } catch (e) {
               // ignore json parse error
            }
          }
        }
        
        if (progressCallback) {
          progressCallback({
            status: 'complete',
            percent: 100,
            message: '✓ Модель успешно загружена!'
          });
        }
        this.isModelReadyFlag = true;
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Запускаем Ollama сервер (если не запущен)
  async startOllama() {
    const ollamaCheck = await this.checkOllama();
    
    if (ollamaCheck.isRunning) {
      console.log('Ollama уже запущен');
      return;
    }

    console.log('Запускаем Ollama сервер...');
    
    this.ollamaProcess = spawn('ollama', ['serve'], {
      env: process.env,
      shell: true,
      detached: process.platform === 'win32',
    });

    this.ollamaProcess.stdout.on('data', (data) => {
      console.log('Ollama:', data.toString());
    });

    this.ollamaProcess.stderr.on('data', (data) => {
      console.error('Ollama error:', data.toString());
    });

    this.ollamaProcess.on('error', (error) => {
      console.error('Ошибка запуска Ollama:', error);
    });

    // Ждём, пока сервер станет доступен
    await this.waitForOllamaReady();
  }

  // Ждём готовности Ollama сервера
  async waitForOllamaReady(maxAttempts = 20, delay = 1000) {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await fetch('http://127.0.0.1:11434/api/version');
        if (response.ok) {
          console.log('Ollama сервер готов!');
          return true;
        }
      } catch (e) {
        // Сервер ещё не готов
      }
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    throw new Error('Ollama сервер не запустился за отведённое время');
  }

  // Останавливаем Ollama процесс
  async cleanup() {
    if (this.ollamaProcess) {
      console.log('Останавливаем Ollama...');
      
      if (process.platform === 'win32') {
        // На Windows просто завершаем процесс
        this.ollamaProcess.kill();
      } else {
        // На Unix отправляем SIGTERM
        this.ollamaProcess.kill('SIGTERM');
      }
      
      this.ollamaProcess = null;
    }
  }

  // Устанавливаем флаг готовности модели
  setModelReady(ready) {
    this.isModelReadyFlag = ready;
  }

  // Форматируем байты в человекочитаемый вид
  formatBytes(bytes) {
    if (bytes === 0) return '0 Б';
    
    const k = 1024;
    const sizes = ['Б', 'КБ', 'МБ', 'ГБ'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}

module.exports = OllamaManager;
