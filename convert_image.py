from PIL import Image
import os

try:
    img = Image.open('frontend/public/hero-image.jpg')
    img.save('frontend/public/hero-image.webp', 'WEBP', quality=80)
    print("Conversion successful: frontend/public/hero-image.webp created")
except Exception as e:
    print(f"Error: {e}")
