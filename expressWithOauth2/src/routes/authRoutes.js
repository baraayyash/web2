/**
 * Authentication HTTP routes (mounted at `/api/auth` in `server.js`).
 *
 * | Method | Path | Purpose |
 * |--------|------|---------|
 * | POST | `/register` | Create user with bcrypt password; returns JWT |
 * | POST | `/login` | Passport local strategy; returns JWT |
 * | GET | `/google` | Start Google OAuth (browser) |
 * | GET | `/google/callback` | Google redirects here; issue JWT, redirect to client |
 * | GET | `/google/failure` | OAuth failed (used by Passport `failureRedirect`) |
 */

import { Router } from 'express';
import passport from 'passport';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { signToken } from '../utils/jwt.js';

const router = Router();

/** Google strategy is only registered in `passport.js` when all three env vars exist. */
function isGoogleConfigured() {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_CALLBACK_URL
  );
}

/**
 * Register with email + password.
 * Body: `{ email, name, password }` — password min length 8 (teaching default, not OWASP full guide).
 * Response `201`: `{ token, user }` where `user` is from `toSafeObject()`.
 */
router.post('/register', async (req, res) => {
  try {
    const { email, name, password } = req.body;
    if (!email || !name || !password) {
      return res.status(400).json({ error: 'email, name, and password are required' });
    }
    if (typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ error: 'password must be at least 8 characters' });
    }
    const normalizedEmail = String(email).toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email: normalizedEmail,
      name: String(name).trim(),
      passwordHash,
    });
    const token = signToken(user._id.toString());
    return res.status(201).json({ token, user: user.toSafeObject() });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    console.error(err);
    return res.status(500).json({ error: 'Registration failed' });
  }
});

/**
 * Login with email + password (Passport `local` strategy).
 * Body: `{ email, password }`
 * Response `200`: `{ token, user }`
 */
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ error: info?.message || 'Invalid email or password' });
    }
    const token = signToken(user._id.toString());
    return res.json({ token, user: user.toSafeObject() });
  })(req, res, next);
});

/** Step 1 of Google OAuth — redirects the user's browser to Google's consent screen. */
router.get('/google', (req, res, next) => {
  if (!isGoogleConfigured()) {
    return res.status(503).json({
      error: 'Google OAuth is not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_CALLBACK_URL.',
    });
  }
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

/**
 * Step 2 — Google redirects here with a `code`; Passport exchanges it and runs the Google strategy.
 * On success, redirect to `CLIENT_SUCCESS_URL` with the JWT in the **URL hash** (not query string)
 * so the home page script can read it without the token hitting server logs on the next GET `/`.
 */
router.get(
  '/google/callback',
  (req, res, next) => {
    if (!isGoogleConfigured()) {
      return res.status(503).json({ error: 'Google OAuth is not configured' });
    }
    next();
  },
  passport.authenticate('google', { failureRedirect: '/api/auth/google/failure' }),
  (req, res) => {
    const token = signToken(req.user._id.toString());
    const base = process.env.CLIENT_SUCCESS_URL || 'http://localhost:3000';
    const url = new URL(base);
    url.hash = `token=${encodeURIComponent(token)}`;
    return res.redirect(url.toString());
  }
);

router.get('/google/failure', (req, res) => {
  res.status(401).json({ error: 'Google authentication failed' });
});

export default router;
