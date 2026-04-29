/**
 * Express application entry point.
 *
 * ## Request flow (simplified)
 *
 * 1. `dotenv` loads `.env` into `process.env`.
 * 2. Middleware: CORS, JSON body parser, **session** (for Passport Google OAuth), **Passport**.
 * 3. Routes under `/api/*` — JSON API for auth + products.
 * 4. `GET /` — tiny HTML shell for students to try Google login and copy a JWT from the browser.
 * 5. 404 + global error handler.
 *
 * ## Environment variables students need
 *
 * - `MONGODB_URI`, `JWT_SECRET`, `SESSION_SECRET` (or reuse JWT as session secret fallback)
 * - Optional Google: `GOOGLE_*`, `CLIENT_SUCCESS_URL`
 *
 * @module server
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import { connectDatabase } from './config/database.js';
import { configurePassport } from './config/passport.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';

const app = express();
const port = Number(process.env.PORT) || 3000;

// Allow browser clients (e.g. `fetch` from another origin) and cookies for OAuth if needed
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

const sessionSecret = process.env.SESSION_SECRET || process.env.JWT_SECRET;
if (!sessionSecret) {
  console.error('Set SESSION_SECRET or JWT_SECRET in .env');
  process.exit(1);
}

// Session cookie stores a session id; Passport serializes the logged-in user id into this session
app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
  })
);

configurePassport();
app.use(passport.initialize());
app.use(passport.session());

/** Liveness check for demos, load balancers, or `curl` sanity checks */
app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

/**
 * Minimal "front door" for teaching: link to Google OAuth and client-side JWT display.
 * The JWT is delivered in the URL **hash** after OAuth (`#token=...`) so it is not sent to the
 * server on the follow-up GET (see `authRoutes.js` redirect).
 */
app.get('/', (_req, res) => {
  res.type('html').send(homePageHtml());
});

/**
 * Returns a self-contained HTML page with inline script (no build step for students).
 * - Reads JWT from `?token=` (optional) or `#token=` (Google callback default).
 * - Uses `textContent` / DOM APIs only (no `innerHTML` with user-controlled token).
 */
function homePageHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>expressouth2v0</title>
<style>
  body { font-family: system-ui, sans-serif; max-width: 42rem; margin: 2rem auto; padding: 0 1rem; line-height: 1.5; }
  a { color: #2563eb; }
  pre { word-break: break-all; white-space: pre-wrap; background: #f4f4f5; padding: 0.75rem; border-radius: 8px; }
  button { margin-top: 0.75rem; margin-right: 0.5rem; padding: 0.5rem 1rem; cursor: pointer; }
  .muted { color: #52525b; font-size: 0.9rem; }
</style>
</head>
<body>
<div id="root"></div>
<script>
(function () {
  var root = document.getElementById('root');

  function readToken() {
    var q = new URLSearchParams(window.location.search).get('token');
    if (q) return q;
    var h = window.location.hash || '';
    if (h.indexOf('#token=') === 0) {
      try {
        return decodeURIComponent(h.slice('#token='.length));
      } catch (e) {
        return '';
      }
    }
    return '';
  }

  function renderLanding() {
    root.innerHTML =
      '<h1>expressouth2v0</h1>' +
      '<p><a href="/api/auth/google">Sign in with Google</a> — after login you land here with the token in the URL hash.</p>' +
      '<p class="muted">JSON API: <code>GET /api/health</code>, <code>POST /api/auth/register</code>, <code>GET /api/products</code>, …</p>';
  }

  function renderSuccess(token) {
    root.textContent = '';
    var h1 = document.createElement('h1');
    h1.textContent = 'Signed in with Google';
    root.appendChild(h1);

    var p1 = document.createElement('p');
    p1.textContent = 'Send this value in the Authorization header for protected routes (e.g. POST /api/products):';
    root.appendChild(p1);

    var preFull = document.createElement('pre');
    preFull.setAttribute('aria-label', 'Full Authorization header');
    preFull.textContent = 'Authorization: Bearer ' + token;
    root.appendChild(preFull);

    var p2 = document.createElement('p');
    p2.className = 'muted';
    p2.textContent = 'JWT only (same token):';
    root.appendChild(p2);

    var preTok = document.createElement('pre');
    preTok.id = 'jwt-only';
    preTok.textContent = token;
    root.appendChild(preTok);

    var btnFull = document.createElement('button');
    btnFull.type = 'button';
    btnFull.textContent = 'Copy full header';
    btnFull.onclick = function () {
      navigator.clipboard.writeText(preFull.textContent);
      btnFull.textContent = 'Copied';
    };
    root.appendChild(btnFull);

    var btnTok = document.createElement('button');
    btnTok.type = 'button';
    btnTok.textContent = 'Copy JWT only';
    btnTok.onclick = function () {
      navigator.clipboard.writeText(token);
      btnTok.textContent = 'Copied';
    };
    root.appendChild(btnTok);

    if (window.location.hash.indexOf('#token=') === 0) {
      try {
        history.replaceState(null, '', window.location.pathname + window.location.search);
      } catch (e) {}
    }
  }

  var token = readToken();
  if (token) {
    document.title = 'Signed in';
    renderSuccess(token);
  } else {
    renderLanding();
  }
})();
</script>
</body>
</html>`;
}

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

/** Express error-handling middleware — four arguments tell Express this is an error handler */
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

async function main() {
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is required in .env');
    process.exit(1);
  }
  await connectDatabase();
  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
