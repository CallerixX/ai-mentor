@echo off
echo ========================================
echo   AI Mentor Desktop - Сборка
echo ========================================
echo.

REM Переход в директорию desktop
cd /d "%~dp0"

echo [1/4] Переход в директорию desktop...
echo.

echo [2/4] Установка зависимостей...
call npm install
if %errorlevel% neq 0 (
    echo.
    echo ОШИБКА: Не удалось установить зависимости
    pause
    exit /b 1
)
echo.

echo [3/4] Генерация иконок...
pip install Pillow >nul 2>&1
call npm run icons
echo.

echo [4/4] Сборка установщика Windows...
call npm run build:win
if %errorlevel% neq 0 (
    echo.
    echo ОШИБКА: Не удалось собрать установщик
    pause
    exit /b 1
)
echo.

echo ========================================
echo   Сборка завершена успешно!
echo ========================================
echo.
echo Установщик находится в: dist\
echo.
pause
