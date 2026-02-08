import { api } from '../services/api';

export interface ItemIdentificationResult {
  itemName: string;
}

/**
 * Identifies item in image using backend Gemini proxy
 * @param imageFile - The image file to identify
 * @returns Promise containing item name and original image URL
 */
export const identifyItemWithGemini = async (imageFile: File): Promise<ItemIdentificationResult> => {
  try {
    return await api.identifyItem({ imageFile });
  } catch (error) {
    throw new Error(`Gemini recognition failed: ${error instanceof Error ? error.message : String(error)}`);
  }
};
