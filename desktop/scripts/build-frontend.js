const path = require('path');
const { execSync } = require('child_process');
const fs = require('fs');

const FRONTEND_DIR = path.join(__dirname, '..', '..', 'frontend');
const DIST_DIR = path.join(__dirname, '..', 'frontend-dist');

function copyDirSync(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function removeDirSync(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

async function buildFrontend() {
  console.log('🔨 Собираем фронтенд...');
  
  // Устанавливаем зависимости фронтенда если нужно
  if (!fs.existsSync(path.join(FRONTEND_DIR, 'node_modules'))) {
    console.log('📦 Устанавливаем зависимости фронтенда...');
    execSync('npm install', {
      cwd: FRONTEND_DIR,
      stdio: 'inherit',
    });
  }

  // Собираем фронтенд
  execSync('npm run build', {
    cwd: FRONTEND_DIR,
    stdio: 'inherit',
  });

  console.log('📦 Копируем сборку в desktop/frontend-dist...');
  
  // Очищаем старую директорию
  removeDirSync(DIST_DIR);

  // Копируем сборку
  copyDirSync(path.join(FRONTEND_DIR, 'dist'), DIST_DIR);
  
  console.log('✅ Фронтенд собран и скопирован!');
}

buildFrontend().catch(console.error);
