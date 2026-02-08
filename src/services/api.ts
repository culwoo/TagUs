import apiClient from './apiClient';
import {
  identifyResponseSchema,
  removeBackgroundResponseSchema,
  type IdentifyResponse,
  type RemoveBackgroundResponse,
} from '../../shared/apiSchemas';

export interface ItemIdentificationRequest {
  imageFile: File;
}

export interface ItemIdentificationResponse {
  itemName: string;
}

export interface BackgroundRemovalRequest {
  imageFile: File;
  itemName?: string;
  method?: 'rembg' | 'grabcut' | 'ai';
}

export interface BackgroundRemovalResponse {
  processedImageBase64: string;
  contentType: string;
}

const MAX_API_BASE64_LENGTH = 3_500_000;
const MIN_COMPRESSION_QUALITY = 0.45;
const MIN_IMAGE_DIMENSION = 720;
const STARTING_QUALITY = 0.85;
const STARTING_MAX_DIMENSION = 1600;
const QUALITY_DECREMENT = 0.12;
const DIMENSION_SCALE = 0.8;

// Helper function to convert Blob/File to base64 payload (without data URL prefix)
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(',')[1] || result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const loadImageFromFile = (file: File): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('이미지를 읽을 수 없습니다.'));
    };

    image.src = objectUrl;
  });

const canvasToBlob = (canvas: HTMLCanvasElement, quality: number): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('이미지 압축에 실패했습니다.'));
          return;
        }
        resolve(blob);
      },
      'image/jpeg',
      quality
    );
  });

const optimizeImageForApi = async (file: File): Promise<{ imageBase64: string; mimeType: string }> => {
  const originalBase64 = await blobToBase64(file);
  if (originalBase64.length <= MAX_API_BASE64_LENGTH) {
    return {
      imageBase64: originalBase64,
      mimeType: file.type || 'image/jpeg',
    };
  }

  const image = await loadImageFromFile(file);
  let maxDimension = STARTING_MAX_DIMENSION;
  let quality = STARTING_QUALITY;
  let fallbackBase64 = originalBase64;

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('이미지 처리 컨텍스트를 생성하지 못했습니다.');
    }

    context.drawImage(image, 0, 0, width, height);
    const compressedBlob = await canvasToBlob(canvas, quality);
    const compressedBase64 = await blobToBase64(compressedBlob);
    fallbackBase64 = compressedBase64;

    if (compressedBase64.length <= MAX_API_BASE64_LENGTH) {
      return {
        imageBase64: compressedBase64,
        mimeType: 'image/jpeg',
      };
    }

    maxDimension = Math.max(MIN_IMAGE_DIMENSION, Math.floor(maxDimension * DIMENSION_SCALE));
    quality = Math.max(MIN_COMPRESSION_QUALITY, quality - QUALITY_DECREMENT);
  }

  if (fallbackBase64.length > MAX_API_BASE64_LENGTH) {
    throw new Error('이미지 용량이 너무 커서 처리할 수 없습니다. 더 작은 사진을 선택해주세요.');
  }

  return {
    imageBase64: fallbackBase64,
    mimeType: 'image/jpeg',
  };
};

export const api = {
  // Item identification using Vercel serverless function
  identifyItem: async (request: ItemIdentificationRequest): Promise<ItemIdentificationResponse> => {
    const payload = await optimizeImageForApi(request.imageFile);

    const response = await apiClient.post<IdentifyResponse>('/identify', {
      imageBase64: payload.imageBase64,
      mimeType: payload.mimeType,
    });

    const parsed = identifyResponseSchema.parse(response.data);
    return {
      itemName: parsed.itemName.trim() || '이름 미확인',
    };
  },

  // Background removal using Gemini gemini-3-pro-image-preview
  removeBackground: async (request: BackgroundRemovalRequest): Promise<BackgroundRemovalResponse> => {
    const payload = await optimizeImageForApi(request.imageFile);

    const response = await apiClient.post<RemoveBackgroundResponse>('/remove-background', {
      imageBase64: payload.imageBase64,
      mimeType: payload.mimeType,
      itemName: request.itemName,
    });

    const parsed = removeBackgroundResponseSchema.parse(response.data);
    return {
      processedImageBase64: parsed.imageBase64,
      contentType: parsed.mimeType || 'image/png',
    };
  },
};
