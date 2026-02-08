from PIL import Image
import sys

def remove_magenta_bg(input_path, output_path):
    img = Image.open(input_path)
    img = img.convert("RGBA")
    datas = img.getdata()

    newData = []
    for item in datas:
        # Magenta is roughly (255, 0, 255)
        # We give a small tolerance
        if item[0] > 200 and item[1] < 50 and item[2] > 200:
            newData.append((255, 255, 255, 0)) # Transparent
        else:
            newData.append(item)

    img.putdata(newData)
    img.save(output_path, "PNG")
    print(f"Saved transparent image to {output_path}")

if __name__ == "__main__":
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    remove_magenta_bg(input_file, output_file)
