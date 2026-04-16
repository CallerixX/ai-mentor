const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// addLog будет инициализирован снаружи через setter
let _addLog = null;

module.exports.setLogger = (fn) => { _addLog = fn; };

function log(level, msg) {
  if (_addLog) _addLog('BACKEND', level, msg);
  else console.log(`[BACKEND][${level}] ${msg}`);
}

class BackendStarter {
  constructor(backendPath) {
    this.backendPath = backendPath;
    this.process = null;
    this.port = 8000;
    this.url = `http://localhost:${this.port}`;
    this.isRunning = false;
  }

  // Запускаем FastAPI бэкенд
  async start() {
    if (this.isRunning) {
      console.log('Бэкенд уже запущен');
      return;
    }

    // Найдем свободный порт
    const net = require('net');
    const getFreePort = () => new Promise((resolve) => {
      const srv = net.createServer();
      srv.listen(0, () => {
        const port = srv.address().port;
        srv.close(() => resolve(port));
      });
    });

    this.port = await getFreePort();
    this.url = `http://127.0.0.1:${this.port}`;
    console.log(`Назначен динамический порт бэкенда: ${this.port}`);

    // Проверяем, существует ли main.py
    const mainPy = path.join(this.backendPath, 'main.py');
    if (!fs.existsSync(mainPy)) {
      throw new Error(`Файл main.py не найден: ${mainPy}`);
    }

    // Проверяем, установлен ли Python
    try {
      const { execSync } = require('child_process');
      execSync('python --version', { stdio: 'ignore' });
    } catch (error) {
      throw new Error('Python не найден. Установите Python 3.11+');
    }

    console.log('Запускаем FastAPI бэкенд...');
    console.log(`Путь к бэкенду: ${this.backendPath}`);

    // Устанавливаем зависимости, если нужно
    await this.installDependencies();

    // Запускаем FastAPI сервер
    this.process = spawn('python', ['main.py'], {
      cwd: this.backendPath,
      env: {
        ...process.env,
        OLLAMA_HOST: 'http://127.0.0.1:11434',
        MODEL_NAME: 'qwen2.5-coder:7b',
        DB_PATH: path.join(this.backendPath, 'data', 'mentor.db'),
        PORT_BACKEND: this.port.toString(),
      },
      shell: true,
    });

    this.process.stdout.on('data', (data) => {
      const msg = data.toString().trim();
      log('INFO', msg);
    });

    this.process.stderr.on('data', (data) => {
      const msg = data.toString().trim();
      log('ERROR', msg);
    });

    this.process.on('error', (error) => {
      log('ERROR', `Ошибка запуска бэкенда: ${error.message}`);
      this.isRunning = false;
    });

    this.process.on('exit', (code) => {
      log('INFO', `Бэкенд завершился с кодом: ${code}`);
      this.isRunning = false;
    });

    // Ждём готовности бэкенда
    await this.waitForBackendReady();
    
    this.isRunning = true;
    console.log('Бэкенд запущен успешно!');
  }

  // Устанавливаем Python зависимости
  async installDependencies() {
    const requirementsPath = path.join(this.backendPath, 'requirements.txt');
    
    if (!fs.existsSync(requirementsPath)) {
      console.warn('requirements.txt не найден, пропускаем установку зависимостей');
      return;
    }

    console.log('Проверяем Python зависимости...');

    return new Promise((resolve, reject) => {
      const pipProcess = spawn('pip', ['install', '-r', requirementsPath, '--quiet'], {
        cwd: this.backendPath,
        shell: true,
      });

      pipProcess.stdout.on('data', (data) => {
        console.log(`[Pip] ${data.toString().trim()}`);
      });

      pipProcess.stderr.on('data', (data) => {
        // Показываем только ошибки
        console.error(`[Pip] ${data.toString().trim()}`);
      });

      pipProcess.on('close', (code) => {
        if (code === 0) {
          console.log('Зависимости установлены');
          resolve();
        } else {
          console.warn('pip install завершился с кодом', code);
          resolve(); // Не блокируем, продолжаем
        }
      });

      pipProcess.on('error', (error) => {
        console.error('Ошибка pip install:', error);
        resolve(); // Не блокируем
      });
    });
  }

  // Ждём готовности бэкенда
  async waitForBackendReady(maxAttempts = 30, delay = 1000) {
    console.log('Ожидаем готовности бэкенда...');
    
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await fetch(`http://127.0.0.1:${this.port}/api/health`);
        if (response.ok) {
          console.log('Бэкенд готов!');
          return true;
        }
      } catch (e) {
        // Бэкенд ещё не готов
      }
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    console.warn('Бэкенд не ответил за отведённое время, но продолжаем работу');
    return false;
  }

  // Останавливаем бэкенд
  async stop() {
    if (!this.isRunning || !this.process) {
      return;
    }

    console.log('Останавливаем бэкенд...');
    
    if (process.platform === 'win32') {
      this.process.kill();
    } else {
      this.process.kill('SIGTERM');
    }
    
    this.process = null;
    this.isRunning = false;
  }

  // Получить URL бэкенда
  getUrl() {
    return this.url || `http://127.0.0.1:${this.port}`;
  }
}

module.exports = BackendStarter;
