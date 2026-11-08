// QRForge database schema. Runs on first connection and is safe to run many times.
// Kept as a JS string so it ships with the server bundle on any host.

export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email         text NOT NULL UNIQUE,
  name          text,
  password_hash text NOT NULL,
  plan          text NOT NULL DEFAULT 'free',
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash text PRIMARY KEY,
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions (user_id);

CREATE TABLE IF NOT EXISTS qr_codes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  slug        text NOT NULL UNIQUE,
  name        text NOT NULL,
  destination text NOT NULL,
  fg_color    text NOT NULL DEFAULT '#000000',
  bg_color    text NOT NULL DEFAULT '#ffffff',
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS qr_codes_user_idx ON qr_codes (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS scans (
  id           bigserial PRIMARY KEY,
  qr_code_id   uuid NOT NULL REFERENCES qr_codes(id) ON DELETE CASCADE,
  scanned_at   timestamptz NOT NULL DEFAULT now(),
  device       text,
  os           text,
  browser      text,
  country      text,
  referrer     text,
  visitor_hash text,
  is_bot       boolean NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS scans_code_time_idx ON scans (qr_code_id, scanned_at);
`;
