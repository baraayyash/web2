/**
 * JSON Web Tokens (JWT) for API authentication after login.
 *
 * Why JWT here?
 * - Stateless: the server signs a payload with a secret; clients send the token on each request.
 * - Works well for JSON APIs and tools like fetch/curl (send `Authorization: Bearer <token>`).
 *
 * The payload uses the standard `sub` (subject) claim to hold the user's Mongo `_id` as a string.
 * @see https://datatracker.ietf.org/doc/html/rfc7519
 */

import jwt from 'jsonwebtoken';

/**
 * Create a signed JWT that proves "this user id" for a limited time.
 *
 * @param {string} userId - MongoDB ObjectId string for the authenticated user
 * @returns {string} Signed JWT (three dot-separated base64url segments)
 */
export function signToken(userId) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set');
  }
  return jwt.sign({ sub: userId }, secret, { expiresIn: '7d' });
}

/**
 * Verify signature and expiry; return the decoded payload (includes `sub`).
 *
 * @param {string} token - Raw JWT from the `Authorization` header
 * @returns {import('jsonwebtoken').JwtPayload} Decoded payload (throws if invalid/expired)
 */
export function verifyToken(token) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set');
  }
  return jwt.verify(token, secret);
}
