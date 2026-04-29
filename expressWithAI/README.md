# Express + LLM (student demo)

One Express route, **`POST /explain`**, sends a **topic** to an LLM and returns a **short explanation**.

**Providers (pick one in `.env`):**

- **`AI_PROVIDER=gemini`** (default) — [Google AI Studio](https://aistudio.google.com/apikey) key.
- **`AI_PROVIDER=groq`** — [Groq](https://console.groq.com/keys) key; uses the OpenAI-style chat API with plain `fetch` (good to compare with the Gemini SDK).

## Setup

1. Install Node.js 18+ (global `fetch` is used for Groq).
2. In this folder: `npm install`
3. Copy env file: `cp .env.example .env`
4. Set either **Gemini** (`GEMINI_API_KEY`) or **Groq** (`AI_PROVIDER=groq` and `GROQ_API_KEY`). See `.env.example`.
5. Run: `npm start` (or `npm run dev` for auto-restart on file changes)

### Groq quick path (if Gemini is blocked)

In `.env`:

```env
AI_PROVIDER=groq
GROQ_API_KEY=your_key_from_console.groq.com
```

Optional: `GROQ_MODEL=llama-3.1-8b-instant` (default). [Models list](https://console.groq.com/docs/models).

## Try it

```bash
curl -s -X POST http://localhost:3000/explain \
  -H "Content-Type: application/json" \
  -d '{"topic":"what an HTTP request is"}'
```

Open `http://localhost:3000/` in a browser for the same hints.

### If you see `429 Too Many Requests`

Google applies **per-minute** and **per-day** caps on the free tier, and they differ by **model** and project. **Gemini 2.0 Flash** is deprecated and often exhausts or loses free-tier quota first—this project defaults to **`gemini-2.5-flash`** instead. If you still get 429s: wait a minute, call the API less often in class demos, or set `GEMINI_MODEL=gemini-2.5-flash-lite`. Check [rate limits](https://ai.google.dev/gemini-api/docs/rate-limits) and your usage in [AI Studio](https://aistudio.google.com/).

### If you see `403` / “Your project has been denied access”

That message comes from **Google’s side**: the **Google Cloud project** linked to your API key is not allowed to call the Generative Language API (model access, region, organization policy, abuse review, etc.). Your Express code is fine.

Try this order:

1. **New key, clean project** — In [Google AI Studio → API keys](https://aistudio.google.com/apikey), create a **new** key and choose **Create API key in new project** (or a personal project you know is unrestricted). Put that key in `.env` and restart.
2. **Test in AI Studio** — In the same account, open the [chat / prompt UI](https://aistudio.google.com/). If the web app also fails, the issue is account/project/region, not Node.
3. **Region / billing** — In some countries the **free tier is not available** until you add a **paid plan** on the project; see Google’s note on free tier and billing in the [troubleshooting guide](https://ai.google.dev/gemini-api/docs/troubleshooting) (e.g. `FAILED_PRECONDITION` / billing).
4. **Leaked key** — Keys exposed in GitHub or chats may be **disabled**; the error text is often different, but if in doubt, revoke the old key and create a new one.
5. **Still stuck** — Use **Send feedback** in AI Studio or the [AI developer forum](https://discuss.ai.google.dev/); only Google can lift a **“denied access”** flag on a project.

**Same error on every model (e.g. Flash and Flash-Lite)?** Then it is **not** a model choice problem — the **project** behind the key is denied for the API. You must fix access with Google or use a **different Google account** / **new Cloud project** when creating the key.

### Teaching without Gemini (403 in your region or school account)

Set in `.env`:

```env
USE_MOCK_AI=1
```

Restart the server. `POST /explain` still accepts `{ "topic": "..." }` but returns a placeholder `explanation` and `"source": "mock"` so students practice Express, JSON, and HTTP while you sort out API access.

## Optional env

| Variable          | Purpose |
|-------------------|---------|
| `AI_PROVIDER`     | `gemini` (default) or `groq`. |
| `GEMINI_API_KEY`  | Required when provider is Gemini. From [AI Studio](https://aistudio.google.com/apikey). |
| `GEMINI_MODEL`    | Default `gemini-2.5-flash`. |
| `GROQ_API_KEY`    | Required when `AI_PROVIDER=groq`. From [Groq console](https://console.groq.com/keys). |
| `GROQ_MODEL`      | Default `llama-3.1-8b-instant`. |
| `PORT`            | Default `3000`. |
| `USE_MOCK_AI`     | `1` or `true` = no LLM calls (no API keys needed). |

## Other providers (if Gemini is blocked or you want variety)

These use **different companies** than Google, so a Gemini **403** does not apply. Limits and model IDs change often—always check the provider’s site before a lecture.

| Provider | Why it fits Express teaching | Typical integration |
|----------|-------------------------------|----------------------|
| **[OpenRouter](https://openrouter.ai/)** | One API key, [many models](https://openrouter.ai/models?pricing=free). Free tier: use model **`openrouter/free`** (auto-picks a free model) or a fixed free id like **`meta-llama/llama-3.2-3b-instruct:free`** (`:free` suffix). **OpenAI-compatible** `POST /v1/chat/completions` — easy with `fetch` in Node 18+. [Free router docs](https://openrouter.ai/docs/guides/routing/routers/free-models-router). |
| **[Groq](https://console.groq.com/)** | **Implemented in this repo** — set `AI_PROVIDER=groq` and `GROQ_API_KEY`. Very fast; [rate limits](https://console.groq.com/docs/rate-limits). Default model **`llama-3.1-8b-instant`**; others in [Groq models](https://console.groq.com/docs/models). |
| **[Together AI](https://www.together.ai/)** | Open models, OpenAI-style API; free credits / promos vary—check [pricing](https://www.together.ai/pricing). |
| **[Mistral](https://console.mistral.ai/)** | EU-friendly option; small free credits for new accounts; REST API. |
| **[Hugging Face](https://huggingface.co/docs/inference-providers)** | Inference API / serverless with many open weights; pricing and free credits change—see current HF docs. |
| **[Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai/)** | Runs on Workers (different shape than a long-lived Express process), but good for “server calls a model” demos on the edge. |

**Teaching tip:** For a second homework branch, **`fetch` + OpenRouter or Groq** is often the smallest step from this repo: same JSON in/out, swap URL, headers (`Authorization: Bearer …`), and body `{ model, messages }`.

## Files

- `server.js` — Express app: Gemini via `@google/generative-ai`, Groq via `fetch` to the OpenAI-compatible chat endpoint.
