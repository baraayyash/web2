/**
 * Product routes (mounted at `/api/products`).
 *
 * - **GET /** — public list (no JWT) — typical "browse catalog" pattern.
 * - **POST /** — requires `Authorization: Bearer <jwt>` (`requireAuth`) — owner is `req.user`.
 */

import { Router } from 'express';
import { Product } from '../models/Product.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

/** List all products, newest first; includes basic `owner` info via `populate`. */
router.get('/', async (_req, res) => {
  try {
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .populate('owner', 'name email')
      .lean();
    const list = products.map((p) => ({
      id: p._id.toString(),
      title: p.title,
      description: p.description,
      price: p.price,
      createdAt: p.createdAt,
      owner: p.owner
        ? { id: p.owner._id.toString(), name: p.owner.name, email: p.owner.email }
        : null,
    }));
    return res.json({ products: list });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to list products' });
  }
});

/**
 * Create a product for the authenticated user.
 * Headers: `Authorization: Bearer <jwt>`
 * Body: `{ title, description?, price }`
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, description, price } = req.body;
    if (!title || price === undefined || price === null) {
      return res.status(400).json({ error: 'title and price are required' });
    }
    const numPrice = Number(price);
    if (Number.isNaN(numPrice) || numPrice < 0) {
      return res.status(400).json({ error: 'price must be a non-negative number' });
    }
    const product = await Product.create({
      title: String(title).trim(),
      description: description != null ? String(description).trim() : '',
      price: numPrice,
      owner: req.user._id,
    });
    await product.populate('owner', 'name email');
    return res.status(201).json({
      product: {
        id: product._id.toString(),
        title: product.title,
        description: product.description,
        price: product.price,
        createdAt: product.createdAt,
        owner: {
          id: product.owner._id.toString(),
          name: product.owner.name,
          email: product.owner.email,
        },
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to create product' });
  }
});

export default router;
