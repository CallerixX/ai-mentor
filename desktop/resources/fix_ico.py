"""
Создание ICO через прямой запись байтов
"""
from PIL import Image
import struct
import os

resources_dir = os.path.dirname(os.path.abspath(__file__))
png_path = os.path.join(resources_dir, 'icon.png')
ico_path = os.path.join(resources_dir, 'icon.ico')

img = Image.open(png_path)

sizes = [16, 32, 48, 256]
images = []
for s in sizes:
    resized = img.resize((s, s), Image.LANCZOS)
    # Сохраняем в PNG в памяти
    import io
    buf = io.BytesIO()
    resized.save(buf, format='PNG')
    images.append((s, buf.getvalue()))

# Создаём ICO файл
with open(ico_path, 'wb') as f:
    # ICONDIR
    f.write(struct.pack('<HHH', 0, 1, len(images)))  # Reserved=0, Type=1 (ICO), Count
    
    # ICONDIRENTRY для каждого изображения
    offset = 6 + 16 * len(images)
    for s, png_data in images:
        width = s if s < 256 else 0  # 0 means 256
        height = s if s < 256 else 0
        f.write(struct.pack('<BBBBHHII', 
            width,      # Width
            height,     # Height
            0,          # ColorCount
            0,          # Reserved
            1,          # ColorPlanes
            32,         # BitCount
            len(png_data),  # SizeInBytes
            offset      # FileOffset
        ))
        offset += len(png_data)
    
    # Записываем PNG данные
    for s, png_data in images:
        f.write(png_data)

print(f"ICO создан: {ico_path}")
print(f"Размеры: {sizes}")
print("Готово!")
