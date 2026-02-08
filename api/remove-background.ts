import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { removeBackgroundRequestSchema } from '../shared/apiSchemas.js';
import { applyCors, requireAuth } from './_lib/request.js';

const apiKey = process.env.GEMINI_API_KEY;

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
            return res.status(500).json({ success: false, error: 'Server configuration error: API Key missing' });
        }

        const parsed = removeBackgroundRequestSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                success: false,
                error: 'Invalid request payload',
                details: parsed.error.issues.map((issue) => issue.message).join(', '),
            });
        }

        const { imageBase64, mimeType, itemName } = parsed.data;

        const genAI = new GoogleGenerativeAI(apiKey);

        // Use gemini-3-pro-image-preview for best background removal
        const model = genAI.getGenerativeModel({
            model: 'gemini-3-pro-image-preview',
        });

        const itemHint = itemName ? `The main object is "${itemName}". ` : '';
        const prompt = `${itemHint}Replace the background of this image with a solid color HEX #DEE8F4. Keep the main object intact and natural. Output only the processed image with the new solid background.`;

        const result = await model.generateContent({
            contents: [{
                role: 'user',
                parts: [
                    { text: prompt },
                    {
                        inlineData: {
                            data: imageBase64,
                            mimeType: mimeType || 'image/png',
                        },
                    },
                ],
            }],
            generationConfig: {
                responseModalities: ['Text', 'Image'],
            } as Record<string, unknown>,
        });

        const response = result.response;

        // Check if we got an image back
        const parts = response.candidates?.[0]?.content?.parts || [];

        for (const part of parts) {
            const partData = part as any;
            if (partData.inlineData) {
                // Found image data
                return res.status(200).json({
                    success: true,
                    imageBase64: partData.inlineData.data,
                    mimeType: partData.inlineData.mimeType || 'image/png',
                });
            }
        }

        // No image found - return text response for debugging
        const textParts = parts.filter(p => 'text' in p).map(p => (p as { text: string }).text);

        return res.status(500).json({
            success: false,
            error: 'No image generated',
            details: 'Model did not return an image',
            textResponse: textParts.join('\n'),
        });

    } catch (error) {
        console.error('Error removing background with Gemini:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to remove background',
            details: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}
