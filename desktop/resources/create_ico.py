"""
Генератор ICO файла из PNG
Использует PIL для создания ICO с разными размерами
"""

try:
    from PIL import Image
    import os
    
    print("Создание ICO иконки...")
    
    resources_dir = os.path.dirname(os.path.abspath(__file__))
    png_path = os.path.join(resources_dir, 'icon.png')
    ico_path = os.path.join(resources_dir, 'icon.ico')
    
    if not os.path.exists(png_path):
        print("Ошибка: icon.png не найден. Сначала запустите generate_icons.py")
        exit(1)
    
    img = Image.open(png_path)
    
    # Создаём изображения разных размеров для ICO
    sizes = [16, 32, 48, 256]
    icons = []
    for s in sizes:
        icon = img.resize((s, s), Image.LANCZOS)
        icons.append(icon)
    
    # Сохраняем как ICO
    # ICO формат поддерживает PIL, но нужно использовать правильный метод
    icons[0].save(
        ico_path,
        format='ICO',
        append_images=icons[1:]
    )
    
    print(f"Создан: {ico_path}")
    print("Готово!")
    
except ImportError:
    print("Ошибка: Не найдена библиотека PIL/Pillow")
    print("Установите: pip install Pillow")
except Exception as e:
    print(f"Ошибка: {e}")
    print("\nПопробуйте создать icon.ico вручную:")
    print("1. Откройте https://convertio.co/svg-ico/")
    print("2. Загрузите icon.svg")
    print("3. Скачайте icon.ico в папку resources/")
