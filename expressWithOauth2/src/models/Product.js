/**
 * Product catalog model.
 *
 * Each product references an `owner` (`User` id) so you can show who listed it and
 * enforce "only authenticated users may create" at the route layer (`requireAuth`).
 */

import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    price: { type: Number, required: true, min: 0 },
    /** FK to `User` — set from `req.user._id` when creating via API */
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const Product = mongoose.model('Product', productSchema);
