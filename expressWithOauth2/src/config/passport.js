/**
 * Passport configuration — "strategies" that prove a user's identity.
 *
 * ## Two strategies in this project
 *
 * 1. **local** — email + password from `POST /api/auth/login` body. Validates with bcrypt.
 * 2. **google** (OAuth 2.0) — browser redirect to Google, then callback. Registered only if
 *    `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_CALLBACK_URL` are set.
 *
 * ## Sessions vs JWT (important for students)
 *
 * - **Passport + `express-session`** tie the *browser* to a user across the Google redirect
 *   (Google hits your server twice: start OAuth, then callback). `serializeUser` stores only the
 *   user id in the session cookie; `deserializeUser` reloads the `User` from Mongo.
 * - **JWT** is what this API returns to the client for `Authorization: Bearer …` on `/api/products`.
 *   Passport proves identity once; your route code then calls `signToken()`.
 *
 * @see http://www.passportjs.org/
 */

import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';

/** Registers Passport strategies and session (de)serialization. Call once at startup. */
export function configurePassport() {
  // --- Session support (needed for Google OAuth redirect flow) ---

  /** Store only the user id in the session cookie (small, no secrets). */
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  /** On each request, reload the full User document from Mongo into `req.user`. */
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // --- Strategy: email + password (field names match JSON body from clients) ---

  passport.use(
    new LocalStrategy(
      { usernameField: 'email', passwordField: 'password' },
      async (email, password, done) => {
        try {
          const user = await User.findOne({ email: email.toLowerCase().trim() });
          if (!user || !user.passwordHash) {
            // Same message whether user missing or Google-only — avoids account enumeration
            return done(null, false, { message: 'Invalid email or password' });
          }
          const ok = await bcrypt.compare(password, user.passwordHash);
          if (!ok) {
            return done(null, false, { message: 'Invalid email or password' });
          }
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  // --- Strategy: Google OAuth 20 (optional — requires env vars) ---

  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const callbackURL = process.env.GOOGLE_CALLBACK_URL;

  if (clientID && clientSecret && callbackURL) {
    passport.use(
      new GoogleStrategy(
        {
          clientID,
          clientSecret,
          callbackURL,
          scope: ['profile', 'email'],
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            const googleId = profile.id;
            const email = profile.emails?.[0]?.value?.toLowerCase();
            if (!email) {
              return done(new Error('Google account has no email'));
            }
            const displayName = profile.displayName || email.split('@')[0];

            /** Structured log for teaching / debugging (remove or gate in production). */
            const logGoogleAccount = (user, flow) => {
              console.log('[Google OAuth] signed in', {
                flow,
                google: {
                  id: profile.id,
                  displayName: profile.displayName,
                  name: profile.name
                    ? {
                        familyName: profile.name.familyName,
                        givenName: profile.name.givenName,
                      }
                    : undefined,
                  emails: profile.emails?.map((e) => ({ value: e.value, verified: e.verified })),
                  photos: profile.photos?.map((p) => p.value),
                  locale: profile._json?.locale,
                  hostedDomain: profile._json?.hd,
                },
                appUser: {
                  id: user._id.toString(),
                  email: user.email,
                  name: user.name,
                  googleId: user.googleId,
                },
              });
            };

            // Branch A: returning Google user — row already keyed by googleId
            let user = await User.findOne({ googleId });
            if (user) {
              logGoogleAccount(user, 'existing-google-user');
              return done(null, user);
            }

            // Branch B: same email already registered locally — link Google id to that account
            user = await User.findOne({ email });
            if (user) {
              user.googleId = googleId;
              if (!user.name && displayName) {
                user.name = displayName;
              }
              await user.save();
              logGoogleAccount(user, 'linked-existing-email-to-google');
              return done(null, user);
            }

            // Branch C: first time we see this email — create a new User document
            user = await User.create({
              email,
              name: displayName,
              googleId,
              passwordHash: null,
            });
            logGoogleAccount(user, 'new-user-from-google');
            return done(null, user);
          } catch (err) {
            return done(err);
          }
        }
      )
    );
  }
}
