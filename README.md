# AI Customer Support Chatbot

A NestJS backend for an AI-powered customer support chatbot, built for the
**AI Automation Internship (Session 3) — DaFi Labs × EmpRadar.ai**.

## Features / Integrations

| Requirement            | Implementation                                            |
|-------------------------|------------------------------------------------------------|
| NestJS backend           | Modular structure: `chat`, `email`, `common`               |
| AI model integration     | OpenAI Chat Completions API (`/chat`)                      |
| Resend email integration | Test emails + AI chat summary emails (`/email/*`)          |
| Swagger docs             | Auto-generated at `/api/docs`                              |
| Sentry.io monitoring     | Global exception filter reports all 5xx errors to Sentry   |
| Validation               | `class-validator` DTOs + global `ValidationPipe`            |

## Folder structure

```
src/
├── main.ts                     # bootstraps app, Sentry, Swagger, validation
├── app.module.ts                # root module
├── app.controller.ts            # /health and /debug-sentry
├── common/
│   └── filters/
│       └── sentry-exception.filter.ts   # sends errors to Sentry
├── chat/
│   ├── chat.module.ts
│   ├── chat.controller.ts       # POST /chat, GET /chat/:sessionId/history
│   ├── chat.service.ts          # OpenAI integration + in-memory history
│   └── dto/
├── email/
│   ├── email.module.ts
│   ├── email.controller.ts      # POST /email/test, POST /email/summary
│   ├── email.service.ts         # Resend integration
│   └── dto/
```

---

## Step 1 — Install prerequisites

1. Install **Node.js v18 or newer** from https://nodejs.org (LTS version).
2. Confirm it worked:
   ```bash
   node -v
   npm -v
   ```

## Step 2 — Install project dependencies

From inside the project folder:
```bash
npm install
```
This reads `package.json` and downloads all required packages (NestJS, OpenAI SDK, Resend SDK, Sentry SDK, Swagger, etc.) into `node_modules/`.

## Step 3 — Get your API keys

You need **3 keys**. All three have free tiers, no credit card required to start.

### 1. OpenAI API key
1. Go to https://platform.openai.com/api-keys
2. Sign up / log in → "Create new secret key"
3. Copy it (starts with `sk-...`)
4. Note: new accounts usually need a small amount of prepaid credit (a couple of dollars) at https://platform.openai.com/settings/organization/billing — this is enough for hundreds of chatbot test messages.

> Alternative: if you'd rather not pay OpenAI, you can swap in **Groq** (has a generous free tier) — see "Using a different AI provider" below.

### 2. Resend API key
1. Go to https://resend.com and sign up (free tier: 100 emails/day, 3,000/month)
2. Go to **API Keys** → **Create API Key** → copy it (starts with `re_...`)
3. For the "from" address, you can either:
   - Use `onboarding@resend.dev` (works instantly, no setup — great for the demo), or
   - Verify your own domain under **Domains** for a production-looking sender.

### 3. Sentry DSN
1. Go to https://sentry.io and sign up (free tier is enough)
2. Create a new project → choose **Node.js / Express** as the platform
3. Sentry will show you a **DSN** — a URL like `https://xxxx@xxxx.ingest.sentry.io/xxxx`
4. Copy it — you can also find it later under **Project Settings → Client Keys (DSN)**

## Step 4 — Configure environment variables

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and paste in your 3 keys:
   ```
   PORT=3000
   OPENAI_API_KEY=sk-...
   OPENAI_MODEL=gpt-4o-mini
   RESEND_API_KEY=re_...
   RESEND_FROM_EMAIL=onboarding@resend.dev
   SENTRY_DSN=https://...
   NODE_ENV=development
   ```

`.env` is already in `.gitignore` — it will never be pushed to GitHub. That's important: **never commit real API keys**.

## Step 5 — Run the app

```bash
npm run start:dev
```

You should see:
```
🚀 Application is running on: http://localhost:3000
📘 Swagger docs available at: http://localhost:3000/api/docs
```

## Step 6 — Test everything in Swagger

Open **http://localhost:3000/api/docs** in your browser. You'll see all endpoints grouped by tag.

### Test the chatbot (AI integration)
- Expand `POST /chat` → "Try it out"
- Body:
  ```json
  { "message": "Hi, do you offer refunds?" }
  ```
- Click **Execute** → you'll get back an AI-generated `reply` and a `sessionId`.
- Copy that `sessionId`, send another message with it in the body to continue the same conversation (the bot will remember context).

### Test email sending (Resend integration)
- Expand `POST /email/test` → "Try it out"
- Body:
  ```json
  { "to": "your-email@example.com", "subject": "Test", "message": "Hello from my chatbot!" }
  ```
- Click **Execute** → check your inbox (and spam folder).

### Test the chat summary email
- Expand `POST /email/summary` → "Try it out"
- Body:
  ```json
  { "to": "your-email@example.com", "sessionId": "<paste the sessionId from your /chat test>" }
  ```
- Execute → you'll receive an email with the full conversation.

### Test Sentry (error monitoring)
- Expand `GET /debug-sentry` → "Try it out" → Execute
- This deliberately throws an error.
- Go to your Sentry dashboard (https://sentry.io) → your project → **Issues**
- You should see the error `"This is a test error for Sentry monitoring 🚨"` appear within a few seconds.

---

## Using a different AI provider (optional)

If you want to use **Groq** (OpenAI-compatible, free) instead of OpenAI, you only need to change 2 lines in `src/chat/chat.service.ts`:

```ts
this.openai = new OpenAI({
  apiKey: this.configService.get<string>('GROQ_API_KEY'),
  baseURL: 'https://api.groq.com/openai/v1',
});
this.model = 'llama-3.3-70b-versatile';
```
And set `GROQ_API_KEY` in `.env` (get one free at https://console.groq.com/keys). Everything else (Swagger docs, DTOs, controllers) stays exactly the same, since Groq uses the same API shape as OpenAI.

---

## Deploying (free options)

To get a live URL for your submission, deploy to **Render** (easiest free option for NestJS):

1. Push this project to a GitHub repository (see below).
2. Go to https://render.com → sign up → **New → Web Service**
3. Connect your GitHub repo.
4. Settings:
   - Build command: `npm install && npm run build`
   - Start command: `npm run start:prod`
5. Under **Environment**, add the same variables from your `.env` file (`OPENAI_API_KEY`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `SENTRY_DSN`, `NODE_ENV=production`).
6. Deploy. Render gives you a URL like `https://your-app.onrender.com`.
7. Your live Swagger docs will be at `https://your-app.onrender.com/api/docs`.

(Railway.app and Fly.io work the same way if you prefer those.)

## Pushing to GitHub

```bash
git init
git add .
git commit -m "AI Customer Support Chatbot - NestJS + OpenAI + Resend + Swagger + Sentry"
git branch -M main
git remote add origin https://github.com/<your-username>/ai-customer-support-chatbot.git
git push -u origin main
```

## What to record in your demo video

1. Briefly explain the project (30 seconds): "I built an AI customer support chatbot using NestJS..."
2. Show `POST /chat` in Swagger → get an AI reply.
3. Show the OpenAI dashboard usage tab (proves real API integration).
4. Show `POST /email/test` in Swagger → then show the received email in your inbox.
5. Show `GET /debug-sentry` in Swagger → then show the error appearing in your Sentry Issues dashboard.
6. Briefly show your code structure (modules/folders) in your editor.

## What to write in your LinkedIn post

- What you built: an AI-powered customer support chatbot backend
- Tech stack: NestJS, OpenAI API, Resend, Swagger, Sentry, TypeScript
- What you learned: connecting an AI model to a real backend, documenting APIs, transactional email automation, and production error monitoring
- Mention: *"Completed as part of the AI Automation Internship Program by DaFi Labs × EmpRadar.ai"*
- Attach your demo recording
