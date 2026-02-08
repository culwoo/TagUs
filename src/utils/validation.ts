import { z } from 'zod';
import { MAX_ITEM_NAME_LENGTH } from '../constants/item';

// Item validation schema
export const itemSchema = z.object({
  id: z.number().int().positive(),
  name: z
    .string()
    .min(1, '이름은 필수 항목입니다')
    .max(MAX_ITEM_NAME_LENGTH, `이름은 ${MAX_ITEM_NAME_LENGTH}자 이하여야 합니다`),
  image: z.string().url('유효한 이미지 URL이어야 합니다'),
});

export type ItemInput = z.infer<typeof itemSchema>;

// Memo validation schema
export const memoSchema = z.object({
  content: z.string().max(5000, '메모는 5000자 이하여야 합니다'),
});

export type MemoInput = z.infer<typeof memoSchema>;

// Location validation schema
export const locationSchema = z.object({
  name: z.string().min(1, '위치 이름은 필수 항목입니다').max(50),
  station: z.string().min(1, '역 이름은 필수 항목입니다').max(50),
  boxNumber: z.string().min(1, '보관함 번호는 필수 항목입니다').max(50),
});

export type LocationInput = z.infer<typeof locationSchema>;

// Image file validation schema
export const imageFileSchema = z.object({
  file: z
    .instanceof(File)
    .refine(file => file.size <= 10 * 1024 * 1024, '파일 크기는 10MB 이하여야 합니다')
    .refine(
      file => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      '지원되는 이미지 형식만 업로드 가능합니다 (JPEG, PNG, WebP)'
    ),
});

export type ImageFileInput = z.infer<typeof imageFileSchema>;
