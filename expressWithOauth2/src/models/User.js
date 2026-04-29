/**
 * User model — supports two sign-in styles in one collection:
 *
 * 1. **Local (email + password)** — `passwordHash` is set; `googleId` may be added later when they link Google.
 * 2. **Google OAuth** — `googleId` is set; `passwordHash` may be null until they set a password (not implemented here).
 *
 * `email` is unique so the same person does not get two accounts for the same inbox.
 */

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    /** Login identity; stored lowercased; unique index */
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    /** Display name shown in UIs / product owner listings */
    name: { type: String, required: true, trim: true },
    /**
     * bcrypt hash of the password, or null for Google-only accounts.
     * Never send this field to clients — use `toSafeObject()` for API responses.
     */
    passwordHash: { type: String, default: null },
    /**
     * Stable id from Google (`profile.id` in Passport). Sparse index allows many docs
     * with `googleId: null` while still enforcing uniqueness when set.
     */
    googleId: { type: String, default: null, sparse: true, index: true },
  },
  { timestamps: true }
);

/**
 * Shape safe to return from `/api/auth/*` — no secrets.
 * @returns {{ id: string, email: string, name: string, hasPassword: boolean, linkedGoogle: boolean }}
 */
userSchema.methods.toSafeObject = function toSafeObject() {
  return {
    id: this._id.toString(),
    email: this.email,
    name: this.name,
    hasPassword: Boolean(this.passwordHash),
    linkedGoogle: Boolean(this.googleId),
  };
};

export const User = mongoose.model('User', userSchema);
