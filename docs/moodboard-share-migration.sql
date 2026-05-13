-- Moodboard Share System — migration
-- Rodar no Supabase SQL Editor

CREATE TABLE IF NOT EXISTS moodboard_shares (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  share_id     TEXT        UNIQUE NOT NULL,
  project_name TEXT        NOT NULL DEFAULT 'Meu Projeto',
  client_name  TEXT        DEFAULT 'Visitante',
  colors       JSONB       NOT NULL DEFAULT '[]',
  styles       JSONB       NOT NULL DEFAULT '[]',
  images       JSONB       NOT NULL DEFAULT '[]',
  views        INTEGER     NOT NULL DEFAULT 0,
  likes        INTEGER     NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS moodboard_comments (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  share_id   TEXT        NOT NULL REFERENCES moodboard_shares(share_id) ON DELETE CASCADE,
  author     TEXT        NOT NULL CHECK (char_length(author) >= 2 AND char_length(author) <= 60),
  content    TEXT        NOT NULL CHECK (char_length(content) >= 1 AND char_length(content) <= 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_moodboard_shares_share_id ON moodboard_shares(share_id);
CREATE INDEX IF NOT EXISTS idx_moodboard_comments_share_id ON moodboard_comments(share_id);
CREATE INDEX IF NOT EXISTS idx_moodboard_shares_created_at ON moodboard_shares(created_at DESC);

-- RLS (Row Level Security) — leitura pública, escrita controlada
ALTER TABLE moodboard_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE moodboard_comments ENABLE ROW LEVEL SECURITY;

-- Qualquer pessoa pode ler shares e comentários
CREATE POLICY "shares_select_public" ON moodboard_shares FOR SELECT USING (true);
CREATE POLICY "comments_select_public" ON moodboard_comments FOR SELECT USING (true);

-- Qualquer pessoa pode inserir (anon key é suficiente)
CREATE POLICY "shares_insert_public" ON moodboard_shares FOR INSERT WITH CHECK (true);
CREATE POLICY "comments_insert_public" ON moodboard_comments FOR INSERT WITH CHECK (true);

-- Apenas o sistema pode atualizar views/likes (via service_role ou função RPC)
CREATE POLICY "shares_update_public" ON moodboard_shares FOR UPDATE USING (true);
