"""
Генератор иконок для AI Mentor Desktop
Создаёт PNG и ICO файлы из SVG
"""

try:
    from PIL import Image, ImageDraw, ImageFont
    import math
    import os
    
    print("🎨 Генерация иконок для AI Mentor...")
    
    # Создаём PNG иконку 512x512
    size = 512
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Рисуем фон с градиентом (имитация)
    # Фиолетовый фон
    for y in range(size):
        r = int(102 + (118 - 102) * y / size)
        g = int(126 + (75 - 126) * y / size)
        b = int(234 + (162 - 234) * y / size)
        draw.line([(0, y), (size, y)], fill=(r, g, b))
    
    # Рисуем скруглённые углы (простая имитация)
    corner_radius = 100
    for i in range(corner_radius):
        alpha = int(255 * (1 - math.sqrt((corner_radius - i) ** 2 / (corner_radius ** 2))))
        # Верхний левый
        draw.arc([0, 0, corner_radius*2, corner_radius*2], 180, 270, fill=(0, 0, 0, alpha))
        # Верхний правый
        draw.arc([size-corner_radius*2, 0, size, corner_radius*2], 270, 360, fill=(0, 0, 0, alpha))
        # Нижний левый
        draw.arc([0, size-corner_radius*2, corner_radius*2, size], 90, 180, fill=(0, 0, 0, alpha))
        # Нижний правый
        draw.arc([size-corner_radius*2, size-corner_radius*2, size, size], 0, 90, fill=(0, 0, 0, alpha))
    
    # Центральная точка
    center = size // 2
    draw.ellipse([center-20, center-20, center+20, center+20], fill='white')
    
    # Синапсы (точки)
    points = [
        (center-60, center-60),
        (center+60, center-60),
        (center-60, center+60),
        (center+60, center+60),
    ]
    
    for px, py in points:
        draw.ellipse([px-15, py-15, px+15, py+15], fill='white')
    
    # Соединения (линии)
    connections = [
        (center, center, center-60, center-60),
        (center, center, center+60, center-60),
        (center, center, center-60, center+60),
        (center, center, center+60, center+60),
        (center-60, center-60, center+60, center-60),
        (center-60, center+60, center+60, center+60),
    ]
    
    for x1, y1, x2, y2 in connections:
        draw.line([(x1, y1), (x2, y2)], fill='white', width=6)
    
    # Сохраняем PNG
    resources_dir = os.path.dirname(os.path.abspath(__file__))
    png_path = os.path.join(resources_dir, 'icon.png')
    img.save(png_path, 'PNG')
    print(f"✅ Создан: {png_path}")
    
    # Создаём ICO (16x16, 32x32, 48x48, 256x256)
    sizes = [16, 32, 48, 256]
    icons = []
    for s in sizes:
        icon = img.resize((s, s), Image.LANCZOS)
        icons.append(icon)
    
    ico_path = os.path.join(resources_dir, 'icon.ico')
    icons[0].save(ico_path, save_all=True, append_images=icons[1:])
    print(f"✅ Создан: {ico_path}")
    
    print("\n✅ Все иконки сгенерированы!")
    
except ImportError:
    print("❌ Ошибка: Не найдена библиотека PIL/Pillow")
    print("\nУстановите зависимости:")
    print("  pip install Pillow")
    print("\nЗатем запустите снова:")
    print("  python generate_icons.py")
