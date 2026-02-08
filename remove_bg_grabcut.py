import cv2
import numpy as np
import sys

def remove_bg_grabcut(input_path, output_path):
    try:
        # Load image
        img = cv2.imread(input_path)
        if img is None:
            print(f"Could not load image: {input_path}")
            return

        # Create a mask
        mask = np.zeros(img.shape[:2], np.uint8)

        # Define the rectangle for GrabCut
        # We assume the object is in the center. 
        # We'll leave a 10% margin on all sides.
        h, w = img.shape[:2]
        margin_x = int(w * 0.1)
        margin_y = int(h * 0.1)
        rect = (margin_x, margin_y, w - 2 * margin_x, h - 2 * margin_y)

        # Allocate memory for background and foreground models
        bgdModel = np.zeros((1, 65), np.float64)
        fgdModel = np.zeros((1, 65), np.float64)

        # Run GrabCut
        cv2.grabCut(img, mask, rect, bgdModel, fgdModel, 5, cv2.GC_INIT_WITH_RECT)

        # Modify mask: 0 and 2 are background, 1 and 3 are foreground
        mask2 = np.where((mask == 2) | (mask == 0), 0, 1).astype('uint8')

        # Multiply image with mask to get foreground
        img = img * mask2[:, :, np.newaxis]

        # Create RGBA image
        # Split channels
        b, g, r = cv2.split(img)
        
        # Create alpha channel from mask
        alpha = mask2 * 255
        
        # Merge
        rgba = cv2.merge([b, g, r, alpha])

        # Save
        cv2.imwrite(output_path, rgba)
        print(f"Saved GrabCut result to {output_path}")

    except Exception as e:
        print(f"Error in GrabCut: {e}")

if __name__ == "__main__":
    remove_bg_grabcut(sys.argv[1], sys.argv[2])
