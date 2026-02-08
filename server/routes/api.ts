import express from 'express';
import rateLimit from 'express-rate-limit';
import path from 'path';
import os from 'os';
import { promises as fs } from 'fs';
import { spawn } from 'child_process';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { identifyRequestSchema, removeBackgroundRequestSchema } from '../../shared/apiSchemas';
import { requireAuth } from '../middleware/auth';

const router = express.Router();

// -- Configuration --

// 2. Gemini AI setup
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('Warning: GEMINI_API_KEY is not set in environment variables.');
}
const genAI = new GoogleGenerativeAI(apiKey || '');

// Stricter rate limiting for image processing endpoints
const imageProcessingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many image processing requests. Please try again later.',
});

const pythonCommand = process.env.PYTHON_PATH || 'python';
const backgroundScripts: Record<string, string> = {
  ai: 'remove_bg_rembg.py',
  rembg: 'remove_bg_rembg.py',
  grabcut: 'remove_bg_grabcut.py',
};

const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

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

const parseBase64Image = (imageBase64: string, mimeType: string) => {
  if (!allowedMimeTypes.has(mimeType)) {
    throw new Error('Unsupported image mime type');
  }

  const buffer = Buffer.from(imageBase64, 'base64');
  if (!buffer.length) {
    throw new Error('Invalid image data');
  }

  if (buffer.byteLength > 10 * 1024 * 1024) {
    throw new Error('Image payload is too large');
  }

  return buffer;
};

const runPythonScript = (scriptPath: string, inputPath: string, outputPath: string) =>
  new Promise<void>((resolve, reject) => {
    const processRef = spawn(pythonCommand, [scriptPath, inputPath, outputPath], { stdio: 'pipe' });
    let stderr = '';

    const timeout = setTimeout(() => {
      processRef.kill('SIGKILL');
      reject(new Error('Background removal timed out.'));
    }, 30000);

    processRef.stderr.on('data', data => {
      stderr += data.toString();
    });

    processRef.on('error', error => {
      clearTimeout(timeout);
      reject(error);
    });

    processRef.on('close', code => {
      clearTimeout(timeout);
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(stderr || `Background removal failed with code ${code}`));
      }
    });
  });

// -- Routes --

// Gemini Identify Route
router.post('/identify', imageProcessingLimiter, requireAuth, async (req, res, next) => {
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
    parseBase64Image(imageBase64, mimeType);

    // Get the model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });

    const prompt =
      'Identify the main object in this image. Return a JSON object with a single key "itemName" describing the object in 2-3 words (in Korean if appropriate, or English). Do not use Markdown formatting.';

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageBase64,
          mimeType,
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();

    console.log('Gemini raw response:', text);

    const itemName = parseItemName(text);

    res.json({ success: true, itemName });
  } catch (error) {
    next(error);
  }
});

// Background removal route
router.post('/remove-background', imageProcessingLimiter, requireAuth, async (req, res, next) => {
  let tempDir: string | null = null;
  try {
    const parsed = removeBackgroundRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request payload',
        details: parsed.error.issues.map(issue => issue.message).join(', '),
      });
    }

    const { imageBase64, mimeType } = parsed.data;
    const imageBuffer = parseBase64Image(imageBase64, mimeType);

    const method = typeof req.body?.method === 'string' ? req.body.method : 'ai';
    const scriptName = backgroundScripts[method] || backgroundScripts.ai;
    const scriptPath = path.resolve(process.cwd(), scriptName);

    await fs.access(scriptPath);

    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tagus-'));
    const inputPath = path.join(tempDir, 'input');
    const outputPath = path.join(tempDir, 'output.png');

    await fs.writeFile(inputPath, imageBuffer);
    await runPythonScript(scriptPath, inputPath, outputPath);

    const outputBuffer = await fs.readFile(outputPath);
    res.json({
      success: true,
      imageBase64: outputBuffer.toString('base64'),
      mimeType: 'image/png',
    });
  } catch (error) {
    next(error);
  } finally {
    if (tempDir) {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  }
});

export default router;
