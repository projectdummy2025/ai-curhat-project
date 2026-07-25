-- Messages table: stores recent messages (10 latest)
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL DEFAULT 'default-user',
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast retrieval by user
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp DESC);

-- Summaries table: stores current summary
CREATE TABLE IF NOT EXISTS summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL DEFAULT 'default-user' UNIQUE,
  current_summary TEXT NOT NULL,
  message_count INTEGER NOT NULL DEFAULT 0,
  last_summarized_at BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Function to create messages table
CREATE OR REPLACE FUNCTION create_messages_table()
RETURNS VOID AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL DEFAULT 'default-user',
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    timestamp BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
  CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp DESC);
END;
$$ LANGUAGE plpgsql;

-- Function to create summaries table
CREATE OR REPLACE FUNCTION create_summaries_table()
RETURNS VOID AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL DEFAULT 'default-user' UNIQUE,
    current_summary TEXT NOT NULL,
    message_count INTEGER NOT NULL DEFAULT 0,
    last_summarized_at BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
END;
$$ LANGUAGE plpgsql;
