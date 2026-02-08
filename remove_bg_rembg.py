from rembg import remove
from PIL import Image
import sys
import io

def remove_background(input_path, output_path):
    try:
        with open(input_path, 'rb') as i:
            input_data = i.read()
            output_data = remove(input_data)
            
        with open(output_path, 'wb') as o:
            o.write(output_data)
            
        print(f"Successfully removed background and saved to {output_path}")
    except Exception as e:
        print(f"Error removing background: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python remove_bg_rembg.py <input_path> <output_path>")
    else:
        remove_background(sys.argv[1], sys.argv[2])
