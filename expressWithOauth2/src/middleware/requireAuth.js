/**
 * Express middleware: require a valid JWT on protected routes.
 *
 * Expected header: `Authorization: Bearer <jwt>`
 *
 * On success, attaches the loaded Mongoose `User` document to `req.user` for route handlers.
 */

import { verifyToken } from '../utils/jwt.js';
import { User } from '../models/User.js';

/**
 * Express middleware — call before handlers that need a logged-in user.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }
  const token = header.slice('Bearer '.length).trim();
  if (!token) {
    return res.status(401).json({ error: 'Missing token' });
  }
  try {
    const payload = verifyToken(token);
    const userId = payload.sub;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
