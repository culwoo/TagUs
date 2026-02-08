import { NextFunction, Request, Response } from 'express';
import { verifyFirebaseIdToken } from '../../shared/firebaseAdmin';

export interface AuthedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
  };
}

export const requireAuth = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const decoded = await verifyFirebaseIdToken(req.headers.authorization);
    req.user = {
      uid: decoded.uid,
      email: decoded.email,
    };
    next();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Authentication failed';
    res.status(401).json({
      success: false,
      error: 'Unauthorized',
      details: message,
    });
  }
};
