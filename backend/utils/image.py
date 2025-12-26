"""
Image processing utilities for HealthCare Jobs API.
"""
import base64
import logging
from io import BytesIO
from PIL import Image


def compress_base64_image(base64_string: str, max_width: int = 400, quality: int = 60) -> str:
    """
    Compress a base64 image to create a smaller thumbnail.
    Reduces image dimensions and quality for faster loading in listings.
    """
    try:
        if not base64_string or not base64_string.startswith('data:image'):
            return base64_string
        
        header, data = base64_string.split(',', 1)
        mime_type = header.split(':')[1].split(';')[0]
        
        image_data = base64.b64decode(data)
        image = Image.open(BytesIO(image_data))
        
        if image.mode in ('RGBA', 'P'):
            image = image.convert('RGB')
        
        width, height = image.size
        if width > max_width:
            ratio = max_width / width
            new_height = int(height * ratio)
            image = image.resize((max_width, new_height), Image.Resampling.LANCZOS)
        
        buffer = BytesIO()
        image.save(buffer, format='JPEG', quality=quality, optimize=True)
        buffer.seek(0)
        
        compressed_data = base64.b64encode(buffer.getvalue()).decode('utf-8')
        return f"data:image/jpeg;base64,{compressed_data}"
    
    except Exception as e:
        logging.error(f"Failed to compress image: {e}")
        return base64_string


def sanitize_filename(filename: str) -> str:
    """Remove/replace characters that cause issues in URLs"""
    name_parts = filename.rsplit('.', 1)
    if len(name_parts) == 2:
        name, ext = name_parts
    else:
        name = filename
        ext = ''
    
    name = name.replace(' ', '_')
    name = ''.join(c for c in name if c.isalnum() or c in ('_', '-'))
    
    return f"{name}.{ext}" if ext else name
