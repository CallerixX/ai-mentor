; NSIS installer custom script
!include "MUI2.nsh"

; Custom welcome page
!define MUI_WELCOMEPAGE_TITLE "Добро пожаловать в AI Mentor!"
!define MUI_WELCOMEPAGE_TEXT "AI Mentor — ваш локальный AI-наставник по программированию.$\n$\nПриложение работает полностью локально с использованием нейросети Qwen 2.5 Coder.$\n$\nНажмите 'Далее' для продолжения установки."

; Custom finish page
!define MUI_FINISHPAGE_TITLE "Установка завершена!"
!define MUI_FINISHPAGE_TEXT "AI Mentor успешно установлен!$\n$\nПри запуске будет выполнена первая настройка:$\n- Проверка Ollama$\n- Загрузка AI модели (~4 ГБ)$\n$\nУбедитесь, что у вас установлен Ollama с сайта https://ollama.com$\n$\nНажмите 'Завершить' для выхода из мастера установки."
