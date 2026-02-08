import type { VercelRequest, VercelResponse } from '@vercel/node';
import { applyCors } from './_lib/request.js';

export default function handler(req: VercelRequest, res: VercelResponse) {
    if (!applyCors(req, res)) {
        return;
    }

    return res.status(200).json({
        success: true,
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.VERCEL_ENV || 'development',
    });
}
