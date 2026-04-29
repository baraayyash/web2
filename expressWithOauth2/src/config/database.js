/**
 * MongoDB connection via Mongoose.
 *
 * Set `MONGODB_URI` in `.env` (see `.env.example`). For local development this project
 * often uses Docker Compose (`docker-compose.yml`) so everyone gets the same connection string.
 */

import mongoose from 'mongoose';

/**
 * Connect once at process startup. Subsequent `mongoose` model calls use this connection.
 *
 * @returns {Promise<void>}
 * @throws If `MONGODB_URI` is missing or the server cannot reach MongoDB
 */
export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set');
  }
  await mongoose.connect(uri);
}
