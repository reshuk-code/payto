# QRForge

Dynamic QR codes that never expire. Print once, change the link anytime, and see who scans.

This is the MVP prototype.

**Live:** https://qrforge-seven-phi.vercel.app
(Vercel project `qrforge`, Neon database `qrforge` in Singapore, functions in `sin1`.)

## What works

- **Accounts**: email + password sign up and log in (bcrypt, database sessions, httpOnly cookie)
- **Dynamic QR codes**: each code points to a short link (`/r/abc1234`) that redirects to your destination
- **Edit after printing**: change the destination anytime; the printed code keeps working
- **Colors**: presets plus custom colors, with a contrast check so codes stay scannable
- **Live preview** while creating a code
- **Downloads**: PNG (1024px) and SVG
- **Analytics**: total scans, unique visitors, last 7 days, 30-day chart, devices, countries, recent scans.
  Link-preview bots (WhatsApp, Telegram, Slack…) are filtered out. Raw IPs are never stored.
- **Pause / resume / delete**: paused or deleted codes show a friendly page that links back to QRForge
- **Free plan limit**: 3 dynamic codes (set with `FREE_PLAN_LIMIT`)

## Run it locally

```bash
cd qrforge
npm install
npm run dev
```

Open http://localhost:3000. No database setup needed: in development QRForge uses
[PGlite](https://pglite.dev), an embedded Postgres saved in `.data/`.

To use a real Postgres instead, copy `.env.example` to `.env.local` and set `DATABASE_URL`.
Tables are created automatically on first connection.

## Tests

```bash
npm test          # unit tests for URL checks, colors, user-agent parsing
npm run build     # production build
```

The full flow (sign up, create, scan, edit, pause, plan limit, access control, delete)
was also tested end to end in a browser against both PGlite and Postgres 16.

## Deploy (Vercel + Neon)

1. Create a free Postgres database on [Neon](https://neon.tech) and copy its connection string.
2. Import the repo on [Vercel](https://vercel.com) and set **Root Directory** to `qrforge`.
3. Add environment variables:
   - `DATABASE_URL`: the Neon connection string
   - `APP_URL`: your final domain, e.g. `https://qrforge.app`
4. Deploy.

> **Set `APP_URL` before printing any codes.** The short link inside every QR code uses this
> domain. If it changes later, printed codes stop working. Pick your real domain first.

## Project layout

```
app/
  page.js                    landing page
  login/, signup/            auth pages
  dashboard/                 code list, new code, code detail + analytics
  r/[slug]/route.js          the redirect every QR code points to (logs the scan after redirecting)
  api/codes/[id]/download/   PNG / SVG download
  unavailable/               shown for paused or deleted codes
  actions.js                 server actions (auth + code CRUD)
components/                  forms, header, buttons
lib/
  db.js                      Postgres (pg) or PGlite, same SQL for both
  schema.js                  tables, created automatically
  auth.js                    sessions
  codes.js                   code queries + analytics
  qr.js                      QR rendering
  utils.js, colors.js        validation and parsing helpers
tests/                       unit tests
```

## Next steps

1. **Payments**: Pro plan at $5/month. If Stripe isn't available in your country, use
   Lemon Squeezy, Paddle or Polar.
2. **Abuse protection**: any redirect service gets used for phishing eventually. Add a
   blocklist / Google Safe Browsing check on destinations, and rate limits on sign up and log in.
3. **Logo in the code** (Pro), using higher error correction (`H`).
4. **More code types**: Wi-Fi, contact card (vCard), PDF menu upload.
5. **Custom short domains** (Pro).
6. Password reset and email verification.
