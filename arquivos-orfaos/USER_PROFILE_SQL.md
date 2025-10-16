# 👤 SQL para Perfil de Usuário - Execute no Supabase

```sql
-- Tabela de perfis de usuário
CREATE TABLE user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text UNIQUE NOT NULL,
  name text,
  profession text,
  web3_experience text CHECK (web3_experience IN ('beginner', 'intermediate', 'advanced', 'expert')),
  project_name text,
  bio text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Índices
CREATE INDEX idx_user_profiles_wallet ON user_profiles(wallet_address);
CREATE INDEX idx_user_profiles_experience ON user_profiles(web3_experience);

-- RLS (Row Level Security)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Allow public read access on user_profiles" ON user_profiles
  FOR SELECT USING (true);

CREATE POLICY "Allow users to insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow users to update their own profile" ON user_profiles
  FOR UPDATE USING (true);
```

Execute este SQL no Supabase SQL Editor!