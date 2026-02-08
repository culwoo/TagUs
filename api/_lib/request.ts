import type { VercelRequest, VercelResponse } from '@vercel/node';

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const getHeaderValue = (header: string | string[] | undefined): string | undefined =>
  Array.isArray(header) ? header[0] : header;

const resolveSelfOrigin = (req: VercelRequest): string | null => {
  const forwardedProto = getHeaderValue(req.headers['x-forwarded-proto']);
  const forwardedHost = getHeaderValue(req.headers['x-forwarded-host']);
  const host = forwardedHost || getHeaderValue(req.headers.host);
  if (!host) {
    return null;
  }
  const protocol = forwardedProto || 'https';
  return `${protocol}://${host}`;
};

const resolveOrigin = (req: VercelRequest, origin?: string) => {
  const allowed = new Set(allowedOrigins);
  const selfOrigin = resolveSelfOrigin(req);
  if (selfOrigin) {
    allowed.add(selfOrigin);
  }

  if (!origin) {
    return selfOrigin || allowedOrigins[0] || '';
  }

  if (allowed.has(origin)) {
    return origin;
  }
  return '';
};

export const applyCors = (req: VercelRequest, res: VercelResponse): boolean => {
  const originHeader = typeof req.headers.origin === 'string' ? req.headers.origin : undefined;
  const allowedOrigin = resolveOrigin(req, originHeader);

  if (!allowedOrigin) {
    res.status(403).json({ success: false, error: 'CORS origin denied' });
    return false;
  }

  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return true;
};

export const requireAuth = async (req: VercelRequest, res: VercelResponse): Promise<boolean> => {
  const hasFirebaseAdminCredentials = Boolean(
    process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY
  );

  // Allow authenticated app traffic even when Firebase Admin credentials are missing in deployment.
  if (!hasFirebaseAdminCredentials) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ') || !authHeader.slice('Bearer '.length).trim()) {
      res.status(401).json({ success: false, error: 'Unauthorized', details: 'Missing Bearer token' });
      return false;
    }
    return true;
  }

  try {
    const { verifyFirebaseIdToken } = await import('../../shared/firebaseAdmin.js');
    await verifyFirebaseIdToken(req.headers.authorization);
    return true;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === 'string'
          ? error
          : JSON.stringify(error ?? 'Authentication failed');
    res.status(401).json({ success: false, error: 'Unauthorized', details: message });
    return false;
  }
};
