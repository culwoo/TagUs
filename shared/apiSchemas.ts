import { z } from 'zod';

const base64Regex = /^[A-Za-z0-9+/=]+$/;

export const identifyRequestSchema = z.object({
  imageBase64: z.string().min(1, 'imageBase64 is required').regex(base64Regex, 'invalid base64 payload'),
  mimeType: z.string().min(1, 'mimeType is required'),
});

export const identifyResponseSchema = z.object({
  success: z.literal(true),
  itemName: z.string().min(1),
});

export const removeBackgroundRequestSchema = z.object({
  imageBase64: z.string().min(1, 'imageBase64 is required').regex(base64Regex, 'invalid base64 payload'),
  mimeType: z.string().min(1, 'mimeType is required'),
  itemName: z.string().trim().min(1).optional(),
});

export const removeBackgroundResponseSchema = z.object({
  success: z.literal(true),
  imageBase64: z.string().min(1),
  mimeType: z.string().min(1),
});

export const apiErrorSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  details: z.string().optional(),
});

export type IdentifyRequest = z.infer<typeof identifyRequestSchema>;
export type IdentifyResponse = z.infer<typeof identifyResponseSchema>;
export type RemoveBackgroundRequest = z.infer<typeof removeBackgroundRequestSchema>;
export type RemoveBackgroundResponse = z.infer<typeof removeBackgroundResponseSchema>;
export type ApiErrorResponse = z.infer<typeof apiErrorSchema>;
