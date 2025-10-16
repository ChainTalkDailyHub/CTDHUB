# 🗄️ Configuração do Banco de Dados Supabase

## 📋 Passo a Passo para Configurar Supabase

### 1. **Criar Conta no Supabase**
- Acesse [https://supabase.com](https://supabase.com)
- Clique em "Start your project"
- Faça login com GitHub ou crie uma conta

### 2. **Criar Novo Projeto**
- Clique em "New Project"
- Escolha uma organização (ou crie uma)
- Preencha:
  - **Name**: ctdhub-courses
  - **Database Password**: (escolha uma senha forte)
  - **Region**: escolha a região mais próxima

### 3. **Obter Credenciais**
Após criar o projeto:
- Vá em **Settings** → **API**
- Copie:
  - **Project URL** 
  - **anon public** key

### 4. **Configurar Variáveis de Ambiente**
Crie o arquivo `.env.local` na raiz do projeto:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

### 5. **Criar Tabelas do Banco**
No Supabase Dashboard:
- Vá em **SQL Editor**
- Cole e execute este código:

```sql
-- Tabela de cursos
CREATE TABLE courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  author text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  total_videos integer DEFAULT 0
);

-- Tabela de vídeos do curso
CREATE TABLE course_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  youtube_url text NOT NULL,
  thumbnail text,
  order_index integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_courses_author ON courses(author);
CREATE INDEX idx_courses_updated_at ON courses(updated_at);
CREATE INDEX idx_course_videos_course_id ON course_videos(course_id);
CREATE INDEX idx_course_videos_order ON course_videos(course_id, order_index);

-- Habilitar Row Level Security (RLS)
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_videos ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso (permitir leitura para todos)
CREATE POLICY "Allow public read access on courses" ON courses
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access on course_videos" ON course_videos
  FOR SELECT USING (true);

-- Permitir inserção para usuários autenticados (ou todos por enquanto)
CREATE POLICY "Allow public insert on courses" ON courses
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public insert on course_videos" ON course_videos
  FOR INSERT WITH CHECK (true);
```

### 6. **Testar a Configuração**
Após configurar:
1. Reinicie o servidor de desenvolvimento
2. Acesse `/dev` e tente criar um curso
3. Verifique se o curso aparece no Supabase Dashboard → **Table Editor**

## 🎯 **Vantagens do Supabase:**

✅ **Gratuito**: Até 500MB de dados e 2 projetos  
✅ **Real-time**: Atualizações em tempo real  
✅ **API REST**: Gerada automaticamente  
✅ **Dashboard**: Interface visual para gerenciar dados  
✅ **Backup**: Backup automático dos dados  
✅ **Escalável**: Cresce com seu projeto  

## 🔄 **Fallback Automático**
Se o Supabase não estiver configurado, o sistema automaticamente usa o armazenamento local em arquivos (como estava antes).

## 🚀 **Deploy com Supabase**
Quando fizer deploy no Netlify, adicione as variáveis de ambiente:
- Netlify Dashboard → Site Settings → Environment Variables
- Adicione `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## ❓ **Problemas Comuns:**

**Erro "Missing Supabase environment variables"**
→ Verifique se criou o `.env.local` com as variáveis corretas

**Erro "Failed to save course to database"**  
→ Verifique se executou o SQL de criação das tabelas

**Cursos não aparecem**
→ Verifique as políticas RLS no Supabase Dashboard