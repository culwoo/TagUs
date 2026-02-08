import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { identifyRequestSchema } from '../shared/apiSchemas.js';
import { applyCors, requireAuth } from './_lib/request.js';

// Initialize Gemini
const apiKey = process.env.GEMINI_API_KEY;

const parseItemName = (rawText: string): string => {
  const cleanText = rawText
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim();
  if (!cleanText) {
    return 'Unknown Item';
  }

  try {
    const parsed = JSON.parse(cleanText) as { itemName?: unknown };
    if (typeof parsed.itemName === 'string' && parsed.itemName.trim()) {
      return parsed.itemName.trim();
    }
  } catch {
    // Gemini can return plain text; fallback below.
  }

  return cleanText;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!applyCors(req, res)) {
    return;
  }

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  if (!(await requireAuth(req, res))) {
    return;
  }

  try {
    if (!apiKey) {
      return res
        .status(500)
        .json({ success: false, error: 'Server configuration error: API Key missing' });
    }

    const parsed = identifyRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request payload',
        details: parsed.error.issues.map(issue => issue.message).join(', '),
      });
    }

    const { imageBase64, mimeType } = parsed.data;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });

    const prompt =
      'Identify the main object in this image. Return a JSON object with a single key "itemName" describing the object in 2-3 words (in Korean if appropriate, or English). Do not use Markdown formatting.';

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageBase64,
          mimeType: mimeType || 'image/jpeg',
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();

    console.log('Gemini raw response:', text);

    const itemName = parseItemName(text);

    return res.status(200).json({ success: true, itemName });
  } catch (error) {
    console.error('Error processing image with Gemini:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to process image',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
